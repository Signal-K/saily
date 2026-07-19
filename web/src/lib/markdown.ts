export type MarkdownInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: MarkdownInline[] }
  | { type: "emphasis"; children: MarkdownInline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; children: MarkdownInline[] }
  | { type: "image"; src: string; alt: string };

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; children: MarkdownInline[] }
  | { type: "paragraph"; children: MarkdownInline[] }
  | { type: "blockquote"; children: MarkdownInline[] }
  | { type: "list"; ordered: boolean; items: MarkdownInline[][] }
  | { type: "code"; code: string }
  | { type: "puzzle-widget" };

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

function findClosing(value: string, marker: string, start: number): number {
  let index = value.indexOf(marker, start);
  while (index !== -1 && value[index - 1] === "\\") {
    index = value.indexOf(marker, index + marker.length);
  }
  return index;
}

export function parseInlineMarkdown(value: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = [];
  let cursor = 0;

  const pushText = (text: string) => {
    if (text) {
      nodes.push({ type: "text", text: text.replace(/\\([\\`*_[\]()!])/g, "$1") });
    }
  };

  while (cursor < value.length) {
    const rest = value.slice(cursor);

    if (rest.startsWith("![") || rest.startsWith("[")) {
      const isImage = rest.startsWith("![");
      const labelStart = cursor + (isImage ? 2 : 1);
      const labelEnd = findClosing(value, "]", labelStart);
      const urlStart = labelEnd + 1;
      if (labelEnd !== -1 && value[urlStart] === "(") {
        const urlEnd = findClosing(value, ")", urlStart + 1);
        if (urlEnd !== -1) {
          const label = value.slice(labelStart, labelEnd);
          const href = value.slice(urlStart + 1, urlEnd).trim();
          if (isSafeUrl(href)) {
            if (isImage) {
              nodes.push({ type: "image", src: href, alt: label });
            } else {
              nodes.push({ type: "link", href, children: parseInlineMarkdown(label) });
            }
            cursor = urlEnd + 1;
            continue;
          }
        }
      }
    }

    if (rest.startsWith("`")) {
      const end = findClosing(value, "`", cursor + 1);
      if (end !== -1) {
        nodes.push({ type: "code", text: value.slice(cursor + 1, end) });
        cursor = end + 1;
        continue;
      }
    }

    if (rest.startsWith("**")) {
      const end = findClosing(value, "**", cursor + 2);
      if (end !== -1) {
        nodes.push({ type: "strong", children: parseInlineMarkdown(value.slice(cursor + 2, end)) });
        cursor = end + 2;
        continue;
      }
    }

    if (rest.startsWith("*")) {
      const end = findClosing(value, "*", cursor + 1);
      if (end !== -1) {
        nodes.push({ type: "emphasis", children: parseInlineMarkdown(value.slice(cursor + 1, end)) });
        cursor = end + 1;
        continue;
      }
    }

    const nextSpecial = ["![", "[", "`", "**", "*"]
      .map((marker) => value.indexOf(marker, cursor + 1))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b)[0];
    const next = nextSpecial ?? value.length;
    pushText(value.slice(cursor, next));
    cursor = next;
  }

  return nodes;
}

export function parseMarkdown(value: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    // A lone `{{puzzle}}` line embeds today's puzzle widget — CMS authors
    // insert this marker where they want it to appear in the article body.
    if (line.trim() === "{{puzzle}}") {
      blocks.push({ type: "puzzle-widget" });
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", code: code.join("\n") });
      index += 1;
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        children: parseInlineMarkdown(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    const list = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(line);
    if (list) {
      const ordered = /\d+\./.test(list[2]);
      const items: MarkdownInline[][] = [];
      while (index < lines.length) {
        const item = /^(\s*)([-*]|\d+\.)\s+(.+)$/.exec(lines[index]);
        if (!item || /\d+\./.test(item[2]) !== ordered) {
          break;
        }
        items.push(parseInlineMarkdown(item[3].trim()));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (line.startsWith(">")) {
      const parts: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        parts.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "blockquote", children: parseInlineMarkdown(parts.join(" ")) });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !/^(\s*)([-*]|\d+\.)\s+/.test(lines[index]) &&
      !lines[index].startsWith(">") &&
      !lines[index].startsWith("```")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseInlineMarkdown(paragraph.join(" ")) });
  }

  return blocks;
}
