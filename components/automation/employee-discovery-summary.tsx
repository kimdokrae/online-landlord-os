"use client";
import Link from 'next/link';
import {useDiscovery} from './discovery-provider';
import {usePresentation} from '../settings/settings-provider';
export function EmployeeDiscoverySummary({employeeId}:{employeeId:string}) {
  const {data}=useDiscovery(),{assets}=usePresentation();
  const tasks=data.tasks.filter(t=>t.employeeId===employeeId),plans=data.proposals.filter(p=>p.employeeId===employeeId);
  const reviewing=new Set([...tasks.filter(t=>t.method==='UNDER_REVIEW').map(t=>t.id),...data.proposals.filter(p=>tasks.some(t=>t.id===p.taskId)&&['DRAFT','ANALYZED','REVIEW_REQUIRED'].includes(p.status)).map(p=>p.taskId)]);
  const assetIds=[...new Set(tasks.map(t=>t.assetId).filter(Boolean))];
  return <div aria-label='자동화 발굴 현황' style={{fontSize:12,lineHeight:1.7,margin:'8px 0'}}>
    <strong>자동화 발굴 · 입력 데이터</strong><br/>담당 업무 {tasks.length}건 (DEMO {tasks.filter(t=>t.source==='DEMO').length}건 포함)<br/>
    자동화 검토 중 {reviewing.size}건 · 승인된 자동화 계획 {plans.filter(p=>p.status==='APPROVED_FOR_PLANNING').length}건<br/>
    담당 사업 자산: {assetIds.map(id=>assets.find(a=>a.id===id)?.name??`누락 자산 (${id})`).join(' · ')||'미배정'}<br/>
    <Link href='/automation-lab'>발굴실에서 확인 ↗</Link> · 계획 승인과 실제 업무 실행은 별개
  </div>;
}
