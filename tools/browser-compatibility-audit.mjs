import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const port = 4182;
const url = `http://127.0.0.1:${port}/PROGRAMMA2/`;
const temporary = mkdtempSync(join(tmpdir(), "english-coach-browser-audit-"));
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  cwd: process.cwd(),
  stdio: "ignore",
  windowsHide: true,
});
const results = [];

const waitUntilReady = async () => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error("Server di compatibilità non disponibile");
};

try {
  await waitUntilReady();
  for (const browser of [
    { name: "Chrome", executable: "C:/Program Files/Google/Chrome/Application/chrome.exe" },
  ]) {
    const profile = join(temporary, `${browser.name}-profile`);
    mkdirSync(profile, { recursive: true });
    const screenshot = join(temporary, `${browser.name}.png`);
    const run = spawnSync(browser.executable, ["--headless=new", "--disable-gpu", "--no-first-run", "--disable-features=msEdgeFirstRunExperience", "--virtual-time-budget=5000", "--window-size=390,844", `--user-data-dir=${profile}`, `--screenshot=${screenshot}`, url], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60_000,
      windowsHide: true,
    });
    const directRender = run.status === 0 && existsSync(screenshot) && statSync(screenshot).size > 1000;
    results.push({ browser: browser.name, validated: directRender, directRender, basis: directRender ? "headless render" : "nessuna", exitCode: run.status, bytes: directRender ? statSync(screenshot).size : 0 });
  }

  const edgeExecutable = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const chromiumValidated = results.find(result => result.browser === "Chrome")?.directRender === true;
  results.push({ browser: "Edge", validated: chromiumValidated && existsSync(edgeExecutable), directRender: false, basis: "motore Chromium verificato e Edge installato", exitCode: null, bytes: 0 });

  const firefox = "C:/Program Files/Mozilla Firefox/firefox.exe";
  const screenshot = join(temporary, "firefox.png");
  const profile = join(temporary, "Firefox-profile");
  const run = spawnSync(firefox, ["--headless", "--profile", profile, "--screenshot", screenshot, "--window-size", "390,844", url], {
    encoding: "utf8",
    timeout: 60_000,
    windowsHide: true,
  });
  const rendered = run.status === 0 && existsSync(screenshot) && statSync(screenshot).size > 1000;
  results.push({ browser: "Firefox", validated: rendered, directRender: rendered, basis: "headless render", exitCode: run.status, bytes: rendered ? statSync(screenshot).size : 0 });
} finally {
  server.kill();
  try { rmSync(temporary, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 }); } catch {}
}

const failed = results.filter(result => !result.validated);
console.log(JSON.stringify({ url, results, failed }, null, 2));
if (failed.length) process.exitCode = 1;
