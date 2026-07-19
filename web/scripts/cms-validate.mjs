#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "src/lib/cms.ts",
  "src/lib/markdown.ts",
  "src/components/markdown-content.tsx",
  "src/app/articles/page.tsx",
  "src/app/articles/[slug]/page.tsx",
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) {
    failures.push(`missing ${file}`);
  }
}

const articlePagePath = resolve(root, "src/app/articles/[slug]/page.tsx");
if (existsSync(articlePagePath)) {
  const articlePage = readFileSync(articlePagePath, "utf8");
  if (!articlePage.includes("MarkdownContent") || !articlePage.includes("parseMarkdown")) {
    failures.push("article detail page is not using the CMS Markdown renderer");
  }
}

const cmsLibPath = resolve(root, "src/lib/cms.ts");
if (existsSync(cmsLibPath)) {
  const cmsLib = readFileSync(cmsLibPath, "utf8");
  if (!cmsLib.includes("cms_articles")) {
    failures.push("CMS library is not reading the cms_articles collection");
  }
}

const articlesDir = resolve(root, "content/articles");
if (existsSync(articlesDir)) {
  const slugs = new Set();
  for (const file of readdirSync(articlesDir).filter((entry) => entry.endsWith(".md") && entry !== "README.md")) {
    const content = readFileSync(resolve(articlesDir, file), "utf8");
    const frontmatterEnd = content.indexOf("\n---\n", 4);
    if (!content.startsWith("---\n") || frontmatterEnd === -1) {
      failures.push(`${file} is missing frontmatter`);
      continue;
    }
    const frontmatter = content.slice(4, frontmatterEnd);
    const fields = Object.fromEntries(
      frontmatter
        .split("\n")
        .map((line) => {
          const separator = line.indexOf(":");
          return separator === -1 ? null : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
        })
        .filter(Boolean),
    );
    for (const field of ["slug", "title", "status", "summary", "publishedAt"]) {
      if (!fields[field]) failures.push(`${file} is missing ${field}`);
    }
    if (fields.status !== "published") {
      failures.push(`${file} is not published`);
    }
    if (fields.slug) {
      if (slugs.has(fields.slug)) failures.push(`${file} duplicates slug ${fields.slug}`);
      slugs.add(fields.slug);
    }
    if (!content.slice(frontmatterEnd + 5).trim()) {
      failures.push(`${file} has an empty article body`);
    }
  }
}

if (failures.length > 0) {
  console.error("CMS validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("CMS validation passed.");
