export const methods = ['MANUAL','PARTIALLY_AUTOMATED','AUTOMATED','UNDER_REVIEW'] as const;
export type Method = typeof methods[number];
export const methodLabels: Record<Method,string> = {MANUAL:'수동',PARTIALLY_AUTOMATED:'부분 자동화',AUTOMATED:'자동화 운영 중',UNDER_REVIEW:'개선 검토 중'};
export const sources = ['USER','DEMO'] as const;
export type Source = typeof sources[number];
export const ratingKeys = ['regularity','structured','integration','error','impact','judgment','maintenance'] as const;
export type RatingKey = typeof ratingKeys[number];
export const ratingLabels: Record<RatingKey,string> = {regularity:'절차의 규칙성',structured:'입력 구조화 가능성',integration:'API·도구 연동 가능성',error:'오류 발생 가능성',impact:'실패 피해',judgment:'사람의 판단 필요',maintenance:'유지보수 부담'};
export type DiscoveryTask = {
  id:string;source:Source;name:string;description:string;category:string;
  assetId:string|null;departmentId:string|null;employeeId:string|null;
  method:Method;frequency:number|null;period:'DAY'|'WEEK'|'MONTH'|'ADHOC';minutes:number|null;
  tools:string;inputs:string;outputs:string;review:boolean;risks:string;
  ratings:Record<RatingKey,number|null>;existingAutomation:boolean;
  sensitive:boolean;externalPublish:boolean;financial:boolean;
};
export type WorkRecord = {
  id:string;taskId:string;date:string;minutes:number|null;evidence:'MEASURED'|'ESTIMATED'|'DEMO';
  method:Method;employeeId:string|null;performer:string;completed:boolean;rework:boolean;
  error:string;result:string;notes:string;
};
export const proposalStatuses = ['DRAFT','ANALYZED','REVIEW_REQUIRED','APPROVED_FOR_PLANNING','REJECTED','ARCHIVED'] as const;
export type ProposalStatus = typeof proposalStatuses[number];
export const statusLabels:Record<ProposalStatus,string>={DRAFT:'초안',ANALYZED:'분석 완료',REVIEW_REQUIRED:'검토 필요',APPROVED_FOR_PLANNING:'도입 계획 승인',REJECTED:'반려',ARCHIVED:'보관'};
export type Analysis = {provider:'rules-v1';score:number;level:'IMPROVE'|'HUMAN_REVIEW'|'CANDIDATE'|'NOT_RECOMMENDED'|'NEEDS_INFO';reasons:string[];risks:string[];missing:string[];steps:string[];reviewRequired:boolean;components:{label:string;value:number}[]};
export type Proposal = {
  id:string;taskId:string;source:Source;createdAt:string;status:ProposalStatus;held:boolean;
  taskName:string;currentMethod:Method;analysis:Analysis;
  departmentId:string|null;employeeId:string|null;tools:string;inputs:string;outputs:string;
  procedure:string;permissions:string;checks:string;risks:string;cost:number|null;
  currentMinutes:number|null;afterMinutes:number|null;monthlyRuns:number|null;
  priority:'HIGH'|'MEDIUM'|'LOW';verification:string;rollback:string;plan:string;reviewNotes:string;
};
export type DiscoveryData={version:1;tasks:DiscoveryTask[];records:WorkRecord[];proposals:Proposal[]};
export const emptyDiscovery=():DiscoveryData=>({version:1,tasks:[],records:[],proposals:[]});
export const newTask=(id:string):DiscoveryTask=>({id,source:'USER',name:'',description:'',category:'일반',assetId:null,departmentId:null,employeeId:null,method:'MANUAL',frequency:null,period:'MONTH',minutes:null,tools:'',inputs:'',outputs:'',review:true,risks:'',ratings:{regularity:null,structured:null,integration:null,error:null,impact:null,judgment:null,maintenance:null},existingAutomation:false,sensitive:false,externalPublish:false,financial:false});
export function monthlyRuns(task:DiscoveryTask):number|null {
  if(task.frequency===null||task.period==='ADHOC')return null;
  return task.frequency*({DAY:30,WEEK:52/12,MONTH:1}[task.period]);
}
/** Count only explicit user entries; duration evidence never gets mixed into one average. */
export function summarize(records:WorkRecord[],from='',to='9999-12-31') {
  const selected=records.filter(r=>r.date>=from&&r.date<=to);
  const buckets=(['MEASURED','ESTIMATED','DEMO'] as const).map(evidence=>{
    const group=selected.filter(r=>r.evidence===evidence),timed=group.filter(r=>r.minutes!==null);
    const minutes=timed.reduce((n,r)=>n+r.minutes!,0);
    return {evidence,count:group.length,timedCount:timed.length,minutes:timed.length?minutes:null,average:timed.length?minutes/timed.length:null,rework:group.filter(r=>r.rework).length,completed:group.filter(r=>r.completed).length};
  });
  return {count:selected.length,buckets};
}
export function savings(p:Pick<Proposal,'currentMinutes'|'afterMinutes'|'monthlyRuns'>) {
  if(p.currentMinutes===null||p.afterMinutes===null)return null;
  const perRun=p.currentMinutes-p.afterMinutes;
  return {perRun,monthly:p.monthlyRuns===null?null:perRun*p.monthlyRuns};
}
