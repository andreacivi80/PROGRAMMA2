import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const port = 4197;
const expectedCache = `english-coach-v${JSON.parse(readFileSync("package.json", "utf8")).version.split(".").slice(0, 2).join("")}`;
const base = `http://127.0.0.1:${port}/PROGRAMMA2/`;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  cwd: process.cwd(), stdio: "ignore", windowsHide: true,
});
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const request = async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { "cache-control": "no-cache" } });
  const body = new Uint8Array(await response.arrayBuffer());
  return { status: response.status, type: response.headers.get("content-type") ?? "", bytes: body.length, hash: createHash("sha256").update(body).digest("hex"), text: new TextDecoder().decode(body) };
};
const waitUntilReady = async () => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(base)).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Server black-box non disponibile");
};

try {
  await waitUntilReady();
  const home = await request(base);
  check(home.status === 200 && home.type.includes("text/html"), "La pagina iniziale non risponde come HTML");
  const paths = [...home.text.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => new URL(match[1], base).href);
  check(paths.length >= 5, "La pagina espone troppo poche risorse verificabili");
  const resources = await Promise.all(paths.map(request));
  resources.forEach((resource, index) => {
    check(resource.status === 200, `Risorsa non disponibile: ${paths[index]} (${resource.status})`);
    check(resource.bytes > 20, `Risorsa vuota o tronca: ${paths[index]}`);
  });
  const manifest = await request(new URL("manifest.webmanifest", base).href);
  const serviceWorker = await request(new URL("sw.js", base).href);
  check(manifest.status === 200 && manifest.text.includes("English Coach"), "Manifest non valido");
  check(serviceWorker.status === 200 && serviceWorker.text.includes(expectedCache), `Service worker non allineato a ${expectedCache}`);

  const entryUrl = paths.find(path => /assets\/index-[^/]+\.js/.test(path));
  check(Boolean(entryUrl), "Bundle principale non individuato");
  if (entryUrl) {
    const burst = await Promise.all(Array.from({ length: 100 }, () => request(`${entryUrl}?stress=${Math.random()}`)));
    check(burst.every(item => item.status === 200), "Almeno una delle 100 richieste simultanee è fallita");
    check(new Set(burst.map(item => item.hash)).size === 1, "Il bundle cambia tra richieste identiche");
    check(burst.every(item => item.bytes === burst[0].bytes), "Il bundle viene restituito con dimensioni incoerenti");
  }
  const refreshes = await Promise.all(Array.from({ length: 30 }, (_, index) => request(`${base}?refresh=${index}`)));
  check(refreshes.every(item => item.status === 200 && item.hash === home.hash), "Il refresh restituisce una pagina incoerente");
  console.log(JSON.stringify({ engine: "D · resilienza black-box", server: "Vite Preview isolato", linkedResources: resources.length, simultaneousBundleRequests: 100, refreshes: 30, failures }, null, 2));
} finally {
  server.kill();
}
if (failures.length) process.exitCode = 1;
