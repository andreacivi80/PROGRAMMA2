import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..','public','technics-mobile');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const moduleSource=fs.readFileSync(path.join(root,'modules','inventory-availability-1.9.307.js'),'utf8');
const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8'));

assert.equal(version.version,'1.9.351');
assert.equal(version.build,'inventory-commitment-zero-and-layout-qualified');
assert.match(index,/content="1\.9\.351"/);
assert.match(index,/const build="1\.9\.351"/);
assert.match(index,/CURRENT_VERSION_LABEL="Versione 1\.9\.351"/);
assert.match(index,/APP_VERSION="1\.9\.351"/);
assert.match(index,/inventory-availability-1\.9\.307\.js\?v=1\.9\.351/);
assert.doesNotMatch(moduleSource,/commitmentDetail\.rows\.length/);
assert.match(moduleSource,/Array\.isArray\(resolved\.commitmentDetail\?\.rows\)/);
assert.match(moduleSource,/location:String\(row\.location/);
assert.match(moduleSource,/!String\(row\.location\|\|''\)\.trim\(\)/);
assert.match(moduleSource,/row\.identitySignature\|\|\[row\.productionOrderId,row\.op,row\.ov,row\.lot,row\.location/);
assert.match(moduleSource,/renderSummary\(item,\{total:null,free:null,committed:null,unit:summary\.unit\},false\)/);

let inlineScripts=0;
for(const match of index.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=/.test(match[1]))continue;
  new Function(match[2]);
  inlineScripts+=1;
}
console.log(JSON.stringify({ok:true,version:version.version,checks:12,inlineScripts}));
