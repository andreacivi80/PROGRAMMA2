import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(".");
const sourceRoot = resolve("src");
const protectedFolders = ["public/gambe-leggere", "public/technics-mobile"];
const sourceFiles = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if ([".ts", ".tsx", ".css"].includes(extname(entry.name))) sourceFiles.push(full);
  }
};
walk(sourceRoot);

const reachable = new Set();
const resolveImport = (from, specifier) => {
  if (!specifier.startsWith(".")) return null;
  const base = resolve(dirname(from), specifier);
  const candidates = [base, ...[".ts", ".tsx", ".css"].map((extension) => `${base}${extension}`), ...[".ts", ".tsx", ".css"].map((extension) => join(base, `index${extension}`))];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};
const visit = (file) => {
  if (reachable.has(file)) return;
  reachable.add(file);
  const text = readFileSync(file, "utf8");
  const patterns = [/from\s+["']([^"']+)["']/g, /import\s*["']([^"']+)["']/g, /import\(\s*["']([^"']+)["']\s*\)/g];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const target = resolveImport(file, match[1]);
      if (target && target.startsWith(sourceRoot)) visit(target);
    }
  }
};
visit(resolve("src/main.tsx"));

const ownRuntimeFiles = ["src", "public/sw.js", "tools/offline-manifest.mjs", "package.json", "vite.config.ts"];
const runtimeText = ownRuntimeFiles.flatMap((item) => {
  const full = resolve(item);
  if (!existsSync(full)) return [];
  if (!readdirSafe(full)) return [readFileSync(full, "utf8")];
  const files = [];
  const collect = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const nested = join(directory, entry.name);
      if (entry.isDirectory()) collect(nested);
      else if (/\.(?:ts|tsx|css|js|mjs|json)$/i.test(entry.name)) files.push(readFileSync(nested, "utf8"));
    }
  };
  collect(full);
  return files;
}).join("\n");

function readdirSafe(path) {
  try { readdirSync(path); return true; } catch { return false; }
}

const unreachable = sourceFiles.filter((file) => !reachable.has(file)).map((file) => relative(root, file).replaceAll("\\", "/"));
const checks = {
  protectedFoldersPresent: protectedFolders.every((folder) => existsSync(resolve(folder))),
  protectedFoldersNotReferenced: protectedFolders.every((folder) => !runtimeText.includes(folder.split("/").at(-1))),
  everySourceFileReachable: unreachable.length === 0,
  offlineManifestScopedToAudio: readFileSync("tools/offline-manifest.mjs", "utf8").includes('const audioRoot = join(publicRoot, "audio")'),
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ protectedFolders, sourceFiles: sourceFiles.length, reachableFiles: reachable.size, unreachable, checks, failed }, null, 2));
if (failed.length) process.exitCode = 1;
