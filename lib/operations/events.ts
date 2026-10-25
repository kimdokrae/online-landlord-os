import {ledger,demoAsOf} from '../public-demo/finance.ts';
import {workflowFrame} from '../public-demo/workflows.ts';
export type OfficeEvent={id:string;assetId:string;kind:'payment'|'approval'|'completed'|'failure'|'revenue'|'traffic'|'shipping'|'update'|'data';priority:'high'|'normal'|'low';title:string;href:string;source:'DEMO'|'SIMULATION'|'LOCAL';at:string;attention:boolean};
const office=(assetId:string)=>`/city?inside=${encodeURIComponent(assetId)}`;
export function demoEvents():OfficeEvent[]{
 const rows=ledger.filter(r=>r.date===demoAsOf);return rows.flatMap(r=>{
  const events:OfficeEvent[]=[];
  const add=(kind:OfficeEvent['kind'],count:number,title:string,priority:OfficeEvent['priority']='normal')=>{for(let i=0;i<count;i++)events.push({id:`demo:${r.date}:${r.assetId}:${kind}:${i}`,assetId:r.assetId,kind,priority,title:`${title} #${i+1}`,href:office(r.assetId),source:'DEMO',at:r.date,attention:true});};
  add('payment',r.pendingPayments,'결제 확인 대기');add('shipping',r.pendingShipping,'출고 대기');add('update',r.fixesRequired,'개발 수정 필요','high');
  const previous=ledger.find(p=>p.assetId===r.assetId&&p.date<r.date&&p.date===new Date(Date.parse(r.date)-86400000).toISOString().slice(0,10));
  if(previous&&previous.visits>0&&Math.abs(r.visits-previous.visits)/previous.visits>=.2)events.push({id:`demo:${r.date}:${r.assetId}:traffic`,assetId:r.assetId,kind:'traffic',priority:'high',title:`방문자 전일 대비 ${((r.visits-previous.visits)/previous.visits*100).toFixed(1)}% 변동 · 점검 필요`,href:office(r.assetId),source:'DEMO',at:r.date,attention:true});
  if(previous&&previous.adEstimate>0&&r.adEstimate!==previous.adEstimate)events.push({id:`demo:${r.date}:${r.assetId}:ad-change`,assetId:r.assetId,kind:'revenue',priority:'low',title:`광고 추정수익 전일 대비 ${((r.adEstimate-previous.adEstimate)/previous.adEstimate*100).toFixed(1)}% ${r.adEstimate>previous.adEstimate?'증가':'감소'}`,href:'/finance',source:'DEMO',at:r.date,attention:false});
  return events;
 });
}
export function simulationEvent(assetId:string,tick:number,run:string):OfficeEvent|null{
 const f=workflowFrame(assetId,tick);if(!['AWAITING_APPROVAL','FAILED','COMPLETED'].includes(f.phase.state))return null;
 const kind=f.phase.state==='FAILED'?'failure':f.phase.state==='COMPLETED'?'completed':'approval';
 return {id:`sim:${run}:${assetId}:${f.step}`,assetId,kind,priority:kind==='failure'?'high':kind==='completed'?'low':'normal',title:f.phase.title,href:office(assetId),source:'SIMULATION',at:`+${f.step*12}초`,attention:kind!=='completed'};
}

/** Compare only two recorded observations of the SAME metric/business/currency. No fabricated baseline or FX. */
export function financialChangeEvents(entries:import('./model.ts').Entry[],businesses:import('./model.ts').Business[],source:'DEMO'|'LOCAL'):OfficeEvent[]{
 const groups=new Map<string,import('./model.ts').Entry[]>();for(const e of entries){if(!['grossSales','adEstimate'].includes(e.metric))continue;const key=JSON.stringify([e.businessId,e.metric,e.currency]);groups.set(key,[...(groups.get(key)??[]),e]);}
 return [...groups.values()].flatMap(rows=>{const sorted=[...rows].sort((a,b)=>a.date.localeCompare(b.date)),latest=sorted.at(-1),previous=sorted.at(-2);if(!latest||!previous||previous.minor===0||latest.minor===previous.minor)return [];return [{id:`change:${previous.id}:${latest.id}:${previous.minor}:${latest.minor}`,assetId:businesses.find(b=>b.id===latest.businessId)?.buildingId??'',kind:'revenue' as const,priority:'low' as const,title:`${latest.metric==='grossSales'?'매출':'광고 추정수익'} 이전 기록일(${previous.date}) 대비 ${((latest.minor-previous.minor)/previous.minor*100).toFixed(1)}% ${latest.minor>previous.minor?'증가':'감소'} · ${latest.currency}`,href:'/finance',source,at:latest.date,attention:false}];});
}
