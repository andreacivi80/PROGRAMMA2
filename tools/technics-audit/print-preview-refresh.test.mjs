// Closed VM regression of the four CURRENT repository sources; no private baseline or service access.
// Historical public health is replayed; document/snapshot/page data are explicitly synthetic.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

assert.equal(typeof vm.SourceTextModule, 'function', 'Use the separate run-vm-tests.mjs with node --experimental-vm-modules.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const moduleSource = name => fs.readFileSync(path.join(root, 'public/technics-mobile/modules', name), 'utf8');
const callerText = moduleSource('print-caller446.js');
const bindingText = moduleSource('print-backend446-binding.js');
const qualifierText = moduleSource('PlanningDispatchBinding449.js');
const customerText = moduleSource('customer-standard-browser-client.js');
const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/print-preview-refresh-health-and-synthetic-preview.json', import.meta.url), 'utf8'));
const origin = 'https://technics-mobile-gateway.andreacivi80.workers.dev';
const selection = {clientIds:[8785], includeZeroStock:false, printerTarget:'corridor'};
const sample = route => fixture.historicalHealth.rows.find(row => row.path === route);

async function exercise({
  delay=23000, refreshDelay=0, refreshFailure=false, missingReserve=false,
  changedPrimary=false, wrongTarget=false, wrongTrace=false, wrongHash=false,
  wrongImageOwner=false, wrongImageRequestId=false, blockedSend=false,
}={}) {
  let clock=0, health=0, posts=0, images=0, storageWrites=0, refreshDelayUsed=false;
  const calls=[];
  const raw = async (url, options={}) => {
    const u=new URL(url), method=options.method || 'GET';
    assert.equal(u.origin, origin, 'CLOSED_TRANSPORT_ORIGIN_ONLY');
    const requestId=new Headers(options.headers).get('X-Technics-Request-Id');
    calls.push({method, path:u.pathname});
    let original, body, headers;
    if (['/__gateway/status','/health/nodes','/health/ready'].includes(u.pathname) && method==='GET') {
      health++;
      if (health>4 && refreshFailure) throw Object.assign(Error('SIMULATED_REFRESH_FAILURE'), {code:'SIMULATED_REFRESH_FAILURE'});
      if (health>4 && refreshDelay && !refreshDelayUsed) {clock+=refreshDelay; refreshDelayUsed=true;}
      original=sample(u.pathname);
      assert(original, 'HISTORICAL_HEALTH_FIXTURE_REQUIRED');
      body=structuredClone(original.body);
      if (health>4 && missingReserve && Array.isArray(body.nodes)) body.nodes=body.nodes.filter(n=>n.nodeId!=='technics-utente38-secondary');
      if (health>4 && changedPrimary && body.planning445EffectiveAdmission) body.planning445EffectiveAdmission.primaryBackendInstanceId='33333333-3333-4333-8333-333333333333';
    } else if (u.pathname==='/api/inventory/clients/print-preview' && method==='POST') {
      posts++;
      assert.equal(posts, 1, 'NEVER_REPEAT_PREVIEW_POST');
      assert.deepEqual(JSON.parse(options.body), selection);
      clock=delay;
      original=fixture.syntheticPreview;
      body=structuredClone(original.body);
      if (wrongTarget) body.printerTarget='warehouse';
      if (wrongHash) body.snapshotHash='invalid';
    } else if (u.pathname==='/api/inventory/clients/print-preview-image' && method==='GET') {
      images++;
      headers=new Headers(fixture.syntheticPreview.headers);
      headers.set('content-type','image/svg+xml');
      headers.set('x-technics-request-id', wrongImageRequestId ? '33333333-3333-4333-8333-333333333333' : requestId);
      if (wrongImageOwner) headers.set('x-technics-node','technics-utente73-primary');
      return new Response(fixture.syntheticPreview.image, {status:200, headers});
    } else {
      throw Error('FORBIDDEN_ROUTE:'+method+u.pathname);
    }
    headers=new Headers(original.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    if (body.meta) {body.meta.requestId=requestId; headers.set('x-technics-request-id', requestId);}
    if (wrongTrace && original===fixture.syntheticPreview) headers.set('x-technics-node','technics-utente73-primary');
    return new Response(JSON.stringify(body), {status:original.status, headers});
  };
  const forbidStorage = () => {storageWrites++; throw Error('STORAGE_WRITE_FORBIDDEN');};
  const storage={length:0, key:()=>null, getItem:()=>null, setItem:forbidStorage, removeItem:forbidStorage, clear:forbidStorage};
  const context=vm.createContext({
    URL, Headers, Request, Response, Blob, TextEncoder, TextDecoder,
    crypto:crypto.webcrypto, performance:{now:()=>clock}, localStorage:storage,
    __technicsBridgeUrl:origin,
    location:{href:'https://andreacivi80.github.io/PROGRAMMA2/technics-mobile/'},
    TechnicsTransport:{fetch:raw}, fetch:raw,
  });
  const binding=new vm.SourceTextModule(qualifierText, {context, identifier:'PlanningDispatchBinding449.js?v=1.9.493'});
  await binding.link(()=>{throw Error('UNEXPECTED_IMPORT');});
  await binding.evaluate();
  vm.runInContext(bindingText, context, {filename:'actual-print-backend446-binding.js'});
  vm.runInContext(callerText, context, {
    filename:'actual-print-caller446.js',
    importModuleDynamically:async specifier=>{
      assert.equal(specifier, './PlanningDispatchBinding449.js?v=1.9.493');
      return binding;
    },
  });
  vm.runInContext(customerText, context, {filename:'actual-customer-standard-browser-client.js'});
  const session=context.TechnicsCustomerStandardPrint.createSession('customer', {baseUrl:origin});
  let result, error, sendError;
  try {result=await session.preview(selection);} catch (e) {error={message:e.message, code:e.code};}
  if (blockedSend && !error) {
    // Exercise the actual caller's denial only. Raw transport cannot accept any /print route.
    try {await context.TechnicsTransport.fetch(origin+'/api/inventory/clients/print', {method:'POST', headers:{'Content-Type':'application/json'}, body:'{}'});}
    catch (e) {sendError={message:e.message, code:e.code};}
  }
  const outcome={
    health, posts, images, storageWrites, calls, error, sendError,
    result:result ? {pageCount:result.pageCount, target:result.printerTarget, nodeId:result.nodeId, pages:result.pages.length, ready:session.ready()} : null,
  };
  assert.equal(storageWrites, 0, 'NO_STORAGE_OR_INTENT_WRITE');
  assert.equal(calls.filter(c=>c.method==='POST' && c.path.endsWith('/print')).length, 0, 'NO_RAW_PRINT_POST');
  return outcome;
}

test('current caller: one-second generation retains fresh health and four pages', async()=>{
  const r=await exercise({delay:1000});
  assert.equal(r.error, undefined); assert.equal(r.health, 4);
  assert.equal(r.posts, 1); assert.equal(r.images, 4); assert.equal(r.result.ready, false);
});
test('current caller: five-second generation rechecks shorter producer heartbeat expiry', async()=>{
  const r=await exercise({delay:5000});
  assert.equal(r.error, undefined); assert.equal(r.health, 8);
  assert.equal(r.posts, 1); assert.equal(r.images, 4); assert.equal(r.result.ready, false);
});
test('current caller: 23-second generation requalifies without repeating preview POST', async()=>{
  const r=await exercise();
  assert.equal(r.error, undefined); assert.equal(r.health, 8);
  assert.equal(r.posts, 1); assert.equal(r.images, 4);
  assert.equal(r.result.nodeId, 'technics-utente38-secondary'); assert.equal(r.result.ready, false);
});
for (const delay of [-1, NaN]) test('current caller: invalid or backwards monotonic clock '+delay, async()=>{
  const r=await exercise({delay});
  assert(r.error); assert.equal(r.posts, 1); assert.equal(r.images, 0);
});
test('current caller: a 16-second fresh qualification still fails the 15-second bound', async()=>{
  const r=await exercise({refreshDelay:16000});
  assert.equal(r.error?.code, 'PRINT245_READ_REFRESH_DEADLINE'); assert.equal(r.posts, 1); assert.equal(r.images, 0);
});
test('current caller: failed identity refresh is not retried', async()=>{
  const r=await exercise({refreshFailure:true});
  assert.equal(r.error?.code, 'SIMULATED_REFRESH_FAILURE'); assert.equal(r.health, 5);
  assert.equal(r.posts, 1); assert.equal(r.images, 0);
});
for (const key of ['missingReserve','changedPrimary']) test('current caller: changed qualification '+key, async()=>{
  const r=await exercise({[key]:true});
  assert.equal(r.error?.message, 'PLANNING_GATEWAY245_LIVE_QUALIFICATION_REQUIRED_NO_FALLBACK');
  assert.equal(r.posts, 1); assert.equal(r.images, 0);
});
for (const key of ['wrongTarget','wrongTrace','wrongHash']) test('current caller: frozen preview check '+key, async()=>{
  const r=await exercise({[key]:true});
  assert(r.error); assert.equal(r.posts, 1); assert.equal(r.images, 0);
});
test('current caller: image from a different owner is rejected', async()=>{
  const r=await exercise({wrongImageOwner:true});
  assert.equal(r.error?.code, 'PRINT_OWNER_CHANGED'); assert.equal(r.posts, 1); assert.equal(r.images, 1);
});
test('current caller: image with a mismatched request trace is rejected', async()=>{
  const r=await exercise({wrongImageRequestId:true});
  assert.equal(r.error?.code, 'PRINT_TRACE_INVALID'); assert.equal(r.posts, 1); assert.equal(r.images, 1);
});
test('current caller: NO_SEND245 rejects before any raw print or storage write', async()=>{
  const r=await exercise({blockedSend:true});
  assert.equal(r.error, undefined); assert.equal(r.sendError?.code, 'PRINT245_READ_ONLY_NO_SEND');
  assert.equal(r.posts, 1); assert.equal(r.images, 4); assert.equal(r.storageWrites, 0);
});
