import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const publicRoot = resolve("public");
const audioRoot = join(publicRoot, "audio");
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) files.push({
      path: relative(publicRoot, full).split(sep).join("/"),
      bytes: statSync(full).size,
    });
  }
}

walk(audioRoot);
files.sort((left, right) => left.path.localeCompare(right.path));
writeFileSync(
  join(publicRoot, "offline-audio.json"),
  `${JSON.stringify({ version: 1, files: files.map(file => file.path), bytes: files.reduce((sum, file) => sum + file.bytes, 0) })}\n`,
);
console.log(`Offline audio: ${files.length} file, ${(files.reduce((sum, file) => sum + file.bytes, 0) / 1024 / 1024).toFixed(1)} MB`);
