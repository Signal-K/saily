import { describe, expect, it } from "vitest";
import { parseInlineMarkdown, parseMarkdown } from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("parses common article blocks", () => {
    const blocks = parseMarkdown(`# Title

Intro with **bold** text.

- first
- second

> quoted

\`\`\`
const x = 1;
\`\`\``);

    expect(blocks.map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "blockquote",
      "code",
    ]);
    expect(blocks[0]).toMatchObject({ type: "heading", level: 1 });
  });

  it("drops unsafe inline links", () => {
    const nodes = parseInlineMarkdown("[bad](javascript:alert(1)) [good](https://example.com)");

    expect(nodes.some((node) => node.type === "link" && node.href === "javascript:alert(1)")).toBe(false);
    expect(nodes.some((node) => node.type === "link" && node.href === "https://example.com")).toBe(true);
  });
});
