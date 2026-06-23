#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
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

if (failures.length > 0) {
  console.error("CMS validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("CMS validation passed.");
