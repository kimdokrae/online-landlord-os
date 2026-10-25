"use client";
import Link from "next/link";
import { usePresentation } from "@/components/settings/settings-provider";
import {usePublicDemo} from "./public-demo/public-provider";
import {PublicHqView} from "./public-demo/business-dashboard";
import { tasks } from "@/lib/demo/data";
import { assetStatus, money } from "@/lib/domain";
import { PageHeading, Stat, Badge } from "./ui";
import { Icon } from "./icon";
export function HqView() {
  const demo=usePublicDemo();
  const { assets, employees, config } = usePresentation();
  if(demo?.enabled)return <PublicHqView/>;
  const approvals = tasks.filter(t => t.status === "검수 대기");
  return <><PageHeading action={<Link href="/city" className="button secondary">도시 둘러보기 <Icon name="arrow" size={16}/></Link>}/><div className="hq-welcome"><div><Badge>DEMO WORKSPACE</Badge><h2>{config.company.slogan}</h2><p>{config.company.name}의 샘플 현황을 둘러보세요.</p></div><span className="hq-illustration"><Icon name="city" size={120}/></span></div><div className="stats-grid"><Stat label="운영 건물 · 데모" value={assets.filter(a => a.stage === 5).length} hint={`전체 ${assets.length}개 샘플 건물`} icon="hq"/><Stat label="공사 건물 · 데모" value={assets.filter(a => a.stage < 5).length} hint="아이디어가 자라는 중" icon="city"/><Stat label="AI 직원 · 데모" value={employees.filter(e=>e.visible).length} hint="실제 모델 실행 없음" icon="office"/><Stat label="월 수익 · 가상" value={money(assets.reduce((s, a) => s + a.revenue, 0))} hint="실제 수익과 무관한 샘플" icon="finance"/></div><div className="detail-grid"><section className="panel padded"><div className="section-title"><h2>사업 자산 현황</h2><Badge tone="neutral">DEMO</Badge></div>{assets.map(asset => <Link href={`/assets/${asset.id}`} className="asset-summary" key={asset.id}><span className={`list-asset-icon ${asset.color}`}><Icon name="hq"/></span><div><strong>{asset.name}</strong><small>{asset.type} · {asset.stage} / 5층</small></div><Badge tone={asset.stage === 5 ? "mint" : "lavender"}>{assetStatus(asset.stage)}</Badge></Link>)}</section><div className="stack"><section className="panel padded"><div className="section-title"><h2>승인 대기 예시</h2><Badge tone="peach">{approvals.length}건</Badge></div><p className="subtle-note">승인 실행 기능은 다음 단계에서 제공됩니다.</p>{approvals.map(t => <div className="approval-item" key={t.id}><span className="approval-dot"/><div><strong>{t.title}</strong><small>{assets.find(a => a.id === t.assetId)?.name} · 샘플 검수 요청</small></div></div>)}</section><section className="panel padded"><div className="section-title"><h2>직원 상태</h2><Link href="/office" className="text-link">모두 보기 →</Link></div>{employees.filter(e=>e.visible).map(employee => <Link href={`/agents/${employee.id}`} className="employee-status" key={employee.id}><span style={{background:employee.bodyColor}} className={`employee-small ${employee.color}`}>{employee.initial}</span><strong>{employee.name}</strong><span>{employee.status}</span></Link>)}</section><section className="report-note"><Icon name="reports"/><div><strong>주간 업무 보고 · 샘플</strong><p>{tasks.length}개 예시 업무 중 {tasks.filter(t => t.status === "완료 예시").length}개가 완료 상태입니다. 보고서 생성과 외부 전송은 제공하지 않습니다.</p></div></section></div></div></>;
}
