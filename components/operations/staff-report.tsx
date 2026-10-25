"use client";
import Link from 'next/link';
import {useDataMode} from './data-mode-provider';
import {useEffect,useState,type RefCallback} from 'react';
import {usePublicDemo} from '../public-demo/public-provider';
import {usePresentation} from '../settings/settings-provider';
import {useOperations} from './operations-provider';
import {useConnectedFinance} from './connected-finance';
import {employeeBusinesses,workflowFrame,simulationLabels} from '@/lib/public-demo/workflows';
import {periodRows,summarizeFinance} from '@/lib/public-demo/finance';
import {money} from '@/lib/domain';
import styles from './operations.module.css';
export function StaffReport({employeeId,assetId}:{employeeId:string;assetId?:string}){
 const {personal,sourceLabel}=useDataMode();
 const o=useOperations()!,d=usePublicDemo()!,{assets,employees,config}=usePresentation(),id=assetId??employeeBusinesses[employeeId],asset=assets.find(a=>a.id===id),person=employees.find(e=>e.id===employeeId),f=useConnectedFinance(id==='studio-hq'?undefined:id),frame=workflowFrame(id,d.tick);
 const businessIds=o.state.businesses.filter(b=>id==='studio-hq'||b.buildingId===id).map(b=>b.id),updated=o.state.batches.filter(b=>b.connected&&b.entries.some(e=>businessIds.includes(e.businessId))).map(b=>b.updatedAt).sort().at(-1);
 const needs=o.attention.filter(e=>e.assetId===id),last=frame.phase.state==='COMPLETED'?frame.step:frame.step-frame.index-1,lastTitle=last>=0?workflowFrame(id,last*12).phase.title:'아직 완료 보고 없음';
 const demoFinance=summarizeFinance(periodRows(d.days,id==='studio-hq'?undefined:id));
 return <section className={styles.report} aria-label='직원 업무 보고' data-report-building={id}><small>{personal?sourceLabel:`${o.state.mode==='public-demo'?'DEMO':'체험 자료'} / SIMULATION 업무`}</small><strong>{person?.name} · {person?.role}</strong><p>{asset?.name??'담당 건물 없음'} · {person&&config.departments[person.departmentId].name}</p><dl><dt>현재 업무</dt><dd>{personal?'업무 미연결':`${person?.active?frame.phase.title:'비활성 · 대기'} · ${person?.active?simulationLabels[frame.phase.state]:'대기'}`} </dd><dt>최근 완료 업무</dt><dd>{personal?'업무 기록 미연결':lastTitle}</dd><dt>확인 필요</dt><dd>{needs.length}건</dd><dt>기간 총매출</dt><dd data-testid='staff-sales'>{o.usingConnected?f.fmt(f.summary.grossSales):money(demoFinance.grossSales)}</dd><dt>광고 추정수익</dt><dd>{o.usingConnected?f.fmt(f.summary.adEstimate):money(demoFinance.adEstimate)}</dd></dl>
 <p>{needs.length?`대표님, ${asset?.name??'담당 건물'}에 확인해야 할 항목이 ${needs.length}개 있습니다.`:'현재 미확인 주의 항목이 없습니다.'}</p>
 <ul>{needs.slice(0,3).map(e=><li key={e.id}>{e.title}</li>)}</ul><div className={styles.toolbar}><Link href='/finance'>재무 보고 ↗</Link><Link href={`/assets/${encodeURIComponent(id)}`}>운영 현황 ↗</Link><Link href='/city#owner-inbox'>알림 확인 ↗</Link></div><small>{o.usingConnected?`재무 갱신 ${updated??'없음'} · ${f.currency}`:'가상 원장 기준'} · 실제 AI 실행 없음</small></section>;
}
export function StaffBubbles({insideAssetId,labelRef}:{insideAssetId?:string;labelRef:(id:string)=>RefCallback<HTMLElement>}){
 const {personal,sourceLabel}=useDataMode();
 const o=useOperations()!,{assets,employees}=usePresentation();
 const event=o.unread.find(e=>(e.attention||e.kind==='revenue'||e.kind==='data'||e.kind==='completed')&&(!insideAssetId||insideAssetId===e.assetId)&&employees.some(p=>p.visible&&p.active&&(!insideAssetId||insideAssetId==='studio-hq'||p.id!=='aria')&&p.id===(assets.find(a=>a.id===e.assetId)?.employeeId)));
 const [shown,setShown]=useState<string|null>(null);
 useEffect(()=>{if(!event)return;setShown(event.id);const timer=setTimeout(()=>setShown(null),6500);return()=>clearTimeout(timer);},[event?.id]);
 if(!event||shown!==event.id)return null;const person=assets.find(a=>a.id===event.assetId)?.employeeId,href=event.href+(event.href.includes('?')&&person?`&employee=${person}`:'');
 return <div className={styles.bubbles}><Link ref={labelRef(`bubble:employee:${person}`)} data-staff-bubble={event.id} href={href} onClick={()=>o.read(event.id)} aria-label={`직원 말풍선: ${event.title}`}><small>{employees.find(p=>p.id===person)?.name} · {personal?sourceLabel:event.source}</small><strong>{event.title}</strong><span>보고 확인 ↗</span></Link></div>;
}
