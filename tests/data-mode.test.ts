import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sampleCsv,sampleEntries,blankCsv} from '../lib/operations/sample-csv.ts';
import {parseCsv,mapCsv,defaultMapping} from '../lib/operations/csv.ts';
import {ledger,businessIds,summarizeFinance,periodRows} from '../lib/public-demo/finance.ts';
import {financialSummary,emptyState,validateState,activeEntries,dateRange} from '../lib/operations/model.ts';
import {BrowserOperationsRepository} from '../lib/operations/repository.ts';
test('sample CSV is the actual demo ledger, with identical 7/30 day financial totals and missing costs',()=>{
 const original=JSON.stringify(ledger),rows=mapCsv(parseCsv(sampleCsv()),defaultMapping,[...businessIds]).map((e,i)=>({...e,id:`r${i}`}));
 assert.equal(rows.length,sampleEntries().length);assert.equal(rows.length,720);
 for(const days of [7,30] as const){const a=financialSummary(rows.filter(e=>e.date>=dateRange('2026-10-20',days))),b=summarizeFinance(periodRows(days));for(const key of ['grossSales','refunds','netSales','adEstimate','paidOut','netProfit'] as const)assert.equal(a[key],b[key]);assert.equal(a.cost,b.knownCosts);}
 assert.equal(JSON.stringify(ledger),original);assert.equal(blankCsv().trim(),'date,businessId,metric,amount,currency');
});
test('local mode roundtrip switches only source, preserving version 1 financial/settings/event bytes',()=>{
 let raw:string|null=null;const repo=new BrowserOperationsRepository('local-template',{getItem:()=>raw,setItem:(_k,v)=>{raw=v;}}),s=emptyState('local-template');
 s.businesses=[{id:'mine',name:'내 사업',buildingId:'paper-garden'}];s.batches=[{id:'my-batch',name:'직접 입력',kind:'manual',connected:true,updatedAt:'2026-10-20T00:00:00Z',entries:[{id:'row',date:'2026-10-20',businessId:'mine',metric:'grossSales',minor:0,currency:'KRW'}]}];s.events=[{assetId:'paper-garden',tick:12,run:'old-run'}];
 const before=JSON.stringify({...s,source:undefined});repo.save(s);const saved=repo.load()!;repo.save({...saved,source:'demo'});assert.equal(repo.load()!.source,'demo');repo.save({...repo.load()!,source:'connected'});assert.equal(JSON.stringify({...repo.load()!,source:undefined}),before);assert.equal(financialSummary(activeEntries(repo.load()!)).grossSales,0);
 assert.throws(()=>validateState({...s,source:'invalid'},'local-template'));assert.equal(repo.load()!.source,'connected');
});
