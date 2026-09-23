import fs from "node:fs";

const index = fs.readFileSync("public/technics-mobile/index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("public/technics-mobile/version.json", "utf8"));
const inventory = fs.readFileSync("public/technics-mobile/modules/inventory-availability-1.9.307.js", "utf8");

const checks = [
  ["meta version", index.includes('content="1.9.350"')],
  ["boot version", index.includes('const build="1.9.350"')],
  ["current version label", index.includes('const CURRENT_VERSION_LABEL="Versione 1.9.350"')],
  ["app version", index.includes('const APP_VERSION="1.9.350"')],
  ["manifest version", manifest.version === "1.9.350"],
  ["manifest build", manifest.build === "inventory-commitment-no-legacy-firstpaint"],
  ["no legacy initial render", !inventory.includes("renderSummary(item,{...summary,free:null,committed:null},false)")],
  ["blank first paint", inventory.includes("renderSummary(item,{total:null,free:null,committed:null,unit:summary.unit},false)")],
  ["fresh native still required", inventory.includes("loadNativeCommitmentItem(item).then")],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(JSON.stringify({ ok: false, failed: failed.map(([name]) => name) }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, version: manifest.version, checks: checks.length }, null, 2));
