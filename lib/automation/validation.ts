import {departmentIds,employeeIds} from '../settings/defaults.ts';
import {methods,sources,ratingKeys,proposalStatuses,type DiscoveryData,type DiscoveryTask,type WorkRecord,type Proposal,type Analysis} from './model.ts';
type O=Record<string,unknown>;
function obj(v:unknown,keys:readonly string[]):O {
  if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==keys.length||keys.some(k=>!Object.hasOwn(v,k)))throw Error('허용되지 않거나 누락된 데이터 필드가 있습니다.');
  return v as O;
}
function text(v:unknown,max=2000,required=false):string {if(typeof v!=='string'||v.length>max||required&&!v.trim()||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw Error('텍스트 길이 또는 필수 입력을 확인해 주세요.');return v;}
function id(v:unknown):string {const s=text(v,100,true);if(!/^[a-zA-Z0-9][a-zA-Z0-9:_-]*$/.test(s)||['constructor','prototype','__proto__'].includes(s))throw Error('잘못된 ID입니다.');return s;}
function choice<T extends string>(v:unknown,list:readonly T[]):T {if(typeof v!=='string'||!list.includes(v as T))throw Error('지원하지 않는 선택 값입니다.');return v as T;}
function bool(v:unknown):boolean {if(typeof v!=='boolean')throw Error('잘못된 체크 값입니다.');return v;}
function number(v:unknown,max=1000000):number {if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)throw Error('숫자 범위를 확인해 주세요.');return v;}
const optionalNumber=(v:unknown,max?:number)=>v===null?null:number(v,max);
const ref=(v:unknown,allowed?:readonly string[])=>v===null?null:allowed?choice(v,allowed):id(v);
function array<T>(v:unknown,max:number,parse:(v:unknown)=>T):T[] {if(!Array.isArray(v)||v.length>max)throw Error(`항목 수 제한(${max})을 확인해 주세요.`);return v.map(parse);}
function date(v:unknown):string {const s=text(v,10,true);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('실행 날짜가 올바르지 않습니다.');return s;}
export function validateTask(v:unknown):DiscoveryTask {
  const t=obj(v,['id','source','name','description','category','assetId','departmentId','employeeId','method','frequency','period','minutes','tools','inputs','outputs','review','risks','ratings','existingAutomation','sensitive','externalPublish','financial']);
  const r=obj(t.ratings,ratingKeys);
  const ratings=Object.fromEntries(ratingKeys.map(k=>{const n=optionalNumber(r[k],4);if(n!==null&&!Number.isInteger(n))throw Error('평가 점수는 0~4 정수입니다.');return[k,n];})) as DiscoveryTask['ratings'];
  return {id:id(t.id),source:choice(t.source,sources),name:text(t.name,100,true),description:text(t.description),category:text(t.category,60,true),assetId:ref(t.assetId),departmentId:ref(t.departmentId,departmentIds),employeeId:ref(t.employeeId,employeeIds),method:choice(t.method,methods),frequency:optionalNumber(t.frequency,10000),period:choice(t.period,['DAY','WEEK','MONTH','ADHOC']),minutes:optionalNumber(t.minutes,100000),tools:text(t.tools),inputs:text(t.inputs),outputs:text(t.outputs),review:bool(t.review),risks:text(t.risks),ratings,existingAutomation:bool(t.existingAutomation),sensitive:bool(t.sensitive),externalPublish:bool(t.externalPublish),financial:bool(t.financial)};
}
export function validateRecord(v:unknown):WorkRecord {
  const r=obj(v,['id','taskId','date','minutes','evidence','method','employeeId','performer','completed','rework','error','result','notes']);
  return {id:id(r.id),taskId:id(r.taskId),date:date(r.date),minutes:optionalNumber(r.minutes,100000),evidence:choice(r.evidence,['MEASURED','ESTIMATED','DEMO']),method:choice(r.method,methods),employeeId:ref(r.employeeId,employeeIds),performer:text(r.performer,100),completed:bool(r.completed),rework:bool(r.rework),error:text(r.error),result:text(r.result),notes:text(r.notes)};
}
function validateAnalysis(v:unknown):Analysis {
  const a=obj(v,['provider','score','level','reasons','risks','missing','steps','reviewRequired','components']);
  return {provider:choice(a.provider,['rules-v1']),score:number(a.score,90),level:choice(a.level,['IMPROVE','HUMAN_REVIEW','CANDIDATE','NOT_RECOMMENDED','NEEDS_INFO']),reasons:array(a.reasons,30,v=>text(v)),risks:array(a.risks,30,v=>text(v)),missing:array(a.missing,30,v=>text(v,100)),steps:array(a.steps,30,v=>text(v)),reviewRequired:bool(a.reviewRequired),components:array(a.components,20,v=>{const c=obj(v,['label','value']);if(typeof c.value!=='number'||!Number.isFinite(c.value)||Math.abs(c.value)>100)throw Error('분석 점수 오류');return{label:text(c.label,200),value:c.value};})};
}
export function validateProposal(v:unknown):Proposal {
  const p=obj(v,['id','taskId','source','createdAt','status','held','taskName','currentMethod','analysis','departmentId','employeeId','tools','inputs','outputs','procedure','permissions','checks','risks','cost','currentMinutes','afterMinutes','monthlyRuns','priority','verification','rollback','plan','reviewNotes']);
  const createdAt=text(p.createdAt,40,true);if(!Number.isFinite(Date.parse(createdAt)))throw Error('제안 날짜 오류');
  return {id:id(p.id),taskId:id(p.taskId),source:choice(p.source,sources),createdAt,status:choice(p.status,proposalStatuses),held:bool(p.held),taskName:text(p.taskName,100,true),currentMethod:choice(p.currentMethod,methods),analysis:validateAnalysis(p.analysis),departmentId:ref(p.departmentId,departmentIds),employeeId:ref(p.employeeId,employeeIds),tools:text(p.tools),inputs:text(p.inputs),outputs:text(p.outputs),procedure:text(p.procedure,5000),permissions:text(p.permissions),checks:text(p.checks),risks:text(p.risks),cost:optionalNumber(p.cost),currentMinutes:optionalNumber(p.currentMinutes,100000),afterMinutes:optionalNumber(p.afterMinutes,100000),monthlyRuns:optionalNumber(p.monthlyRuns),priority:choice(p.priority,['HIGH','MEDIUM','LOW']),verification:text(p.verification),rollback:text(p.rollback),plan:text(p.plan,5000),reviewNotes:text(p.reviewNotes)};
}
export function validateDiscovery(v:unknown):DiscoveryData {
  const d=obj(v,['version','tasks','records','proposals']);if(d.version!==1)throw Error('지원하지 않는 업무 데이터 버전입니다.');
  const tasks=array(d.tasks,500,validateTask),records=array(d.records,5000,validateRecord),proposals=array(d.proposals,1000,validateProposal);
  for(const list of [tasks,records,proposals])if(new Set(list.map(x=>x.id)).size!==list.length)throw Error('중복 ID가 있습니다.');
  for(const r of [...records,...proposals])if(!tasks.some(t=>t.id===r.taskId))throw Error('연결된 업무가 없는 데이터입니다.');
  for(const r of records)if(tasks.find(t=>t.id===r.taskId)?.source==='DEMO'&&r.evidence!=='DEMO')throw Error('DEMO 업무의 기록은 DEMO로 구분해야 합니다.');
  for(const p of proposals)if(tasks.find(t=>t.id===p.taskId)?.source!==p.source)throw Error('제안서와 업무의 데이터 출처가 다릅니다.');
  return {version:1,tasks,records,proposals};
}
export function parseDiscovery(raw:string):DiscoveryData {if(raw.length>5000000)throw Error('업무 파일은 최대 5MB입니다.');let v:unknown;try{v=JSON.parse(raw);}catch{throw Error('올바른 JSON이 아닙니다.');}return validateDiscovery(v);}
export const exportDiscovery=(d:DiscoveryData)=>JSON.stringify(validateDiscovery(d),null,2);
/** Shareable template has no user text, assignments, records, proposals, real dates or financial values. */
export function exportTemplate(d:DiscoveryData):string {
  const clean=validateDiscovery(d);
  return exportDiscovery({version:1,tasks:clean.tasks.map((t,i)=>({...t,id:`template-task-${i+1}`,source:'DEMO',name:`예제 업무 ${i+1}`,description:'개인정보를 제거한 업무 구조 템플릿',category:'일반',assetId:null,departmentId:null,employeeId:null,tools:'',inputs:'',outputs:'',risks:'',minutes:null,frequency:null})),records:[],proposals:[]});
}
