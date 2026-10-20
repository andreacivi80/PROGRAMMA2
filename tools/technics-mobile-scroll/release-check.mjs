// Additive report consumer. Does not launch tests, write canonical files, change versions or publish.
import assert from 'node:assert/strict';
import {MOBILE_WIDTHS,MOBILE_SCENARIOS} from './probe.mjs';

// SOURCE ONLY admission parameterization: legacy494/493 or next495/494, never an implicit future pass.
export function validateMobileScrollVersionBindingSOURCE({candidateVersion='1.9.494',baselineFrontendVersion='1.9.493',candidateRef,baselineRef,baselinePublicationRef}={}){
 const legacy=candidateVersion==='1.9.494'&&baselineFrontendVersion==='1.9.493';
 assert(legacy||(candidateVersion==='1.9.495'&&baselineFrontendVersion==='1.9.494'),'REVIEWED_MOBILE_VERSION_PAIR_REQUIRED');
 if(!legacy){
  for(const ref of [candidateRef,baselineRef,baselinePublicationRef]){assert(ref&&typeof ref.path==='string'&&ref.path.length>0);assert.match(ref.sha256,/^[a-f0-9]{64}$/);assert(Number.isSafeInteger(ref.bytes)&&ref.bytes>0);}
  assert.equal(baselineRef.sha256,'23fe85f516889e550945328863d66969def18c05a6090300a90bde22e5c0df9d');assert.equal(baselineRef.bytes,51342);
  assert.equal(baselinePublicationRef.sha256,'1be373c23eed4e88900fab7cca26907cc1774e59411479d3f92313960e1e53c6');assert.equal(baselinePublicationRef.bytes,79331);
  assert.notEqual(candidateRef.sha256,baselineRef.sha256,'CANDIDATE_MUST_NOT_REUSE_BASELINE_MANIFEST');
 }
 return{candidateVersion,baselineFrontendVersion,legacy};
}
export function validateMobileScrollReleaseReportSOURCE(report,{candidateAssetSetSha256,baselineAssetSetSha256,expectedTestRunId,expectedCandidateVersion='1.9.494',expectedBaselineFrontendVersion='1.9.493',expectedCandidateRef,expectedBaselineRef,expectedBaselinePublicationRef}={}){
 const versions=validateMobileScrollVersionBindingSOURCE({candidateVersion:expectedCandidateVersion,baselineFrontendVersion:expectedBaselineFrontendVersion,candidateRef:expectedCandidateRef,baselineRef:expectedBaselineRef,baselinePublicationRef:expectedBaselinePublicationRef});
 if(!versions.legacy){assert.deepEqual(report.candidateRef,expectedCandidateRef);assert.deepEqual(report.baselineRef,expectedBaselineRef);assert.deepEqual(report.baselinePublicationRef,expectedBaselinePublicationRef);assert.equal(report.candidateVersion,expectedCandidateVersion);assert.equal(baselineAssetSetSha256,'da6c4f6fcbb1a1026bea1d7d8c24aad051d752a6139c556ae64b71074c4d3401');assert.notEqual(candidateAssetSetSha256,baselineAssetSetSha256);}
 assert.equal(report.issuer,'ROOT');assert.equal(report.state,'ACTUAL_MOBILE_SCROLL_MATRIX_COMPLETED');
 assert.equal(report.testRunId,expectedTestRunId);assert.match(expectedTestRunId,/^[a-f0-9]{24}$/);assert.equal(report.authorExecutedSourceOnly,false);
 assert.equal(report.baselineFrontendVersion,expectedBaselineFrontendVersion);assert.equal(report.candidateAssetSetSha256,candidateAssetSetSha256);assert.match(candidateAssetSetSha256,/^[a-f0-9]{64}$/);assert.equal(report.baselineAssetSetSha256,baselineAssetSetSha256);assert.match(baselineAssetSetSha256,/^[a-f0-9]{64}$/);
 assert.equal(report.evidenceKind,'ACTUAL_HEADLESS_CHROME_CDP_TOUCH_NOT_PHYSICAL_ANDROID');assert.equal(report.actualMutationsForwarded,0);assert.equal(report.unobservedBrowserNetworkChannels,false);
 for(const key of ['physicalPrints','erpWrites','archiveWrites','realEmails','operationalSessionWrites'])assert.equal(report[key],0);
 assert.equal(report.userCacheOrSessionCleared,false);assert.equal(report.programmaticScrollUsedForTouchQualification,false);
 assert.equal(report.runs.length,MOBILE_WIDTHS.length);assert.deepEqual(report.runs.map(r=>r.viewportWidth).sort((a,b)=>a-b),[...MOBILE_WIDTHS]);
 const validTouch=(p,expectation)=>{
  assert.equal(p.status,'PASS');assert.equal(p.evidenceKind,'ACTUAL_HEADLESS_CHROME_CDP_TOUCH_NOT_PHYSICAL_ANDROID');assert.equal(p.expectation,expectation);
  assert.equal(p.gesture.source,'Input.dispatchTouchEvent');assert.equal(p.gesture.programmaticScrollUsed,false);assert(p.gesture.steps>=8);
  assert(p.before.maxTouchPoints>0);assert.equal(p.after.errors.length,p.before.errors.length);
  if(expectation==='root-scroll')assert(p.rootDelta>=12);if(expectation==='root-locked')assert(Math.abs(p.rootDelta)<=2);
  if(expectation==='widget-scroll'){assert(p.widgetDelta>=12);assert(Math.abs(p.rootDelta)<=2);}
 };
 for(const run of report.runs){
  assert.equal(run.loadedAssetSetSha256,candidateAssetSetSha256);assert.equal(run.actualInnerWidth,run.viewportWidth);assert.equal(run.mobileEmulation,true);assert.equal(run.hasTouch,true);assert.equal(run.headless,true);
  assert.equal(run.scenarios.length,MOBILE_SCENARIOS.length);assert.equal(new Set(run.scenarios.map(s=>s.id)).size,MOBILE_SCENARIOS.length);
  const scenario=id=>{const s=run.scenarios.find(s=>s.id===id);assert(s,'MISSING_MOBILE_SCENARIO_'+id);assert.equal(s.status,'PASS',id);assert.equal(s.actualBrowserExecuted,true,id);assert.equal(s.newJavaScriptErrors.length,0,id);return s;};
  for(const id of MOBILE_SCENARIOS)scenario(id);
  const initial=scenario('initial-load');assert.equal(initial.beforeAnyOperatorInteraction,true);assert(initial.diagnostics.scrollingElement);assert(initial.diagnostics.observerInstalled);
  validTouch(scenario('vertical-touch').touch,'root-scroll');
  const horizontal=scenario('horizontal-widget');if(horizontal.applicable){assert.equal(horizontal.intendedHorizontalWidget,true);validTouch(horizontal.touch,'widget-scroll');}else{assert.equal(horizontal.reason,'NO_INTENDED_HORIZONTAL_OVERFLOW_IN_THIS_STATE');assert(horizontal.geometry&&horizontal.geometry.scrollWidth<=horizontal.geometry.clientWidth+1);}
  const modal=scenario('modal-cycle');assert(modal.cycles.length>0);for(const cycle of modal.cycles){assert.equal(cycle.actualApplicationHandler,true);if(cycle.backgroundLockExpected)validTouch(cycle.backgroundTouch,'root-locked');if(cycle.contentOverflows)validTouch(cycle.contentTouch,'widget-scroll');assert.equal(cycle.exactInlineValuesAndPrioritiesRestored,true);validTouch(cycle.afterCloseRootTouch,'root-scroll');assert.equal(cycle.reopenClosePassed,true);}
  const rotation=scenario('rotation');assert.equal(rotation.orientationChanged,true);validTouch(rotation.touch,'root-scroll');
  for(const id of ['inventory','stock','packing-list']){const s=scenario(id);assert.equal(s.actualApplicationHandler,true);assert.equal(s.fixtureDataIsRealisticReadonly,true);assert.equal(s.injectedFillerDOM,false);validTouch(s.touch,'root-scroll');}
  for(const id of ['session-restore','version-update']){const s=scenario(id);assert.equal(s.operationalStoragePreserved,true);assert.equal(s.cacheOrSessionDeletionUsed,false);assert.equal(s.syntheticProfileOnly,true);assert.equal(s.reloadLoopObserved,false);validTouch(s.touch,'root-scroll');}
  assert.equal(scenario('version-update').allLoadedAssetsFromSameReviewedCandidate,true);
 }
 return{state:'ADDITIVE_MOBILE_SCROLL_CHECK_PASS_EMULATED_ONLY_NOT_PUBLICATION_AUTHORITY',widths:[...MOBILE_WIDTHS],scenarioCount:MOBILE_WIDTHS.length*MOBILE_SCENARIOS.length,physicalAndroidConfirmed:report.physicalAndroid?.confirmed===true,physicalAndroidEvidence:report.physicalAndroid||{confirmed:false,limitation:'NOTE_56X_PRO_REAL_DEVICE_NOT_TESTED'},existingCanonicalChecksStillRequired:true,existingRegressionChecksStillRequired:true,explicitPublicationAuthorizationStillRequired:true,runtimeGo:false,releaseGo:false,dispatchGo:false,publicationGo:false};
}
