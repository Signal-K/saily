import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const targetDirs = ["web/src", "web/public"];
const patterns = [
  /placeholder/gi,
  /boilerplate/gi,
  /real content lands later/gi,
  /names and bylines/gi,
  /coming-soon/gi,
  /launching soon/gi,
  /your@email/gi,
  /TODO/gi,
];

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (path.includes("/node_modules/") || path.includes("/.next/")) continue;
    if (entry.isDirectory()) {
      files.push(...walk(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

const matches = [];
for (const dir of targetDirs) {
  for (const file of walk(join(root, dir))) {
    if (!/\.(tsx?|jsx?|json|xml|md|html|css)$/.test(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      if (patterns.some((pattern) => pattern.test(line))) {
        matches.push({
          file: relative(root, file),
          line: index + 1,
          text: line.trim(),
        });
      }
      patterns.forEach((pattern) => {
        pattern.lastIndex = 0;
      });
    });
  }
}

for (const match of matches) {
  console.log(`${match.file}:${match.line}: ${match.text}`);
}
