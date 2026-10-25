"use client";
import {useDataMode} from "../operations/data-mode-provider";
import {usePublicDemo} from "../public-demo/public-provider";
import {useRef,useState,type ReactNode,type ChangeEvent} from 'react';
import Link from 'next/link';
import {PageHeading,Stat} from '../ui';
import {usePresentation} from '../settings/settings-provider';
import {useDiscovery} from './discovery-provider';
import {newTask,methods,methodLabels,ratingKeys,ratingLabels,monthlyRuns,summarize,savings,statusLabels,emptyDiscovery,type DiscoveryTask,type WorkRecord,type Proposal} from '@/lib/automation/model';
import {RuleBasedAnalyzer,createProposal,levelLabels} from '@/lib/automation/analyzer';
import {demoTasks} from '@/lib/automation/samples';
import {connections} from '@/lib/automation/integrations';
import {exportDiscovery,exportTemplate} from '@/lib/automation/validation';
import styles from './discovery.module.css';

const evidenceLabels={MEASURED:'측정값 · 사용자 직접 기록',ESTIMATED:'사용자 추정값',DEMO:'DEMO · 가상 기록'};
const uid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`;
const format=(n:number|null)=>n===null?'산정 불가':Number(n.toFixed(2)).toLocaleString('ko-KR');
function Field({label,value,onChange,area=false,max=2000,required=false}:{label:string;value:string;onChange:(s:string)=>void;area?:boolean;max?:number;required?:boolean}) {
  return <label className={styles.field}><span>{label}</span>{area?<textarea aria-label={label} value={value} maxLength={max} required={required} onChange={e=>onChange(e.target.value)} rows={3}/>:<input aria-label={label} value={value} maxLength={max} required={required} onChange={e=>onChange(e.target.value)}/>}</label>;
}
function NumberField({label,value,onChange,max=100000}:{label:string;value:number|null;onChange:(n:number|null)=>void;max?:number}) {
  return <label className={styles.field}><span>{label}</span><input aria-label={label} type='number' min='0' max={max} step='any' value={value??''} onChange={e=>onChange(e.target.value===''?null:Number(e.target.value))} placeholder='미확인'/></label>;
}
function Select({label,value,onChange,children}:{label:string;value:string;onChange:(s:string)=>void;children:ReactNode}) {
  return <label className={styles.field}><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{children}</select></label>;
}
function Check({label,value,onChange}:{label:string;value:boolean;onChange:(v:boolean)=>void}){return <label className={styles.check}><input type='checkbox' checked={value} onChange={e=>onChange(e.target.checked)}/>{label}</label>;}
function Assignments({assetId,departmentId,employeeId,onChange,asset=true}:{assetId?:string|null;departmentId:string|null;employeeId:string|null;onChange:(patch:Partial<DiscoveryTask>)=>void;asset?:boolean}) {
  const {assets,employees,config}=usePresentation();
  return <div className={styles.grid}>{asset&&<Select label='담당 사업 자산' value={assetId??''} onChange={id=>onChange({assetId:id||null})}><option value=''>미배정</option>{assetId&&!assets.some(a=>a.id===assetId)&&<option value={assetId}>누락 자산 · {assetId}</option>}{assets.map(a=><option key={a.id} value={a.id}>{a.name} · {a.id}</option>)}</Select>}
    <Select label='담당 부서' value={departmentId??''} onChange={id=>onChange({departmentId:id||null})}><option value=''>미배정</option>{Object.entries(config.departments).sort((a,b)=>a[1].order-b[1].order).map(([id,d])=><option key={id} value={id}>{d.name} · {id}</option>)}</Select>
    <Select label='담당 직원' value={employeeId??''} onChange={id=>onChange({employeeId:id||null})}><option value=''>미배정</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name} · {e.id}</option>)}</Select></div>;
}
function TaskEditor({initial,onDone,onCancel}:{initial:DiscoveryTask;onDone:()=>void;onCancel:()=>void}) {
  const {personal,copy}=useDataMode();
  const [draft,set]=useState(initial),{change,busy}=useDiscovery();
  const patch=(p:Partial<DiscoveryTask>)=>set(d=>({...d,...p}));
  return <form aria-label='업무 등록·수정' className={styles.panel} onSubmit={async e=>{e.preventDefault();if(await change(d=>({...d,tasks:[...d.tasks.filter(t=>t.id!==draft.id),draft]})))onDone();}}>
    <h2>{initial.name?'업무 수정':'새 업무 등록'}</h2><small>고유 ID: {draft.id} · {draft.source==='DEMO'?(personal?'체험 예제':'DEMO 예제'):'사용자 입력'} · 비밀키나 인증정보를 입력하지 마세요.</small>
    <Field label='업무명' value={draft.name} onChange={name=>patch({name})} max={100} required/>
    <Field label='업무 설명' value={draft.description} onChange={description=>patch({description})} area/>
    <Field label='업무 카테고리' value={draft.category} onChange={category=>patch({category})} max={60} required/>
    <Assignments {...draft} onChange={patch}/>
    <Select label='현재 처리 방식' value={draft.method} onChange={method=>patch({method:method as DiscoveryTask['method']})}>{methods.map(m=><option key={m} value={m}>{methodLabels[m]}</option>)}</Select>
    <div className={styles.grid}><NumberField label='반복 횟수 (사용자 추정)' value={draft.frequency} max={10000} onChange={frequency=>patch({frequency})}/><Select label='반복 주기' value={draft.period} onChange={period=>patch({period:period as DiscoveryTask['period']})}><option value='DAY'>하루</option><option value='WEEK'>일주일</option><option value='MONTH'>한 달</option><option value='ADHOC'>비정기 · 월 환산 안 함</option></Select><NumberField label='1회 평균 소요 시간 (추정 분)' value={draft.minutes} onChange={minutes=>patch({minutes})}/></div>
    <p>월 환산: {format(monthlyRuns(draft))}회 · 하루=30일, 주=52/12주 가정. 수행 기록의 측정값과 별개입니다.</p>
    <Field label='사용하는 도구' value={draft.tools} onChange={tools=>patch({tools})}/><Field label='입력 자료' value={draft.inputs} onChange={inputs=>patch({inputs})} area/><Field label='결과물' value={draft.outputs} onChange={outputs=>patch({outputs})} area/>
    <Check label='수동 검수 필요' value={draft.review} onChange={review=>patch({review})}/><Field label='예상 오류 및 위험 요소' value={draft.risks} onChange={risks=>patch({risks})} area/>
    <h3>분석을 위한 사용자 평가</h3><p>0=낮음, 4=높음. 모르면 미확인으로 남겨 주세요. 연동 가능성은 실제 연결 상태가 아닙니다.</p>
    <div className={styles.grid}>{ratingKeys.map(k=><Select key={k} label={ratingLabels[k]} value={draft.ratings[k]?.toString()??''} onChange={v=>patch({ratings:{...draft.ratings,[k]:v===''?null:Number(v)}})}><option value=''>미확인</option>{[0,1,2,3,4].map(n=><option key={n} value={n}>{n}</option>)}</Select>)}</div>
    <Check label='기존 자동화 있음' value={draft.existingAutomation} onChange={existingAutomation=>patch({existingAutomation})}/><Check label='민감정보 취급' value={draft.sensitive} onChange={sensitive=>patch({sensitive})}/><Check label='외부 발행 포함' value={draft.externalPublish} onChange={externalPublish=>patch({externalPublish})}/><Check label='금전적 변경 포함' value={draft.financial} onChange={financial=>patch({financial})}/>
    <div className={styles.actions}><button className='button' disabled={busy}>업무 저장</button><button type='button' className='button secondary' onClick={onCancel}>취소</button></div>
  </form>;
}
function RecordEditor({task,onDone}:{task:DiscoveryTask;onDone:()=>void}) {
  const {personal,copy}=useDataMode();
  const {change,busy}=useDiscovery(),{employees}=usePresentation();
  const [r,set]=useState<WorkRecord>(()=>({id:uid('record'),taskId:task.id,date:new Date().toLocaleDateString('en-CA'),minutes:null,evidence:task.source==='DEMO'?'DEMO':'ESTIMATED',method:task.method,employeeId:task.employeeId,performer:'',completed:false,rework:false,error:'',result:'',notes:''}));
  const patch=(p:Partial<WorkRecord>)=>set(v=>({...v,...p}));
  return <form className={styles.panel} aria-label='업무 기록 작성' onSubmit={async e=>{e.preventDefault();if(await change(d=>({...d,records:[...d.records,r]})))onDone();}}>
    <h2>{task.name} · 수행 기록</h2><p>입력한 기록만 집계합니다. 비밀값·실제 재무 수치·민감한 결과물은 저장하지 마세요.</p>
    <label className={styles.field}>실행 날짜<input aria-label='실행 날짜' type='date' value={r.date} required onChange={e=>patch({date:e.target.value})}/></label>
    <NumberField label='소요 시간 (분 · 미입력은 집계 제외)' value={r.minutes} onChange={minutes=>patch({minutes})}/>
    <Select label='시간 근거' value={r.evidence} onChange={evidence=>patch({evidence:evidence as WorkRecord['evidence']})}>{(Object.keys(evidenceLabels) as (keyof typeof evidenceLabels)[]).filter(k=>task.source!=='DEMO'||k==='DEMO').map(k=><option key={k} value={k}>{personal&&k==='DEMO'?'체험 · 가상 기록':evidenceLabels[k]}</option>)}</Select>
    <Select label='수행 방식' value={r.method} onChange={method=>patch({method:method as WorkRecord['method']})}>{methods.map(m=><option key={m} value={m}>{methodLabels[m]}</option>)}</Select>
    <Select label='기록 담당 직원' value={r.employeeId??''} onChange={employeeId=>patch({employeeId:employeeId||null})}><option value=''>미배정</option>{employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</Select>
    <Field label='수행자 표시명 (선택)' value={r.performer} max={100} onChange={performer=>patch({performer})}/>
    <Check label='완료' value={r.completed} onChange={completed=>patch({completed})}/><Check label='재작업 발생' value={r.rework} onChange={rework=>patch({rework})}/><Field label='오류 내용' value={r.error} onChange={error=>patch({error})} area/><Field label='결과물 링크 또는 설명' value={r.result} onChange={result=>patch({result})} area/><Field label='비고' value={r.notes} onChange={notes=>patch({notes})} area/>
    <div className={styles.actions}><button className='button' disabled={busy}>기록 저장</button><button type='button' className='button secondary' onClick={onDone}>취소</button></div>
  </form>;
}
function AnalysisCard({task}:{task:DiscoveryTask}) {
  const {personal,copy}=useDataMode();
  const a=new RuleBasedAnalyzer().analyze(task);
  return <section className={styles.panel} aria-label='규칙 기반 분석 결과'><small>규칙 기반 분석 · rules-v1 · {task.source==='DEMO'?(personal?'체험 추천':'DEMO 추천'):'사용자 입력 기반'}</small><h2>{levelLabels[a.level]}</h2><strong>{a.score} / 90점</strong>
    <h3>추천 근거</h3><ul>{a.reasons.map(r=><li key={r}>{r}</li>)}</ul><h3>주요 위험</h3><ul>{a.risks.length?a.risks.map(r=><li key={r}>{r}</li>):<li>입력된 위험 신호 없음 · 안전성 검증 완료를 의미하지 않습니다.</li>}</ul>
    <h3>부족한 정보</h3><p>{a.missing.join(' · ')||'등록 항목 기준 미확인 없음'}</p><h3>권장 실행 방식 (미연결)</h3><ol>{a.steps.map(s=><li key={s}>{s}</li>)}</ol><p>검수·승인: {a.reviewRequired?'필요':'시범 도입 전 검증 권장'}</p>
    <details><summary>평가 산식과 분류 규칙 보기</summary><p>합계를 0~90으로 제한합니다. 이 점수는 성공 확률이 아닙니다. 미확인 이익은 0, 미확인 위험은 중간값 2입니다.</p><ul>{a.components.map(c=><li key={c.label}>{c.label}: {Number(c.value.toFixed(2))}</li>)}</ul><p>기존 자동화 → 개선 후보 우선. 위험 신호 → 사람 검토 우선. 정보 부족 → 추가 확인. 그 외 45점 이상 후보, 미만 비추천. 반복 횟수만으로 승인하지 않습니다.</p></details>
  </section>;
}
function ProposalEditor({initial,onDone}:{initial:Proposal;onDone:()=>void}) {
  const {personal,copy}=useDataMode();
  const {change,busy}=useDiscovery(),[p,set]=useState(initial),[error,setError]=useState('');
  const patch=(part:Partial<Proposal>)=>set(v=>({...v,...part})),effect=savings(p);
  async function persist(status=p.status,held=p.held) {
    if(status==='APPROVED_FOR_PLANNING') {
      if(!p.verification.trim()||!p.rollback.trim()||!p.checks.trim()){setError('검증 방법·복구 계획·검수 단계를 입력하세요.');return;}
      if(!window.confirm('자동화 도입 계획만 승인합니다. 외부 실행·발행·파일 수정은 발생하지 않습니다. 승인할까요?'))return;
    }
    const next={...p,status,held};if(await change(d=>({...d,proposals:d.proposals.map(v=>v.id===p.id?next:v)}))){set(next);setError('');}
  }
  return <section className={styles.panel} aria-label='자동화 제안서 상세'><small>{p.id} · {p.createdAt} · {p.source==='DEMO'?(personal?'체험 제안':'DEMO 제안'):'사용자 업무 기반'}</small><h2>{p.taskName}</h2><p>분석 당시 스냅샷 · 현재 방식: {methodLabels[p.currentMethod]} · 규칙 기반 {levelLabels[p.analysis.level]} ({p.analysis.score}/90)</p><p>업무를 수정해도 이 제안서는 자동 변경되지 않습니다. 필요하면 새 제안서를 생성하세요.</p>
    <strong>{statusLabels[p.status]}{p.held?' · 보류':''}</strong><h3>추천 이유</h3><ul>{p.analysis.reasons.map(r=><li key={r}>{r}</li>)}</ul><p>부족한 정보: {p.analysis.missing.join(' · ')||'없음'}</p>
    <Assignments asset={false} departmentId={p.departmentId} employeeId={p.employeeId} onChange={part=>patch({departmentId:part.departmentId===undefined?p.departmentId:part.departmentId,employeeId:part.employeeId===undefined?p.employeeId:part.employeeId})}/>
    {(['tools','inputs','outputs','procedure','permissions','checks','risks','verification','rollback','plan','reviewNotes'] as const).map((key,i)=><Field key={key} label={['기존 도구 및 연동 현황 (모두 미연결)','입력 자료','출력 자료','권장 자동화 절차','필요 권한 (희망 메타데이터)','필수 검수 단계','실행 위험','검증 방법','실패 시 복구 계획','실행 계획 (아직 미실행)','대표 검토 메모'][i]} value={p[key]} onChange={v=>patch({[key]:v})} area max={key==='procedure'||key==='plan'?5000:2000}/>)}
    <h3>시간·비용 가정</h3><p>현재 시간도 사용자 추정값이며 측정 성과가 아닙니다. 자동화 후 시간은 가정입니다. 검수·유지보수 시간을 포함해 입력하세요.</p>
    <div className={styles.grid}><NumberField label='현재 1회 소요 시간 (추정 분)' value={p.currentMinutes} onChange={currentMinutes=>patch({currentMinutes})}/><NumberField label='자동화 후 1회 시간 (가정 분)' value={p.afterMinutes} onChange={afterMinutes=>patch({afterMinutes})}/><NumberField label='월 수행 횟수 (가정)' value={p.monthlyRuns} max={1000000} onChange={monthlyRuns=>patch({monthlyRuns})}/><NumberField label='월 예상 비용 (가정 USD)' value={p.cost} max={1000000} onChange={cost=>patch({cost})}/></div>
    <output aria-label='예상 시간 절감'>예상 절감: {effect?`${format(effect.perRun)}분/회 · ${format(effect.monthly)}분/월`:'산정 불가'} · 가정이며 실제 측정 아님</output><p>비용: {p.cost===null?'산정 불가':`${format(p.cost)} USD/월 (가정)`}</p>
    <Select label='도입 우선순위' value={p.priority} onChange={priority=>patch({priority:priority as Proposal['priority']})}><option value='HIGH'>높음</option><option value='MEDIUM'>보통</option><option value='LOW'>낮음</option></Select>
    <p className={styles.notice}>이 승인은 도입 계획 승인입니다. 실제 도구 실행 권한·서버 승인·운영 상태와 분리됩니다.</p>
    <div className={styles.actions}><button className='button' disabled={busy} onClick={()=>void persist()}>제안서 내용 저장</button><button className='button secondary' disabled={busy} onClick={()=>void persist('DRAFT',false)}>초안으로</button><button className='button secondary' disabled={busy} onClick={()=>void persist('ANALYZED',false)}>분석 완료로</button><button className='button secondary' disabled={busy} onClick={()=>void persist('REVIEW_REQUIRED',false)}>대표 검토 요청</button><button className='button' disabled={busy} onClick={()=>void persist('APPROVED_FOR_PLANNING',false)}>도입 계획 승인</button><button className='button secondary' disabled={busy} onClick={()=>void persist('REJECTED',false)}>반려</button><button className='button secondary' disabled={busy} onClick={()=>void persist('REVIEW_REQUIRED',true)}>보류</button><button className='button secondary' disabled={busy} onClick={()=>void persist('ARCHIVED',false)}>보관</button><button className='button secondary' onClick={onDone}>제안서 닫기</button></div>{error&&<p role='alert'>{error}</p>}
  </section>;
}
const tabs=['업무 목록','업무 기록','자동화 분석','자동화 제안서','승인·도입 현황'];
export function DiscoveryView() {
  const {personal,copy}=useDataMode();
  const publicDemo=usePublicDemo()?.enabled;
  const {data,ready,busy,error,notice,change,importJSON}=useDiscovery(),{assets,employees,config}=usePresentation();
  const [tab,setTab]=useState(0),[taskId,setTaskId]=useState(''),[editing,setEditing]=useState<DiscoveryTask|null>(null),[recording,setRecording]=useState(false),[proposalId,setProposalId]=useState(''),[search,setSearch]=useState(''),[from,setFrom]=useState(''),[to,setTo]=useState(''),[fileError,setFileError]=useState('');
  const file=useRef<HTMLInputElement>(null),task=data.tasks.find(t=>t.id===taskId)??data.tasks[0],proposal=data.proposals.find(p=>p.id===proposalId);
  const filtered=data.tasks.filter(t=>`${t.name} ${t.category}`.includes(search)),records=data.records.filter(r=>r.taskId===task?.id),summary=summarize(records,from,to||'9999-12-31');
  async function generate(){if(!task)return;const p=createProposal(task,uid('proposal'),new Date().toISOString());if(await change(d=>({...d,proposals:[...d.proposals,p]}))){setProposalId(p.id);setTab(3);}}
  function download(template:boolean){try{if(!template&&!window.confirm('업무 원본에는 직접 입력한 이름·수행 기록·링크·제안서가 포함됩니다. 개인 백업 용도로 내보낼까요? 공개 배포에는 정제 템플릿을 사용하세요.'))return;const raw=template?exportTemplate(data):exportDiscovery(data),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=template?'automation-template-v1.json':'automation-private-backup-v1.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setFileError('');}catch(e){setFileError(e instanceof Error?e.message:'내보내기 실패');}}
  function closeDrafts(){setEditing(null);setRecording(false);setProposalId('');setTaskId('');}
  async function uploadWork(event:ChangeEvent<HTMLInputElement>){
    const input=event.target,f=input.files?.[0];
    try {
      if(!f)return;
      if(f.size>5000000){setFileError('5MB 이하 파일을 선택하세요.');return;}
      if(!window.confirm('검증 후 현재 발굴실 업무 데이터를 교체할까요? 회사 설정·기존 사업 데이터는 유지됩니다.'))return;
      if(await importJSON(await f.text()))closeDrafts();
      setFileError('');
    }catch{setFileError('업무 파일을 읽지 못했습니다. 기존 데이터는 유지됩니다.');}
    finally{input.value='';}
  }
  async function resetWork(){
    if(window.confirm('발굴실의 업무·수행 기록·제안서를 모두 비울까요? 회사 설정과 사업 데이터는 유지됩니다.')&&await change(()=>emptyDiscovery()))closeDrafts();
  }
  return <div className={styles.lab}><PageHeading pageId='automation-lab' action={<button className='button' disabled={!ready||busy} onClick={()=>{setEditing(newTask(uid('task')));setTab(0);}}>새 업무 등록</button>}/>
    <p className={styles.notice}>{personal?"로컬 저장소":"로컬 DEMO 저장소"} · 사용자 입력/측정값/추정값/{personal?"체험":"DEMO"} 예제를 구분합니다. 규칙 기반 추천이며 실제 AI 분석·외부 실행·연결은 없습니다.</p>
    <div className={styles.stats}><Stat label='등록 업무' value={data.tasks.length} hint={`사용자 ${data.tasks.filter(t=>t.source==='USER').length} · ${personal?"체험":"DEMO"} ${data.tasks.filter(t=>t.source==='DEMO').length}`} icon='tasks'/><Stat label='검토 중인 제안' value={data.proposals.filter(p=>['DRAFT','ANALYZED','REVIEW_REQUIRED'].includes(p.status)).length} hint='도입 후보 · 실제 실행 아님' icon='boardroom'/><Stat label='승인된 계획' value={data.proposals.filter(p=>p.status==='APPROVED_FOR_PLANNING').length} hint='실행 권한은 부여되지 않음' icon='check'/></div>
    <div role='status' className={styles.status}>{!ready?'업무 불러오는 중…':notice}</div>{(error||fileError)&&<p role='alert'>{fileError||error}</p>}
    <div className={styles.tabs} role='tablist' aria-label='자동화 발굴실 탭' onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?4:(tab+(e.key==='ArrowRight'?1:-1)+5)%5;setTab(next);document.getElementById(`discovery-tab-${next}`)?.focus();}}>{tabs.map((name,i)=><button role='tab' key={name} id={`discovery-tab-${i}`} aria-controls={`discovery-panel-${i}`} aria-selected={tab===i} tabIndex={tab===i?0:-1} onClick={()=>{setTab(i);setEditing(null);setRecording(false);}}>{name}</button>)}</div>
    <section role='tabpanel' id={`discovery-panel-${tab}`} aria-labelledby={`discovery-tab-${tab}`}>
      {tab===0&&<>{editing?<TaskEditor key={editing.id} initial={editing} onDone={()=>{setTaskId(editing.id);setEditing(null);}} onCancel={()=>setEditing(null)}/>:<><Field label='업무 검색' value={search} onChange={setSearch} max={100}/>{!data.tasks.length&&<div className={styles.empty}><h2>{config.pages['automation-lab'].empty}</h2><p>{copy(config.pages['automation-lab'].emptyDescription)}</p></div>}
        <div className={styles.cards}>{filtered.map(t=><article className={styles.panel} key={t.id} data-discovery-task={t.id}><span className={styles.tag}>{t.source==='DEMO'?(personal?'체험 예제':'DEMO 예제'):'사용자 입력'} · {methodLabels[t.method]}</span><h2>{t.name}</h2><p>{t.description}</p><small>{t.id}</small><p>{t.category} · {assets.find(a=>a.id===t.assetId)?.name??(t.assetId?'누락 자산':'자산 미배정')}<br/>{t.departmentId?config.departments[t.departmentId]?.name:'부서 미배정'} · {employees.find(e=>e.id===t.employeeId)?.name??'직원 미배정'}</p><p>추정 월 {format(monthlyRuns(t))}회 · 1회 {format(t.minutes)}분</p><div className={styles.actions}><button className='button secondary' onClick={()=>setEditing(t)}>업무 수정</button><button className='button secondary' onClick={()=>{setTaskId(t.id);setTab(1);}}>기록 보기</button><button className='button secondary' onClick={()=>{setTaskId(t.id);setTab(2);}}>분석 보기</button><button className={styles.danger} disabled={busy} onClick={()=>{if(window.confirm('이 업무와 연결된 수행 기록·제안서를 함께 삭제할까요?'))void change(d=>({...d,tasks:d.tasks.filter(v=>v.id!==t.id),records:d.records.filter(v=>v.taskId!==t.id),proposals:d.proposals.filter(v=>v.taskId!==t.id)}));}}>업무 삭제</button></div></article>)}</div></> }</>}
      {tab!==0&&<Select label='대상 업무' value={task?.id??''} onChange={id=>{setTaskId(id);setRecording(false);setProposalId('');}}><option value='' disabled>업무를 먼저 등록하세요</option>{data.tasks.map(t=><option key={t.id} value={t.id}>{t.name}{t.source==='DEMO'?(personal?' (체험 예제)':' (DEMO)'):''}</option>)}</Select>}
      {tab===1&&task&&<>{recording?<RecordEditor key={task.id} task={task} onDone={()=>setRecording(false)}/>:<button className='button' onClick={()=>setRecording(true)}>수행 기록 추가</button>}<div className={styles.grid}><label className={styles.field}>조회 시작일<input type='date' aria-label='조회 시작일' value={from} onChange={e=>setFrom(e.target.value)}/></label><label className={styles.field}>조회 종료일<input type='date' aria-label='조회 종료일' value={to} onChange={e=>setTo(e.target.value)}/></label></div>
        {from&&to&&from>to&&<p role='alert'>시작일이 종료일보다 늦습니다. 조회 기간을 확인하세요.</p>}<p>기간 내 수행 {summary.count}회 · 업무별 집계: {task.name}</p><div className={styles.cards}>{summary.buckets.map(b=><section key={b.evidence} className={styles.panel} aria-label={evidenceLabels[b.evidence]}><h3>{evidenceLabels[b.evidence]}</h3><p>{b.count}회 · 완료 {b.completed}회 · 재작업 {b.rework}회<br/>누적 {format(b.minutes)}분 · 평균 {format(b.average)}분<br/>시간 입력 {b.timedCount}건 (미입력은 평균에서 제외)</p></section>)}</div>
        <div className={styles.cards}>{records.filter(r=>r.date>=(from||'')&&r.date<=(to||'9999-12-31')).map(r=><article className={styles.panel} key={r.id}><h3>{r.date} · {evidenceLabels[r.evidence]}</h3><p>{methodLabels[r.method]} · {format(r.minutes)}분 · {r.completed?'완료':'미완료'} · {r.rework?'재작업 있음':'재작업 없음'}</p><p>수행자: {r.performer||employees.find(e=>e.id===r.employeeId)?.name||'미기재'}<br/>오류: {r.error||'미기재'}<br/>결과: {r.result||'미기재'}<br/>{r.notes}</p><button className={styles.danger} disabled={busy} onClick={()=>{if(window.confirm('수행 기록을 삭제할까요?'))void change(d=>({...d,records:d.records.filter(v=>v.id!==r.id)}));}}>기록 삭제</button></article>)}</div></>}
      {tab===2&&task&&<><AnalysisCard task={task}/><button className='button' disabled={busy} onClick={()=>void generate()}>분석으로 제안서 생성</button></>}
      {(tab===3||tab===4)&&<>{proposal?<ProposalEditor key={proposal.id} initial={proposal} onDone={()=>setProposalId('')}/>:<><p>계획 승인만 관리합니다. 실제 자동화 도입·운영 완료 상태를 의미하지 않습니다.</p><div className={styles.cards}>{data.proposals.filter(p=>!task||p.taskId===task.id).map(p=><article className={styles.panel} key={p.id}><small>{p.id} · {p.source==='DEMO'?(personal?'체험 자료':'DEMO'):'사용자 업무'}</small><h2>{p.taskName}</h2><p>{statusLabels[p.status]}{p.held?' · 보류':''} · 우선순위 {p.priority}</p><p>담당: {p.departmentId?config.departments[p.departmentId]?.name:'미배정'} · {employees.find(e=>e.id===p.employeeId)?.name??'미배정'}</p><button className='button secondary' onClick={()=>setProposalId(p.id)}>제안서 확인·검토</button></article>)}</div>{!data.proposals.length&&<p>업무의 자동화 분석에서 제안서를 생성해 주세요.</p>}
        {tab===4&&<section className={styles.panel}><h3>반복 업무 목록 (사용자 추정)</h3><ul>{data.tasks.filter(t=>monthlyRuns(t)!==null&&monthlyRuns(t)!>=2).map(t=><li key={t.id}>{t.name} · 월 {format(monthlyRuns(t))}회</li>)}</ul></section>}</> }</>}
    </section>
    <details className={styles.storage}><summary>샘플·데이터 이동·초기화·연결 상태</summary><p>예제는 선택적으로 추가합니다. 기존 업무를 덮어쓰거나 수행 기록을 만들지 않습니다.</p><div className={styles.actions}><button className='button secondary' disabled={!ready||busy} onClick={()=>void change(d=>({...d,tasks:[...d.tasks,...demoTasks().map(t=>publicDemo?{...t,name:t.name.replace('WordPress','웹사이트').replace('AdSense','광고'),tools:'미연결 도구 예시'}:t).filter(t=>!d.tasks.some(v=>v.id===t.id))]}))}>{personal?"체험 예제 불러오기":"DEMO 예제 불러오기"}</button><button className='button secondary' onClick={()=>download(true)}>정제 템플릿 내보내기</button><button className='button secondary' onClick={()=>download(false)}>업무 원본 백업 내보내기</button><button className='button secondary' disabled={!ready||busy} onClick={()=>file.current?.click()}>업무 JSON 가져오기</button><input ref={file} type='file' accept='.json,application/json' aria-label='업무 JSON 파일' onChange={uploadWork}/><button className={styles.danger} disabled={!ready||busy} onClick={resetWork}>발굴실 데이터 초기화</button></div><p>정제 템플릿은 사용자 자유 텍스트·배정·시간 가정·수행 기록·제안서를 제거합니다. 원본 백업에는 개인 입력이 포함될 수 있으므로 공개하지 마세요. 회사 설정 JSON과 별개입니다.</p><h3>연결 현황</h3><ul>{publicDemo?<li>공개 체험 · 외부 연결 차단</li>:connections.map(c=><li key={c.provider}>{c.provider}: 미연결</li>)}</ul><Link href='/settings'>회사·메뉴 설정 ↗</Link></details>
  </div>;
}
