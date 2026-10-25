import {monthlyRuns, ratingKeys, ratingLabels, type Analysis, type DiscoveryTask, type Proposal} from './model.ts';
export interface AutomationAnalyzer {readonly provider:string;analyze(task:DiscoveryTask):Analysis}
/** Future AI implementations must use a server-owned boundary. No implementation or calls here. */
export interface FutureAIAnalyzer extends AutomationAnalyzer {readonly provider:'future-ai'}
export class RuleBasedAnalyzer implements AutomationAnalyzer {
  readonly provider='rules-v1';
  analyze(t:DiscoveryTask):Analysis {
    const missing:string[]=[],risks:string[]=[],reasons:string[]=[];
    const runs=monthlyRuns(t);
    if(runs===null)missing.push('월 반복 횟수');if(t.minutes===null)missing.push('1회 소요 시간');
    for(const k of ratingKeys)if(t.ratings[k]===null)missing.push(ratingLabels[k]);
    if(!t.inputs.trim())missing.push('입력 자료');if(!t.outputs.trim())missing.push('결과물');
    const r=t.ratings;
    // Unknown benefit = 0, unknown risk = conservative midpoint 2. All terms visible.
    const components=[
      {label:'반복 빈도: min(월 횟수 / 30, 1) × 15',value:runs===null?0:Math.min(runs/30,1)*15},
      {label:'시간: min(1회 분 / 60, 1) × 15',value:t.minutes===null?0:Math.min(t.minutes/60,1)*15},
      ...(['regularity','structured','integration'] as const).map(k=>({label:`${ratingLabels[k]}: (0~4) × 5`,value:(r[k]??0)*5})),
      ...(['error','impact','judgment','maintenance'] as const).map(k=>({label:`${ratingLabels[k]}: −(0~4) × 3 (미확인=2)`,value:-(r[k]??2)*3||0})),
    ];
    const score=Math.round(Math.max(0,Math.min(90,components.reduce((n,c)=>n+c.value,0))));
    if(t.sensitive)risks.push('민감정보 취급: 접근 범위 축소·마스킹·사람 검토 필요');
    if(t.externalPublish)risks.push('외부 발행: 별도의 발행 전 승인 필요');
    if(t.financial)risks.push('금전적 변경: 서버 권한 검증과 별도 승인 필요');
    if((r.impact??0)>=3)risks.push('실패 시 피해가 큼');if((r.judgment??0)>=3)risks.push('사람의 판단 비중이 높음');
    if((r.error??0)>=3)risks.push('오류 가능성이 높아 표본 검증 필요');if((r.maintenance??0)>=3)risks.push('유지보수 부담이 큼');
    if(t.risks.trim())risks.push(`사용자 기재 위험: ${t.risks}`);
    const existing=t.existingAutomation||t.method==='AUTOMATED'||t.method==='PARTIALLY_AUTOMATED';
    const reviewRequired=t.review||risks.length>0||missing.length>0;
    const level:Analysis['level']=existing?'IMPROVE':risks.length?'HUMAN_REVIEW':missing.length?'NEEDS_INFO':score>=45?'CANDIDATE':'NOT_RECOMMENDED';
    reasons.push(existing?'이미 자동화된 업무이므로 신규 구축 대신 기존 워크플로 개선 대상으로 분류합니다.':`신규 후보 검토 점수 ${score}/90 (45 이상 후보 기준).`);
    reasons.push(runs===null?'반복 횟수 미확인':`사용자 추정 월 ${Number(runs.toFixed(2))}회`,t.minutes===null?'소요 시간 미확인':`사용자 추정 1회 ${t.minutes}분`);
    if(missing.length)reasons.push('정보 부족 항목을 먼저 확인해야 합니다.');
    if(risks.length)reasons.push('빈도가 높아도 위험에 따른 사람 검토를 우선합니다.');
    const steps:string[]=[];
    if(level==='NOT_RECOMMENDED')steps.push('자동화 비추천: 수동 절차 개선과 기록부터 시작');
    else {
      steps.push(existing?'기존 도구·워크플로 설정과 실패 기록 점검 (미접속)':'입력 자료 수집·구조화');
      const category=t.category.toLowerCase();
      if(/개발|앱|코드|테스트/.test(category))steps.push('Codex 개발 에이전트로 변경 초안·테스트 계획 작성 (미연결)');
      else if(/콘텐츠|뉴스|sns|작성|블로그/.test(category))steps.push('AI 텍스트 분석·작성 초안 생성 (미연결)');
      if((r.integration??0)>=2)steps.push('n8n 워크플로로 단계 연결 / 기존 외부 API 결과 수집 (모두 미연결)');
      steps.push('수동 검수 중심의 반자동: 결과 확인·표본 검증',reviewRequired?'대표 검토 및 별도 실행 승인 설계':'검증 통과 후 제한된 시범 운영 계획');
      if(t.externalPublish)steps.push('승인 후 발행 계획만 저장 (지금 발행하지 않음)');
    }
    return {provider:'rules-v1',score,level,reasons,risks,missing,steps,reviewRequired,components};
  }
}
export const levelLabels:Record<Analysis['level'],string>={IMPROVE:'기존 자동화 개선',HUMAN_REVIEW:'사람 검토·승인 우선',CANDIDATE:'자동화 검토 후보',NOT_RECOMMENDED:'자동화 비추천',NEEDS_INFO:'추가 정보 필요'};
export function createProposal(t:DiscoveryTask,id:string,createdAt:string):Proposal {
  const analysis=new RuleBasedAnalyzer().analyze(t);
  return {id,taskId:t.id,source:t.source,createdAt,status:analysis.reviewRequired?'REVIEW_REQUIRED':'ANALYZED',held:false,taskName:t.name,currentMethod:t.method,analysis,departmentId:t.departmentId,employeeId:t.employeeId,tools:t.tools,inputs:t.inputs,outputs:t.outputs,procedure:analysis.steps.join('\n'),permissions:'최소 읽기·초안 권한부터 검토. 실행·발행 권한은 별도 서버 승인 필요.',checks:'샘플 입력·출력 비교, 오류 사례 검수, 민감정보 확인',risks:analysis.risks.join('\n'),cost:null,currentMinutes:t.minutes,afterMinutes:null,monthlyRuns:monthlyRuns(t),priority:analysis.level==='CANDIDATE'?'HIGH':analysis.level==='NOT_RECOMMENDED'?'LOW':'MEDIUM',verification:'소규모 샘플에서 수동 결과와 비교하고 실제 소요 시간을 따로 기록',rollback:'외부 변경 없이 초안만 검증. 실패 시 수동 절차로 복귀하고 담당자에게 보고.',plan:'',reviewNotes:''};
}
