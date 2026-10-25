"use client";
import {useDataMode} from "@/components/operations/data-mode-provider";
import {useOperations} from "@/components/operations/operations-provider";
import {NotificationCenter} from "@/components/operations/notification-center";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { assetStatus, money } from "@/lib/domain";
import { tasks, plots } from "@/lib/demo/data";
import { usePresentation } from "@/components/settings/settings-provider";
import { PageHeading, Stat, Badge } from "../ui";
import { Icon } from "../icon";
import { StageControl } from "../stage-control";
import { Building } from "./building";
import { BuildingDiorama } from "./terrain-world";
import village from "./village.module.css";
import { previewQuery } from "@/lib/world-v2";
import { LabView, type OfficeNavigation } from "./three-lab/lab-view";
import type { LabSelection } from "./three-lab/lab-types";
import { projectBuildings, kindNames } from "@/lib/three-world/model";
import mainStyles from "./city-main.module.css";
import {usePublicDemo} from "@/components/public-demo/public-provider";
import {PeriodPicker,ManagementKpis,RevenueCharts,BusinessCards,BusinessKpis,OperationalOverview,SimulationBoard,SimulationControls,GrowthCard} from "@/components/public-demo/business-dashboard";
import { CityMap } from "./city-map";

export function CityView({ worldV2 = false, main3D = false, insideAssetId }: { worldV2?: boolean; main3D?:boolean; insideAssetId?:string }) {
  const {personal,sourceLabel,copy}=useDataMode();
  const publicDemo=usePublicDemo()?.enabled===true,operations=useOperations();
  const suffix = worldV2 ? previewQuery : "";
  const { assets, ready, employees, config } = usePresentation();
  const router = useRouter();
  const [legacySelectedId,setLegacySelectedId]=useState<string|null>("orbit-note");
  const [selection,setSelection]=useState<LabSelection>('asset:orbit-note');
  const selectedId=main3D?(selection?.startsWith('asset:')?selection.slice(6):null):legacySelectedId;
  const setSelectedId=(id:string|null)=>main3D?setSelection(id?`asset:${id}`:null):setLegacySelectedId(id);
  const officeNavigation=useRef<OfficeNavigation|null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  useEffect(()=>{if(insideAssetId)setView("map");},[insideAssetId]);
  const selected = assets.find(a => a.id === selectedId);
  const employee = employees.find(e => e.id === selected?.employeeId);
  const district = plots.find(p => p.id === selected?.plotId)?.islandId ?? "build";
  const previewTone = { hq: village.previewHq, revenue: village.previewRevenue, build: village.previewBuild, marketing: village.previewMarketing }[district];
  const selectedModel=main3D?projectBuildings(assets).find(b=>b.assetId===selectedId):undefined;
  const linkedId=selected&&config.buildings[selected.id]?config.buildings[selected.id].linkedAssetId:selected?.id;
  const linkedAsset=assets.find(a=>a.id===linkedId);
  const assetList=<div className="asset-list">{assets.map(a => <button className={`asset-row ${selectedId === a.id ? "row-selected" : ""}`} key={a.id} onClick={() => setSelectedId(a.id)}><span className={`list-asset-icon ${a.color}`}><Icon name="hq"/></span><span><strong>{a.name}</strong><small>{a.type} · {assetStatus(a.stage)} · {a.stage}층</small></span><Icon name="chevron" size={16}/></button>)}</div>;
  return <>
    <PageHeading action={<Link href={`/plots/new${suffix}`} className="button"><Icon name="plus" size={18}/> {personal?"건물 등록":"데모 건물 등록"}</Link>}/>
    {worldV2 && <p className={village.previewNotice}>WORLD V2 · {personal?"미리보기":"DEMO 미리보기"} — 독립 SVG 건물 시험 배치 <Link href="/city">기존 도시와 비교 ↗</Link></p>}
    {publicDemo?<><PeriodPicker/><ManagementKpis/></>:<div className="stats-grid"><Stat label="전체 건물" value={<>{assets.length}<em>개</em></>} hint="나만의 사업 포트폴리오" icon="city"/><Stat label="운영 중 · 데모" value={<>{assets.filter(a => a.stage === 5).length}<em>개</em></>} hint="한 층씩 쌓아 올린 가능성" icon="hq"/><Stat label="공사 중 · 데모" value={<>{assets.filter(a => a.stage < 5).length}<em>개</em></>} hint="다음 성장을 준비하는 중" icon="tasks"/><Stat label="월 수익 · 가상" value={money(assets.reduce((sum, a) => sum + a.revenue, 0))} hint="실제 수익이 아닌 샘플 금액" icon="finance"/></div>}
    {publicDemo&&<SimulationControls/>}
    <div className={`city-layout ${main3D?mainStyles.layout:""}`} data-inside={main3D&&!!insideAssetId}>
      <section className="panel map-panel"><div className="panel-heading"><h2><span className="live-dot"/>{main3D?config.company.cityName:"스카이시티 월드맵"}</h2><div hidden={main3D&&!!insideAssetId} className="segmented" role="group" aria-label="도시 보기 방식"><button aria-pressed={view === "map"} className={view === "map" ? "chosen" : ""} onClick={() => setView("map")}>도시 보기</button><button aria-pressed={view === "list"} className={view === "list" ? "chosen" : ""} onClick={() => setView("list")}>목록 보기</button></div></div>
        {main3D?<div className={mainStyles.stack}>
          <div className={mainStyles.scene} style={{visibility:view==='map'?'visible':'hidden'}} inert={view!=='map'}><LabView dashboard insideAssetId={insideAssetId} selection={selection} onSelectionChange={setSelection} officeNavigation={officeNavigation}/></div>
          {view==='list'&&<div className={mainStyles.list}>{assetList}</div>}
        </div> : view === "map" ? <CityMap worldV2={worldV2} assets={assets} selectedId={selectedId} onSelect={setSelectedId} disabled={!ready} onEmptyPlot={plot => router.push(`/plots/new?plot=${encodeURIComponent(plot.id)}${worldV2 ? "&preview=world-v2" : ""}`)}/> : assetList}
        <div className="map-help"><Icon name="city" size={16}/><span>건물을 선택해 현황을 확인하거나, 빈 부지에 새로운 가능성을 심어보세요.</span>{main3D&&<Link href='/city?view=legacy' style={{whiteSpace:'nowrap'}}>이전 2D 도시 보기</Link>}<span>{plots.length - assets.length}개 빈 부지</span></div>
      </section>
      {(!main3D||!insideAssetId)&&<aside className="panel selection-panel" aria-label="선택한 건물 정보" aria-live="polite">
        <div className="panel-heading"><h2>건물 미리보기</h2><span className="micro-label">{personal?sourceLabel:"DEMO"}</span></div>
        {selected ? <>{main3D?<div className={mainStyles.preview} data-building-preview='geometry-summary' data-asset-id={selected.id} data-stage={selected.stage}><small>선택한 3D 건물{personal?"":" · DEMO"}</small><strong>{publicDemo?(config.buildings[selected.id]?.type??selected.type):selectedModel?kindNames[selectedModel.kind]:selected.type}</strong><span>{config.buildings[selected.id]?.type??selected.type} · {selected.stage}/5단계</span><div className={mainStyles.modules} aria-label={`건설 단계 ${selected.stage}/5`}>{[1,2,3,4,5].map(n=><span key={n} data-built={n<=selected.stage}>{n}</span>)}</div></div>:<div className={`${village.cityPreview} ${previewTone}`}><BuildingDiorama worldV2={worldV2} stage={selected.stage} color={selected.color} district={district} headquarters={selected.type === "본사"}/><span className="preview-type">{selected.type}</span></div>}<div className="selection-content"><div className="selection-status"><Badge tone={selected.stage === 5 ? "mint" : "lavender"}>{assetStatus(selected.stage)}</Badge><span className="micro-label">{selected.stage} / 5층</span></div><h3>{selected.name}</h3><p className="description">{copy(selected.description)}</p><div className="mini-facts"><div><span>담당 직원{personal?"":" · 데모"}</span><strong>{employee?.name || "미배정"}</strong></div>{!publicDemo&&<div><span>월 수익 · 가상</span><strong>{money(selected.revenue)}</strong></div>}</div>{publicDemo&&<BusinessKpis assetId={operations?.usingConnected?selected.id:linkedAsset?.id??selected.id}/>}<StageControl asset={selected}/>{publicDemo&&<details><summary style={{cursor:"pointer",fontSize:12,margin:"16px 0"}}>{personal?"건설 단계 관리":"사업 성장 체험 · DEMO"}</summary><GrowthCard asset={selected}/></details>}{(!main3D||linkedAsset)&&<Link href={`/assets/${main3D?linkedAsset!.id:selected.id}${suffix}`} className="button full">{selected.type === "본사" ? "운영 현황 보기" : "건물 상세 보기"} <Icon name="arrow" size={16}/></Link>}{main3D?<><p className='subtle-note'>연결 사업 자산: {linkedAsset?.name??'미연결'}</p><button className='button secondary full' style={{marginTop:9}} disabled={!ready} onClick={()=>officeNavigation.current?.enter(selected.id)}>건물 내부 입장 <Icon name='office' size={16}/></button></>:selected.type === "본사" && <Link href={`/assets/${selected.id}/office${suffix}`} className="button secondary full" style={{ marginTop: 9 }}>건물 내부 입장 <Icon name="office" size={16}/></Link>}</div></> : <div className="selection-empty"><Icon name="city" size={36}/><h3>건물을 선택해 주세요</h3><p>도시에서 건물을 누르면 정보가 표시됩니다.</p></div>}
      </aside>}
    </div>
    {publicDemo?<><NotificationCenter/><RevenueCharts/><OperationalOverview/><BusinessCards/><SimulationBoard controls={false}/></>:<div className="city-bottom"><section className="panel activity-panel"><div className="panel-heading"><h2>도시의 작은 움직임</h2><Badge tone="neutral">샘플 시나리오</Badge></div><div className="activity-list">{tasks.slice(0, 3).map((task, i) => <div key={task.id} className="activity-row"><span className={`activity-icon ${["lavender", "peach", "blue"][i]}`}><Icon name={i === 0 ? "hq" : "reports"} size={17}/></span><div><strong>{task.title}</strong><small>{assets.find(a => a.id === task.assetId)?.name} · {task.time}</small></div><span className="activity-status">{task.status}</span></div>)}</div></section><section className="grow-card"><div className="eyebrow">ONE BLOCK AT A TIME</div><h2>다음 아이디어는<br/>어떤 건물이 될까요?</h2><p>빈 부지에 당신의 다음 사업을 그려보세요.</p><Link href={`/plots/new${suffix}`}>새로운 가능성 심기 <Icon name="arrow" size={16}/></Link><div className="grow-art">{main3D?<Icon name="city" size={90}/>:<Building stage={2} color="mint"/>}</div></section></div>}
  </>;
}
