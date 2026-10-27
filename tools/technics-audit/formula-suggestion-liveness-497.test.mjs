// Original9 suggestion case bodies from the36-case suite, unchanged. Synthetic boundaries only; not Chrome/network.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath}from 'node:url';
const sourcePath=process.argv[2]?path.resolve(process.argv[2]):path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../public/technics-mobile/modules/formulas-1.8.88.js');
const sourceBytes=fs.readFileSync(sourcePath);assert(sourceBytes.length<256000&&sourcePath.endsWith('.js'));
const source=sourceBytes.toString('utf8');
function actualSuggestionFixture(){
 const hs=source.indexOf('  const esc = '),he=source.indexOf('  const api = ',hs),ss=source.indexOf('  const suggestions = section.querySelector('),se=source.indexOf('  suggestions.addEventListener("click"',ss);
 assert(hs>=0&&he>hs&&ss>he&&se>ss,'ACTUAL_SUGGESTION_LISTENER_REQUIRED');
 const timers=new Map(),pending=[],calls=[];let serial=0,listener;
 const classes=new Set(['hidden']),suggestions={innerHTML:'',classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)}};
 const input={value:'',addEventListener(type,fn){assert.equal(type,'input');listener=fn;}};
 const document={createElement(tag){assert.equal(tag,'div');let text='';return{set textContent(v){text=String(v)},get innerHTML(){return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}};}};
 const context=vm.createContext({document,section:{querySelector(selector){assert.equal(selector,'[data-formula-suggestions]');return suggestions;}},form:{elements:{code:input}},setTimeout(fn,ms){assert.equal(ms,220);timers.set(++serial,fn);return serial;},clearTimeout(id){timers.delete(id);},api(url,quiet){assert.equal(quiet,true);assert(url.startsWith('/api/formulas/suggest?q='));calls.push(url);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});pending.push({resolve,reject});return promise;}});
 vm.runInContext(source.slice(hs,he)+source.slice(ss,se)+'\nglobalThis.closeActualSuggestions=closeSuggestions;',context,{timeout:300});
 return{calls,pending,type(value){input.value=value;listener();},start(){const next=timers.entries().next().value;assert(next,'PENDING_REAL_INPUT_TIMER_REQUIRED');timers.delete(next[0]);return next[1]();},close(){context.closeActualSuggestions();},get html(){return suggestions.innerHTML},get hidden(){return classes.has('hidden')}};
}
const suggestion=code=>({suggestions:[{code,description:'Description '+code,active:true}]});
test('Actual suggestions: late old failure cannot erase newer successful results',async()=>{const f=actualSuggestionFixture();f.type('olio');const old=f.start();f.type('oliva');const next=f.start();f.pending[1].resolve(suggestion('NEW'));await next;const html=f.html;f.pending[0].reject(Error('old failed'));await old;assert.equal(f.html,html);assert.equal(f.hidden,false);assert(f.html.includes('NEW'));});
test('Actual suggestions: shortening the input invalidates an already running result',async()=>{const f=actualSuggestionFixture();f.type('olio');const job=f.start();f.type('o');f.pending[0].resolve(suggestion('STALE'));await job;assert.equal(f.hidden,true);assert.equal(f.html,'');});
test('Actual suggestions: explicit close invalidates an already running result',async()=>{const f=actualSuggestionFixture();f.type('olio');const job=f.start();f.close();f.pending[0].resolve(suggestion('STALE'));await job;assert.equal(f.hidden,true);assert.equal(f.html,'');});
test('Actual suggestions: known 409 refinement is shown instead of silent disappearance',async()=>{const f=actualSuggestionFixture();f.type('olio');const job=f.start();f.pending[0].reject(Object.assign(Error('Lettura formule non disponibile.'),{status:409,reason:'Risultato incompleto: restringere la ricerca.'}));await job;assert.equal(f.hidden,false);assert(f.html.includes('Risultato incompleto: restringere la ricerca.'));});
test('Actual suggestions: current transport error stays explicit without claiming missing documents',async()=>{const f=actualSuggestionFixture();f.type('oliva');const job=f.start();f.pending[0].reject(Error('offline'));await job;assert.equal(f.hidden,false);assert(f.html.includes('Suggerimenti temporaneamente non disponibili.'));assert(!f.html.includes('archivio non qualificato'));});
test('Actual suggestions: stale success still cannot replace a newer result',async()=>{const f=actualSuggestionFixture();f.type('olio');const old=f.start();f.type('oliva');const next=f.start();f.pending[1].resolve(suggestion('NEW'));await next;const html=f.html;f.pending[0].resolve(suggestion('OLD'));await old;assert.equal(f.html,html);assert.equal(f.hidden,false);});
test('Actual suggestions: empty successful result preserves the existing empty message',async()=>{const f=actualSuggestionFixture();f.type('oliva');const job=f.start();f.pending[0].resolve({suggestions:[]});await job;assert.equal(f.hidden,false);assert(f.html.includes('Nessuna formula corrispondente.'));});
test('Actual suggestions: clearing input prevents a late failure message from returning',async()=>{const f=actualSuggestionFixture();f.type('oliva');const job=f.start();f.type('');f.pending[0].reject(Error('late offline'));await job;assert.equal(f.hidden,true);assert.equal(f.html,'');});
test('Actual suggestions: a successful search recovers after a displayed error',async()=>{const f=actualSuggestionFixture();f.type('oliva');const first=f.start();f.pending[0].reject(Error('offline'));await first;f.type('olivato');const second=f.start();f.pending[1].resolve(suggestion('RECOVERED'));await second;assert.equal(f.hidden,false);assert(f.html.includes('RECOVERED'));assert(!f.html.includes('temporaneamente'));});
