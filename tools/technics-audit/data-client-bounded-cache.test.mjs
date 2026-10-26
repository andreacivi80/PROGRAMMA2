// Closed RAM regression of the CURRENT Technics DataClient, not a product hash gate.
// Synthetic responses/clock/DOM only; no network, browser, SQL, print, mail or operational storage.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createDataClientBoundedCacheCasesROOT} from './fixtures/data-client-bounded-cache-cases.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source=fs.readFileSync(path.join(root, 'public/technics-mobile/modules/data-client-1.9.290.js'), 'utf8');
const cases=await createDataClientBoundedCacheCasesROOT({
  vm,assert,source,Headers,Response,URL,AbortController,AbortSignal,structuredClone,ReadableStream,TextEncoder,TextDecoder,DOMException,
});
for(const item of cases) test('DataClient bounded cache: '+item.name, item.run);
