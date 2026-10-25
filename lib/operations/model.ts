/** V1.1 browser-only financial records. Amounts are integer minor units, never credentials. */
export const metrics = {grossSales:'총매출',refunds:'환불·취소',adEstimate:'광고 추정수익',cost:'운영비',paidOut:'실제 지급액'} as const;
export type Metric = keyof typeof metrics;
export const currencies = ['KRW','USD','EUR','JPY'] as const;
export type Currency = typeof currencies[number];
export type Entry = {id:string;date:string;businessId:string;metric:Metric;minor:number;currency:Currency};
export type Business = {id:string;name:string;buildingId:string|null};
export type Batch = {id:string;kind:'manual'|'csv';name:string;updatedAt:string;connected:boolean;entries:Entry[]};
export type Preferences = {notificationTitle:string;dataMenuName:string};
export type EventReference={assetId:string;tick:number;run:string};
export type ConnectionState = {version:1;mode:'public-demo'|'local-template';source:'demo'|'connected';businesses:Business[];batches:Batch[];read:string[];events:EventReference[];preferences:Preferences};
export const connectionKey=(mode:ConnectionState['mode'])=>`online-landlord-os:${mode}:operations:v1`;
export function emptyState(mode:ConnectionState['mode']):ConnectionState{return {version:1,mode,source:'demo',businesses:[],batches:[],read:[],events:[],preferences:{notificationTitle:'대표 알림센터',dataMenuName:'데이터 연결'}};}
export function validDate(value:string){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='2000-01-01'&&value<='2100-12-31'&&Number.isFinite(Date.parse(value))&&new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)===value;}
export const decimals=(currency:Currency)=>currency==='KRW'||currency==='JPY'?0:2;
export function parseAmount(value:string,currency:Currency){const s=value.trim(),d=decimals(currency);if(!(d?/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/:/^(?:0|[1-9]\d{0,11})$/).test(s))throw Error('금액은 음수·쉼표·지수 없이 통화 자릿수에 맞춰 입력해 주세요.');const [whole,fraction='']=s.split('.');return Number(whole)*10**d+Number(fraction.padEnd(d,'0'));}
export const rowKey=(e:Omit<Entry,'id'>)=>JSON.stringify([e.date,e.businessId,e.metric,e.currency]);
export function activeEntries(s:ConnectionState){return s.batches.filter(b=>b.connected).flatMap(b=>b.entries);}
export function validateState(input:unknown,mode:ConnectionState['mode']):ConnectionState{
 const v=input as ConnectionState;const fail=()=>{throw Error('지원하지 않거나 손상된 데이터 연결 설정입니다. 저장 원본은 유지합니다.');};
 const exact=(o:object,keys:string[])=>!!o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join()===keys.sort().join();
 const text=(x:unknown,n=100)=>typeof x==='string'&&x.trim().length>0&&x.length<=n&&!/[\u0000-\u001f]/.test(x);
 const id=(x:unknown)=>text(x,100)&&/^[a-zA-Z0-9_-]+$/.test(x as string)&&!Object.hasOwn(Object.prototype,x as string)&&x!=='prototype';
 if(!v||!exact(v,['version','mode','source','businesses','batches','read','events','preferences'])||v.version!==1||v.mode!==mode||!['demo','connected'].includes(v.source)||!Array.isArray(v.businesses)||!Array.isArray(v.batches)||!Array.isArray(v.read)||!Array.isArray(v.events)||v.events.length>500||v.businesses.length>100||v.batches.length>100||v.read.length>10000)fail();
 if(!exact(v.preferences,['notificationTitle','dataMenuName'])||!text(v.preferences.notificationTitle,60)||!text(v.preferences.dataMenuName,40))fail();
 const ids=new Set<string>();for(const b of v.businesses){if(!exact(b,['id','name','buildingId'])||!id(b.id)||ids.has(b.id)||!text(b.name,60)||b.buildingId!==null&&!id(b.buildingId))fail();ids.add(b.id);}
 const batchIds=new Set<string>(),rows=new Set<string>(),entryIds=new Set<string>();let count=0;
 for(const b of v.batches){if(!exact(b,['id','kind','name','updatedAt','connected','entries'])||!id(b.id)||batchIds.has(b.id)||!['manual','csv'].includes(b.kind)||!text(b.name)||!text(b.updatedAt)||!Number.isFinite(Date.parse(b.updatedAt))||typeof b.connected!=='boolean'||!Array.isArray(b.entries)||b.entries.length===0)fail();batchIds.add(b.id);
  for(const e of b.entries){if(!exact(e,['id','date','businessId','metric','minor','currency'])||!id(e.id)||entryIds.has(e.id)||!validDate(e.date)||!ids.has(e.businessId)||!Object.hasOwn(metrics,e.metric)||!currencies.includes(e.currency)||!Number.isSafeInteger(e.minor)||e.minor<0||e.minor>99999999999999)fail();entryIds.add(e.id);count++;if(b.connected){const key=rowKey(e);if(rows.has(key))throw Error('같은 일자·사업·지표·통화의 중복 기록이 있습니다. 기존 자료를 교체해 주세요.');rows.add(key);}}
 }
 if(v.events.some(e=>!exact(e,['assetId','tick','run'])||!id(e.assetId)||!id(e.run)||!Number.isSafeInteger(e.tick)||e.tick<0||e.tick%12!==0)||new Set(v.events.map(e=>JSON.stringify([e.run,e.assetId,e.tick]))).size!==v.events.length)fail();
 if(!Number.isSafeInteger(v.batches.flatMap(b=>b.entries).reduce((n,e)=>n+e.minor,0)))fail();
 if(count>10000||v.read.some(r=>!text(r,250))||new Set(v.read).size!==v.read.length)fail();
 return structuredClone(v);
}
export function collect(entries:Entry[],metric:Metric){const rows=entries.filter(e=>e.metric===metric);return rows.length?rows.reduce((n,e)=>n+e.minor,0):null;}
export function financialSummary(entries:Entry[]){
 if(new Set(entries.map(e=>e.currency)).size>1)throw Error('통화별로 분리하여 집계해 주세요. 자동 환산하지 않습니다.');
 const grossSales=collect(entries,'grossSales'),refunds=collect(entries,'refunds'),adEstimate=collect(entries,'adEstimate'),cost=collect(entries,'cost'),paidOut=collect(entries,'paidOut');
 // An explicitly recorded zero is different from an absent metric. Every business/date must be complete for profit.
 const groups=new Map<string,number>(),bits:Record<Metric,number>={grossSales:1,refunds:2,adEstimate:4,cost:8,paidOut:0};
 for(const e of entries){const key=JSON.stringify([e.date,e.businessId,e.currency]);groups.set(key,(groups.get(key)??0)|bits[e.metric]);}
 const complete=groups.size>0&&[...groups.values()].every(mask=>mask===15);
 const netSales=groups.size>0&&[...groups.values()].every(mask=>(mask&3)===3)?grossSales!-refunds!:null;
 return {grossSales,refunds,netSales,adEstimate,cost,paidOut,netProfit:complete?grossSales!-refunds!+adEstimate!-cost!:null};
}
export function moneyMinor(minor:number|null,currency:Currency){return minor===null?'자료 없음':new Intl.NumberFormat('ko-KR',{style:'currency',currency,maximumFractionDigits:decimals(currency)}).format(minor/10**decimals(currency));}
export function dateRange(asOf:string,days:number){return new Date(Date.parse(`${asOf}T00:00:00Z`)-(days-1)*86400000).toISOString().slice(0,10);}
