import type {WorkState} from '../employees/status-adapter.ts';
import type {Action} from '../three-world/simulation.ts';
export type Phase={title:string;state:WorkState;action:Action};
const p=(title:string,state:WorkState='RUNNING',action:Action='DESK'):Phase=>({title,state,action});
export const workflows:Record<string,Phase[]>={
 'studio-hq':[p('수익 확인'),p('승인 검토','AWAITING_APPROVAL'),p('전략회의','MEETING','MEETING'),p('경영 보고 완료','COMPLETED')],
 'cloud-letter':[p('콘텐츠 기획'),p('이미지·영상 제작'),p('콘텐츠 검수','AWAITING_APPROVAL'),p('성과 회고','MEETING','MEETING'),p('제작 보고 완료','COMPLETED')],
 'paper-garden':[p('트래픽 확인'),p('추정수익 분석'),p('운영 점검','FAILED'),p('점검 수정'),p('점검 보고 완료','COMPLETED')],
 'tiny-tools':[p('주문 확인'),p('배송 처리'),p('문의 대응'),p('주문 보고 완료','COMPLETED')],
 'orbit-note':[p('기획'),p('서비스 개발'),p('테스트','AWAITING_APPROVAL'),p('업데이트'),p('완료 보고','COMPLETED')],
};
export const phaseSeconds=12;
export function workflowFrame(assetId:string,tick:number){
 const phases=[p('업무 대기','NONE','REST'),...(workflows[assetId]??[p('사업 시작 준비'),p('가상 목표 확인'),p('업무 보고 완료','COMPLETED')])];
 const step=Math.floor(Math.max(0,tick)/phaseSeconds),index=step%phases.length;
 return {phase:phases[index],index,step,cycle:Math.floor(step/phases.length),completed:Math.floor((step+1)/phases.length),phases};
}
export function simulationLog(tick:number){return Object.keys(workflows).flatMap(assetId=>{
 const max=Math.floor(tick/phaseSeconds);return Array.from({length:Math.min(max+1,8)},(_,i)=>{const step=max-i,frame=workflowFrame(assetId,step*phaseSeconds);return {id:`${assetId}:${step}`,assetId,at:step*phaseSeconds,...frame.phase};});
}).sort((a,b)=>b.at-a.at||a.assetId.localeCompare(b.assetId)).slice(0,20);}
export const employeeBusinesses:Record<string,string>={aria:'studio-hq',leo:'orbit-note',milo:'paper-garden',nova:'cloud-letter'};
export const simulationLabels:Record<WorkState,string>={NONE:'대기',RUNNING:'진행',MEETING:'회의',AWAITING_APPROVAL:'검토',COMPLETED:'완료',FAILED:'오류'};
