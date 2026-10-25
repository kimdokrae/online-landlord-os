"use client";
import Link from "next/link";
import {usePublicDemo} from "./public-demo/public-provider";
import {PublicBusinessDetail} from "./public-demo/business-dashboard";
import { stages, money, assetStatus } from "@/lib/domain";
import { islands, plots, tasks } from "@/lib/demo/data";
import { usePresentation } from "@/components/settings/settings-provider";
import { Badge, EmptyState, PageHeading } from "./ui";
import { Building } from "./city/building";
import { StageControl } from "./stage-control";
import { Icon } from "./icon";
export function AssetDetail({ assetId, worldV2 = false }: { assetId: string; worldV2?: boolean }) {
  const publicDemo=usePublicDemo()?.enabled;
  const { assets, ready, employees, config } = usePresentation();
  const asset = assets.find(a => a.id === assetId);
  if (!ready) return <div role="status" className="loading-state">건물 정보를 불러오는 중…</div>;
  if (!asset) return <EmptyState title="건물을 찾을 수 없습니다" description="이 브라우저에 저장된 데모 도시에서 건물 ID를 확인해 주세요."/>;
  if(publicDemo)return <PublicBusinessDetail asset={asset}/>;
  const plot = plots.find(p => p.id === asset.plotId);
  const island = islands.find(i => i.id === plot?.islandId);
  const employee = employees.find(e => e.id === asset.employeeId);
  const recent = tasks.filter(t => t.assetId === asset.id);
  return <><Link href={worldV2 ? "/city?preview=world-v2" : "/city"} className="back-link">← 스카이시티로 돌아가기</Link><PageHeading entity={{name:asset.name,description:asset.description}}/><div className="detail-grid"><section className="panel detail-hero"><div className={`detail-building ${asset.color}`}><Building stage={asset.stage} color={asset.color} headquarters={asset.type === "본사"}/></div><div className="detail-hero-info"><Badge>{assetStatus(asset.stage)}</Badge><h2>{asset.name}</h2><dl className="facts"><div><dt>사업 유형</dt><dd>{asset.type}</dd></div><div><dt>소속 섬</dt><dd>{island ? config.districts[island.id].name : ""}</dd></div><div><dt>고유 건물 ID</dt><dd className="mono">{asset.id}</dd></div><div><dt>고유 부지 ID</dt><dd className="mono">{asset.plotId}</dd></div></dl><StageControl asset={asset}/></div></section><section className="panel padded"><div className="section-title"><h2>목표 KPI</h2><Badge tone="neutral">샘플</Badge></div><p className="muted">{asset.kpi.label}</p><div className="kpi-number">{asset.kpi.value.toLocaleString()}<small> / {asset.kpi.target.toLocaleString()}{asset.kpi.unit}</small></div><progress value={asset.kpi.value} max={asset.kpi.target} aria-label={asset.kpi.label}/><p className="subtle-note">KPI는 고정된 가상 수치입니다. 건설 단계와 별도로 관리됩니다.</p><hr/><span className="muted">월 수익 · 가상</span><div className="kpi-number">{money(asset.revenue)}</div><p className="subtle-note">실제 수익 또는 광고 계정과 연결되지 않습니다.</p></section></div><section className="panel padded"><div className="section-title"><h2>한 층씩 쌓이는 여정</h2><Badge tone="lavender">건설 데모</Badge></div><ol className="milestones">{stages.map((stage, index) => <li key={stage} className={index <= asset.stage ? "complete" : ""}><span>{index < asset.stage ? <Icon name="check" size={16}/> : index}</span><strong>{stage}</strong><small>{index < asset.stage ? "완료 예시" : index === asset.stage ? "현재 데모 단계" : "예정 예시"}</small></li>)}</ol></section><div className="detail-grid"><section className="panel padded"><h2>담당 직원</h2>{employee ? <Link className="employee-inline" href={`/agents/${employee.id}`}><span style={{background:employee.bodyColor}} className={`employee-avatar ${employee.color}`}>{employee.initial}</span><span><strong>{employee.name}</strong><small>{employee.role} · DEMO</small></span><Icon name="arrow" size={18}/></Link> : <p className="muted">아직 배정된 데모 직원이 없습니다.</p>}</section><section className="panel padded"><h2>최근 업무 · 샘플</h2>{recent.length ? recent.map(task => <div className="task-line" key={task.id}><span>{task.title}</span><Badge tone="neutral">{task.status}</Badge></div>) : <p className="muted">이 건물에 등록된 샘플 업무가 없습니다.</p>}</section></div></>;
}
