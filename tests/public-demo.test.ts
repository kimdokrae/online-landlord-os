import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ledger,businessIds,periodRows,monthlyRows,seriesFor,summarizeFinance} from '../lib/public-demo/finance.ts';
import {publicAssets,publicSettings,publicKeys} from '../lib/public-demo/preset.ts';
import {validateSettings} from '../lib/settings/validation.ts';
import {parseStoredAssets,storageKey} from '../lib/demo/state.ts';
import {settingsStorageKey} from '../lib/settings/repository.ts';
import {discoveryStorageKey} from '../lib/automation/repository.ts';
import {workflowFrame,simulationLog} from '../lib/public-demo/workflows.ts';
import {assertLiveIntegrationsAllowed} from '../lib/public-demo/policy.ts';
test('fictional ledger has 30 complete days per business and distinct immutable periods',()=>{
 assert.equal(ledger.length,150);for(const id of businessIds){assert.equal(periodRows(30,id).length,30);assert.equal(periodRows(7,id).length,7);assert.equal(monthlyRows(id).length,20);}
 assert.equal(seriesFor(7).length,7);assert.equal(seriesFor(30).length,30);
 assert.ok(summarizeFinance(periodRows(30)).grossSales>summarizeFinance(periodRows(7)).grossSales);
 assert.ok(ledger.every(r=>r.source==='DEMO'&&r.currency==='KRW'&&Number.isSafeInteger(r.grossSales)));
});
test('finance reconciles refunds, rejects profit with missing costs and never adds payouts',()=>{
 const s=summarizeFinance(ledger);assert.equal(s.netSales,s.grossSales-s.refunds);assert.ok(s.paidOut>0);assert.equal(s.netProfit,null);
 const without=ledger.map(r=>({...r,paidOut:0}));assert.deepEqual({...summarizeFinance(without),paidOut:s.paidOut},s);
 const complete=ledger.filter(r=>r.assetId==='tiny-tools'),c=summarizeFinance(complete);assert.equal(c.netProfit,c.netSales+c.adEstimate-c.knownCosts);
 assert.equal(summarizeFinance([]).netProfit,null);
});
test('public preset preserves identities/plots and validates without touching private keys',()=>{
 const assets=publicAssets();assert.equal(assets.length,5);assert.ok(parseStoredAssets(JSON.stringify({version:1,assets})));
 assert.equal(assets.find(a=>a.id==='tiny-tools')?.plotId,'revenue-1');assert.deepEqual(validateSettings(publicSettings()),publicSettings());
 for(const key of Object.values(publicKeys))assert.ok(![storageKey,settingsStorageKey,discoveryStorageKey].includes(key));
 const a=publicAssets();a[0].name='변경';assert.notEqual(publicAssets()[0].name,'변경');
});
test('public workflows share deterministic states, chronological logs and reset boundaries',()=>{
 for(const id of businessIds){const f=workflowFrame(id,0);assert.equal(f.completed,0);const last=workflowFrame(id,(f.phases.length-1)*12);assert.equal(last.phase.state,'COMPLETED');assert.equal(last.completed,1);assert.equal(workflowFrame(id,f.phases.length*12).index,0);}
 assert.equal(workflowFrame('paper-garden',36).phase.state,'FAILED');
 assert.ok(simulationLog(24).every(l=>l.at<=24));assert.equal(simulationLog(0).length,5);
 assert.equal(workflowFrame('new-business',36).phase.state,'COMPLETED');
});
test('server policy fails closed for all demo, undefined and unrecognized modes',()=>{
 for(const mode of ['public-demo','demo',undefined,'unknown','PUBLIC'])assert.throws(()=>assertLiveIntegrationsAllowed(mode));
 assert.doesNotThrow(()=>assertLiveIntegrationsAllowed('private'));
});
