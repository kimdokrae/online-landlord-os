"use client";
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useTemplate} from './template-provider';
import {useDataMode,useConnectionStore} from '../operations/data-mode-provider';
import {useSettings,usePresentation} from '../settings/settings-provider';
import {usePublicDemo} from '../public-demo/public-provider';
import {CsvGuide} from '../operations/csv-guide';
import {useOperations} from '../operations/operations-provider';
import styles from './template.module.css';
export function WelcomeView(){
 const t=useTemplate(),m=useDataMode(),store=useConnectionStore(),s=useSettings(),{assets,employees}=usePresentation(),d=usePublicDemo(),o=useOperations(),router=useRouter();
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const step=t.progress.choice==='company'?t.progress.step:0;
 function choose(company:boolean){setError('');if(!m.canUsePersonal){if(!company){if(o&&!o.save({...o.state,source:'demo'}))return;if(d?.enabled&&!d.playing)d.toggle();router.push('/city');}return;}
  if(!store.save({...store.state,source:company?'connected':'demo'}))return;
  if(!t.save({version:1,status:company?'pending':'completed',choice:company?'company':'demo',step:company?1:0}))return;
  if(!company){if(d?.enabled&&!d.playing)d.toggle();router.push('/city');}
 }
 async function next(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');const data=new FormData(event.currentTarget);try{
  const config=structuredClone(s.config);
  if(step===1){config.company.name=String(data.get('company')).trim();config.company.cityName=String(data.get('city')).trim();}
  if(step===2)for(const a of assets)config.buildings[a.id]={...(config.buildings[a.id]??{description:a.description,type:a.type,linkedAssetId:a.id}),name:String(data.get('building:'+a.id)).trim()};
  if(step===3)for(const e of employees)config.employees[e.id]={...config.employees[e.id],name:String(data.get('employee:'+e.id)).trim(),role:String(data.get('role:'+e.id)).trim()};
  if(!await s.importJSON(JSON.stringify(config)))throw Error('회사 설정을 저장하지 못했습니다. 입력을 확인해 주세요.');
  if(step===2){const missing=assets.filter(a=>!store.state.businesses.some(b=>b.id===a.id));if(missing.length&&!store.save({...store.state,businesses:[...store.state.businesses,...missing.map(a=>({id:a.id,name:config.buildings[a.id].name,buildingId:a.id}))]}))throw Error('건물 이름은 저장했지만 사업 매핑 저장에 실패했습니다. 기존 매핑은 보존했습니다. 다시 시도해 주세요.');}
  t.save({...t.progress,choice:'company',status:'pending',step:(step+1) as 2|3|4});
 }catch(e){setError(e instanceof Error?e.message:'설정을 저장하지 못했습니다.');}finally{setBusy(false);}}
 function finish(){if(!store.save({...store.state,source:'connected'}))return;if(t.save({...t.progress,status:'completed',choice:'company',step:4}))router.push('/city');}
 return <div className={styles.welcome}><small>ONLINE LANDLORD OS · LOCAL FIRST</small><h1>{step?'내 회사 만들기':'구름 위, 나만의 사업을 시작해요'}</h1><p>사업은 건물로, 동료는 새싹 직원으로. 실제 AI 실행과 외부 자동 연결은 제공하지 않습니다.</p>
 {(t.existing||t.progress.status==='completed')&&<p className={styles.note}>기존 설정과 자료가 있습니다. 이 안내는 직접 선택했을 때만 열립니다. 저장한 항목만 변경하며 자료를 초기화하지 않습니다.</p>}
 {!m.canUsePersonal&&<p className={styles.note}>공개 웹 체험은 가상 자료 전용입니다. 내 회사와 개인 자료는 다운로드한 로컬 템플릿에서 설정하세요.</p>}
 {step===0?<div className={styles.choices}><section><span>01 · 둘러보기</span><h2>데모 회사 체험하기</h2><p>기존 30일 가상 매출과 그래프, 움직이는 직원과 3D 오피스를 바로 체험합니다.</p><button className='button' disabled={!t.ready||!s.ready||!store.ready} onClick={()=>choose(false)}>데모 회사 체험하기</button></section><section><span>02 · 내 공간 만들기</span><h2>내 회사 만들기</h2><p>회사 이름 → 사업 건물 → 직원 → 수익 자료. 처음에는 입력 자료 없음으로 시작하며 샘플과 합산하지 않습니다.</p><button className='button secondary' disabled={!m.canUsePersonal||!s.ready||!store.ready} onClick={()=>choose(true)}>내 회사 만들기</button></section></div>:<>
 <ol className={styles.steps}>{['회사 이름','사업 건물','직원','수익 데이터'].map((name,i)=><li key={name} aria-current={step===i+1?'step':undefined}>{i+1}. {name}</li>)}</ol>
 {step<4?<form key={step} onSubmit={next} className={styles.form}>
 {step===1&&<><h2>어떤 이름으로 시작할까요?</h2><label>회사 이름<input name='company' required maxLength={60} defaultValue={s.config.company.name}/></label><label>도시 이름<input name='city' required maxLength={60} defaultValue={s.config.company.cityName}/></label></>}
 {step===2&&<><h2>기존 건물에 내 사업 이름을 붙여요</h2><p>3D 모델과 고유 ID는 유지합니다. 새 건물은 나중에 도시의 빈 부지에서 추가할 수 있습니다. 없는 사업 ID만 같은 건물에 연결해 수익 자료를 받을 준비를 합니다.</p>{assets.map(a=><label key={a.id}>건물 이름 ({a.id})<input name={'building:'+a.id} required maxLength={60} defaultValue={a.name}/><small>CSV 사업 ID: {a.id}</small></label>)}</>}
 {step===3&&<><h2>함께할 동료를 소개해 주세요</h2><p>직원은 화면 캐릭터입니다. 실제 업무·모델 실행은 미연결입니다. 부서·색상은 설정에서 바꿀 수 있습니다.</p>{employees.map(e=><div className={styles.employee} key={e.id}><label>직원 이름 ({e.id})<input name={'employee:'+e.id} required maxLength={60} defaultValue={e.name}/></label><label>직책 ({e.id})<input name={'role:'+e.id} required maxLength={80} defaultValue={e.role}/></label></div>)}</>}
 <button className='button' disabled={busy||!s.ready}>저장하고 다음</button>{step>1&&<button type='button' className='button secondary' onClick={()=>t.save({...t.progress,step:(step-1) as 1|2})}>이전 단계</button>}
 </form>:<section className={styles.form}><h2>마지막으로, 내 수익 자료를 연결해요</h2><p>이 단계는 건너뛸 수 있습니다. 자료가 없으면 미연결로 표시하며 체험 금액을 대신 넣지 않습니다.</p>{o&&<CsvGuide/>}<div className={styles.actions}><Link className='button secondary' href='/settings/data'>수익 자료 연결하기 ↗</Link><button className='button' onClick={finish}>{store.state.batches.some(b=>b.connected)?'내 회사로 시작하기':'자료는 나중에 · 내 회사 시작'}</button></div><p>CSV 업로드는 자동 갱신이 아닙니다. 새 수치는 직접 추가하거나 새 CSV로 갱신해야 합니다.</p></section>}
 </>}
 <div className={styles.actions}>{m.canUsePersonal&&step>0&&<button className='button secondary' onClick={()=>t.save({version:1,status:'pending',choice:null,step:0})}>안내 처음부터 · 자료 유지</button>}<Link href='/city'>도시로 돌아가기</Link><Link href='/settings'>전체 설정 열기</Link></div>
 {(error||t.error||store.error||s.error)&&<p role='alert'>{error||t.error||store.error||s.error}</p>}
 </div>;
}
