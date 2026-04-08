#!/usr/bin/env node
// scripts/validate-narrative.mjs
// Validates storyline/character data integrity.
// Run from project root: node scripts/validate-narrative.mjs
// Or via: cd web && npx vite-node ../scripts/validate-narrative.mjs
//
// Uses vite-node (bundled with vitest) to resolve TypeScript + @/ aliases.

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webDir = resolve(__dirname, "../web");

// Delegate to vite-node so we get TS + alias resolution
const inner = resolve(__dirname, "_validate-narrative-inner.mjs");

import { writeFileSync, unlinkSync } from "fs";

const innerScript = `
import { STORYLINES } from "@/lib/storylines";
import { CHARACTERS } from "@/lib/characters";

const REQUIRED = ["briefing", "beat1", "beat2", "resolution"];
const VALID_EXPR = ["neutral", "happy", "sad", "surprised", "serious"];
const VALID_AMB = ["wind", "ship", "lab", "none", undefined];

let errors = 0;
const fail = (msg) => { console.error("  ✗ " + msg); errors++; };
const pass = (msg) => console.log("  ✓ " + msg);

console.log("\\n=== Saily Narrative Validation ===\\n");

if (STORYLINES.length !== 4) fail("Expected 4 storylines, got " + STORYLINES.length);
else pass("4 storylines present");

for (const s of STORYLINES) {
  console.log("\\nStoryline: " + s.id + " — \\"" + s.title + "\\"");
  if (!CHARACTERS[s.characterId]) fail("characterId \\"" + s.characterId + "\\" not in CHARACTERS");
  else pass("character exists");
  if (!s.postcardTitle?.trim()) fail("postcardTitle empty"); else pass("postcardTitle ok");
  if (!s.postcardMessage?.trim()) fail("postcardMessage empty"); else pass("postcardMessage ok");
  if (s.chapters.length < 5) fail(s.chapters.length + " chapters (need ≥5)");
  else pass(s.chapters.length + " chapters");

  s.chapters.forEach((ch, i) => {
    if (ch.index !== i) fail("ch" + i + ": index=" + ch.index + " expected " + i);
    for (const f of REQUIRED) {
      if (!ch[f]?.trim()) fail("ch" + i + ": \\"" + f + "\\" is empty");
    }
    for (const ef of ["briefingExpression","beat1Expression","beat2Expression","resolutionExpression"]) {
      if (ch[ef] !== undefined && !VALID_EXPR.includes(ch[ef]))
        fail("ch" + i + ": " + ef + " \\"" + ch[ef] + "\\" invalid");
    }
    if (!VALID_AMB.includes(ch.ambience))
      fail("ch" + i + ": ambience \\"" + ch.ambience + "\\" invalid");
  });
}

console.log("\\nCharacters:");
for (const [id, c] of Object.entries(CHARACTERS)) {
  if (!c.avatarSeed?.trim()) fail(id + ": avatarSeed empty");
  else pass(id + ": avatarSeed ok");
  if (!c.name?.trim()) fail(id + ": name empty");
  if (!c.occupation?.trim()) fail(id + ": occupation empty");
}

console.log("\\n" + "=".repeat(36));
if (errors > 0) {
  console.error("\\n✗ " + errors + " error(s). Fix before merging.\\n");
  process.exit(1);
} else {
  console.log("\\n✓ All narrative checks passed.\\n");
}
`;

const tmpFile = resolve(webDir, "_validate-narrative-tmp.ts");
writeFileSync(tmpFile, innerScript);

try {
  execSync(`npx vite-node ${tmpFile}`, {
    cwd: webDir,
    stdio: "inherit",
  });
} finally {
  try { unlinkSync(tmpFile); } catch {}
}
