"use client";
import {useState} from 'react';
import {sampleCsv,blankCsv,sampleEntries} from '@/lib/operations/sample-csv';
import {financialSummary,moneyMinor} from '@/lib/operations/model';
import {businessProfiles} from '@/lib/public-demo/preset';
import {useOperations} from './operations-provider';
import {useDataMode} from './data-mode-provider';
import styles from './operations.module.css';
function download(text:string,name:string){const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function CsvGuide(){const o=useOperations()!,{canUsePersonal}=useDataMode(),[show,setShow]=useState(false),[notice,setNotice]=useState('');
 const rows=sampleEntries(),total=financialSummary(rows.map((e,i)=>({...e,id:`sample-${i}`})));
 return <section className={styles.card} aria-label={canUsePersonal?'내 데이터 연결 안내':'가상 자료 형식 안내'}><h2>{canUsePersonal?'내 데이터로 전환하기':'가상 자료 형식 체험'}</h2>
 <ol><li>현재 체험 원장과 같은 샘플 CSV 또는 빈 양식을 내려받으세요.</li><li>{canUsePersonal?"날짜·사업 ID·지표·금액·통화를 본인 자료로 바꾸고, 사업을 건물에 연결하세요.":"샘플 사업 ID와 가상 숫자로 형식만 체험하세요. 실제 개인 정보와 매출은 입력하지 마세요."}</li><li>직접 입력 또는 CSV 검증 미리보기 후 저장하세요. 저장만으로 모드는 바뀌지 않습니다.</li><li>{canUsePersonal?"설정의 데이터 모드에서 체험 모드 OFF를 선택하세요.":"입력 자료 보기를 선택하면 저장한 가상 자료를 조회합니다. 원래 체험 원장으로 돌아갈 수 있습니다."}</li></ol>
 <details><summary>CSV 컬럼별 뜻과 입력 예시</summary><div className={styles.table}><table><thead><tr><th>컬럼</th><th>뜻</th><th>예시</th></tr></thead><tbody>{[['date','자료의 기준 날짜 · YYYY-MM-DD','2026-10-20'],['businessId','사업 등록 화면에 표시된 고유 ID · 건물 이름이 아님','paper-garden'],['metric','지표 코드 · 한 행에 한 지표','grossSales'],['amount','해당 일자의 합계 · 쉼표·음수 없이 입력','120000'],['currency','통화 · 자동 환산하지 않음','KRW']].map(([key,meaning,example])=><tr key={key}><td><code>{key}</code></td><td>{meaning}</td><td>{example}</td></tr>)}</tbody></table></div><p>metric: grossSales=총매출, refunds=환불·취소, adEstimate=광고 추정수익, cost=운영비, paidOut=실제 지급액. 순매출·순이익은 계산값으로 직접 입력하지 않습니다. 해당 없음은 0, 모르는 지표는 행을 생략합니다. 한 일자·사업·지표·통화당 합계 한 행입니다.</p><p>사업·건물 연결 탭 → 사업 등록 → 담당 건물 선택 → 표시된 사업 ID를 CSV에 복사하세요. 샘플 ID 매핑 준비는 없는 사업만 추가합니다. 기존 사업은 매핑을 먼저 확인하세요.</p></details>
 <section aria-label='데이터 갱신 안내'><h3>자료는 계속 갱신해야 해요</h3><ul><li>수동 입력: 사용자가 새 일자의 최신 수치를 직접 추가하거나 기존 자료를 수정합니다.</li><li>CSV 업로드: 새 파일을 다시 가져와야 갱신됩니다. 한 번 업로드해도 원본 파일을 자동 추적하지 않습니다.</li><li>자동 동기화: 추가 개발 필요. 인증된 서버 수집 계층과 외부 Provider를 마련해야 합니다.</li></ul><p>전체 기간 파일을 다시 올릴 때는 교체할 CSV 자료를 선택하세요. 겹치지 않는 새 날짜만 별도 추가할 수도 있습니다. 중복 행은 합산하지 않고 검증에서 차단합니다. 최신 수치는 업로드 즉시 선택한 데이터 모드의 공통 집계에 반영됩니다.</p></section>
 <p>샘플은 기존 차트의 30일 재무 원장을 그대로 변환한 {rows.length}행입니다. 총매출 {moneyMinor(total.grossSales,'KRW')} · 광고 추정수익 {moneyMinor(total.adEstimate,'KRW')}. 주문·방문자·가상 업무는 CSV에 포함하지 않습니다. 비용 누락은 빈 값이나 0으로 대체하지 않고 행을 생략합니다.</p>
 <div className={styles.toolbar}><button className='button secondary' onClick={()=>setShow(v=>!v)}>샘플 CSV 보기</button><button className='button secondary' onClick={()=>download(sampleCsv(),'skycity-sample-finance.csv')}>샘플 CSV 다운로드</button><button className='button secondary' onClick={()=>download(blankCsv(),'my-finance-template.csv')}>빈 CSV 양식 다운로드</button></div>
 {show&&<><pre style={{overflowX:'auto',maxHeight:220}}>{sampleCsv().split('\r\n').slice(0,11).join('\n')}</pre><p>첫 10행 미리보기 · 다운로드에는 전체 행이 포함됩니다.</p></>}
 <button className='button secondary' onClick={()=>{const missing=Object.entries(businessProfiles).filter(([id])=>!o.state.businesses.some(b=>b.id===id));if(!missing.length){setNotice('모든 샘플 사업 ID가 이미 등록되어 있습니다. 기존 매핑은 유지합니다.');return;}if(o.save({...o.state,businesses:[...o.state.businesses,...missing.map(([id,p])=>({id,name:p.name,buildingId:id}))]}))setNotice('누락된 샘플 사업 ID만 등록했습니다. 기존 사업·건물 매핑과 자료는 변경하지 않았습니다.');}}>샘플 사업 ID 매핑 준비</button>
 <p>{canUsePersonal?'샘플 CSV를 그대로 올리면 체험과 같은 가상 숫자입니다. 개인 수치로 반드시 수정한 뒤 사용하세요.':'공개 환경에서는 샘플·가상 자료만 사용하세요. 개인 데이터 전환은 로컬 템플릿에서만 가능합니다.'}</p><p role='status'>{notice}</p>
 </section>;
}
