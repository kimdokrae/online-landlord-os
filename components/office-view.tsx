"use client";
import {useDataMode} from "./operations/data-mode-provider";
import {usePublicDemo} from "./public-demo/public-provider";
import {StaffReport} from "./operations/staff-report";
import {WorkflowCard} from "./public-demo/business-dashboard";
import Link from "next/link";
import { tasks } from "@/lib/demo/data";
import { usePresentation } from "@/components/settings/settings-provider";
import { PageHeading, Badge, EmptyState } from "./ui";
import { Icon } from "./icon";
export function OfficeView() {
 const {personal,copy}=useDataMode();
  const { assets, employees, config } = usePresentation();
  return <><PageHeading/><div className="office-note"><Icon name="office"/><span>이곳의 직원은 역할과 업무 흐름을 보여주는 <strong>{personal?"직원 프로필 · 업무 미연결":"데모 프로필"}</strong>입니다. AI 모델이나 자동화는 실행되지 않습니다.</span></div><div className="employee-grid">{employees.filter(e=>e.visible).map(employee => <article key={employee.id} className="panel employee-card"><div className="employee-card-top"><span style={{background:employee.bodyColor}} className={`employee-avatar ${employee.color}`}>{employee.initial}</span><Badge tone="neutral">{personal?"업무 미연결":"DEMO"}</Badge></div><h2>{employee.name}</h2><span className="employee-role">{employee.role} · {config.departments[employee.departmentId].name}</span><p>{copy(employee.description)}</p><div className="employee-card-status"><i className="live"/>{employee.active?employee.status:personal?"비활성":"비활성 · DEMO 모션 중지"}</div><div className="assigned-assets"><small>담당 건물</small><strong>{assets.filter(a => a.employeeId === employee.id).map(a => a.name).join(" · ") || "미배정"}</strong></div><Link href={`/agents/${employee.id}`} className="button secondary full">직원 상세 보기 <Icon name="arrow" size={16}/></Link></article>)}</div></>;
}
export function EmployeeDetail({ agentId }: { agentId: string }) {
  const {personal,copy}=useDataMode();
  const publicDemo=usePublicDemo()?.enabled;
  const { assets, ready, employees, config } = usePresentation();
  const employee = employees.find(e => e.id === agentId);
  if (!employee) return <EmptyState title="직원을 찾을 수 없습니다" description="직원 오피스에서 데모 프로필을 확인해 주세요."/>;
  return <><Link href="/office" className="back-link">← 직원 오피스로 돌아가기</Link><PageHeading entity={{name:employee.name,description:employee.description}}/><div className="detail-grid"><section className="panel padded"><span style={{background:employee.bodyColor}} className={`employee-avatar ${employee.color}`}>{employee.initial}</span><h2>{employee.role} · {config.departments[employee.departmentId].name}</h2><Badge>{employee.active?employee.status:"비활성"}</Badge><p className="muted">실제 AI 실행 없음 · 외부 도구 권한 없음 · 비용 발생 없음</p><hr/><h3>담당 건물</h3>{!ready ? <p role="status">정보를 불러오는 중…</p> : assets.filter(a => a.employeeId === employee.id).map(a => <Link className="asset-summary" key={a.id} href={`/assets/${a.id}`}><strong>{a.name}</strong><Icon name="arrow" size={16}/></Link>)}</section>{publicDemo?<div className="panel padded"><StaffReport employeeId={employee.id}/><WorkflowCard employeeId={employee.id}/></div>:<section className="panel padded"><h2>샘플 업무</h2>{tasks.filter(t => t.employeeId === employee.id).map(t => <div key={t.id} className="task-line"><span>{t.title}</span><Badge tone="neutral">{t.status}</Badge></div>)}<p className="subtle-note">업무 배정과 실행 제어는 후속 개발 범위입니다.</p></section>}</div></>;
}
