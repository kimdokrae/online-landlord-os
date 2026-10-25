"use client";
import {useDataMode} from "@/components/operations/data-mode-provider";
import {useOperations} from "@/components/operations/operations-provider";
import {StaffReport,StaffBubbles} from "@/components/operations/staff-report";
import {usePublicDemo} from "@/components/public-demo/public-provider";
import {WorkflowCard,SimulationControls,BusinessKpis} from "@/components/public-demo/business-dashboard";
import { useImmersive } from "../use-immersive";
import { EmployeeDiscoverySummary } from "@/components/automation/employee-discovery-summary";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/three-world/simulation";
import { activityLabels, workLabels } from "@/lib/employees/status-adapter";
import { staffThemes } from "@/lib/three-world/model";
import type { AssetType } from "@/lib/domain";
import { tasks } from "@/lib/demo/data";
import { officeConfig, floorY } from "@/lib/three-world/office";
import { Component, useCallback, useEffect, useMemo, useRef, useState, useImperativeHandle, type RefObject, type ReactNode, type FormEvent } from "react";
import { useDemo } from "@/components/demo-provider";
import { usePresentation } from "@/components/settings/settings-provider";
import { renderCopy } from "@/lib/settings/defaults";
import { roomDisplayName, roomDepartmentId } from "@/lib/settings/presentation";
import { projectBuildings, worldPlots, kindNames, type Vec3 } from "@/lib/three-world/model";
import type { CameraCommand, CameraPose, LabSelection, LabTelemetry, StaffOrder } from "./lab-types";
import styles from "./lab.module.css";
const Scene = dynamic(() => import("./lab-scene"), { ssr: false, loading: () => <div className={styles.loading} role="status">작은 3D 세계를 준비하고 있어요…</div> });
class RendererBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className={styles.loading} role="alert">3D 렌더러를 시작하지 못했습니다.<br/>WebGL2를 지원하는 브라우저에서 다시 확인해 주세요.</div> : this.props.children; }
}
export type OfficeNavigation = { enter: (assetId: string) => void };
export function LabView({ insideAssetId, dashboard=false, selection, onSelectionChange, officeNavigation }: {
  insideAssetId?:string; dashboard?:boolean; selection?:LabSelection;
  onSelectionChange?:(selection:LabSelection)=>void; officeNavigation?:RefObject<OfficeNavigation|null>;
}) {
  const {personal,sourceLabel,copy}=useDataMode();
  const publicDemo=usePublicDemo(),operations=useOperations();
  const search=useSearchParams(),focusEmployee=search.get("employee");
  const focusedRequest=useRef("");
  const publicMode=publicDemo?.enabled===true;
  const fullscreen=useImmersive();
  const officeBar=useRef<HTMLDivElement>(null);
  const basePath=dashboard?'/city':'/city/3d-lab';
  const router = useRouter();
  const { assets, ready, setStage, addAsset, storageWarning, employees, config: settings } = usePresentation();
  const labelElements = useRef(new Map<string,HTMLElement>());
  const labelRef=(id:string)=>(element:HTMLElement|null)=>{if(element)labelElements.current.set(id,element);else labelElements.current.delete(id);};
  const buildings = useMemo(() => projectBuildings(assets), [assets]);
  const [localSelected,setLocalSelected]=useState<LabSelection>(null);
  const selected=selection===undefined?localSelected:selection, setSelected=onSelectionChange??setLocalSelected;
  const [localWalking, setWalking] = useState(true), [telemetry, setTelemetry] = useState<LabTelemetry | null>(null);
  const [command, setCommand] = useState<CameraCommand | null>(null), [error, setError] = useState("");
  const inside = buildings.find(b => b.assetId === insideAssetId);
  const config = useMemo(() => inside ? officeConfig(inside.interior) : null, [inside]);
  const [visibleFloor, setVisibleFloor] = useState<number | null>(null), [fading, setFading] = useState(false);
  const citySelection = useRef<LabSelection>(dashboard?selection??null:null), entryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const session = useMemo(()=>createSession(),[publicDemo?.revision]);
  const walking=personal?false:publicMode?publicDemo!.playing:localWalking;
  const publicSimulation=useMemo(()=>publicMode?{tick:publicDemo!.tick,revision:publicDemo!.revision,disabled:personal}:undefined,[publicMode,publicDemo?.tick,publicDemo?.revision,personal]);
  const [orders, setOrders] = useState<Record<string,StaffOrder>>({});
  const cityPose = useRef<CameraPose | undefined>(undefined);
  const returnPose = useRef<CameraPose | undefined>(undefined);
  const restorePose = useMemo(() => returnPose.current ?? cityPose.current, [insideAssetId]);
  const onTelemetry = useCallback((value: LabTelemetry) => { setTelemetry(value); if (value.mode === "city") cityPose.current = { ...value.camera, fit: value.fit }; }, []);
  const act = useCallback((action: CameraCommand["action"], target?: Vec3, span?: number) => setCommand(previous => ({ id: (previous?.id ?? 0) + 1, action, target, span })), []);
  const select = useCallback((value: LabSelection) => {
    setSelected(value);
    const room = config?.rooms.find(r => `room:${r.id}` === value);
    if (room) { setVisibleFloor(room.floor); act("focus", [room.x, floorY(room.floor)+.7, publicMode?.8:-.8], publicMode?Math.max(7,room.width+2):room.width+1); }
  }, [config, act, setSelected,publicMode]);
  useEffect(() => { if(!insideAssetId)focusedRequest.current="";setSelected(insideAssetId ? null : citySelection.current); setVisibleFloor(null); setFading(false); }, [insideAssetId]);
  useEffect(()=>{if(publicMode&&inside){const id=requestAnimationFrame(()=>officeBar.current?.scrollIntoView({block:"start",behavior:"auto"}));return()=>cancelAnimationFrame(id);}},[publicMode,inside?.assetId]);
  useEffect(() => () => { if (entryTimer.current) clearTimeout(entryTimer.current); }, []);
  useEffect(()=>{if(!inside||!focusEmployee||focusedRequest.current===`${inside.assetId}:${focusEmployee}`)return;const s=telemetry?.staff?.find(e=>e.id===focusEmployee&&e.assetId===inside.assetId);if(!s)return;focusedRequest.current=`${inside.assetId}:${focusEmployee}`;setSelected(`employee:${s.id}`);setVisibleFloor(s.floor);act("focus",[s.x,s.y+.5,s.z],8);},[inside?.assetId,focusEmployee,telemetry,act]);
  function enter(assetId: string) {
    if(fullscreen.immersive)fullscreen.exit();
    returnPose.current = cityPose.current; citySelection.current = `asset:${assetId}`; const b = buildings.find(b=>b.assetId===assetId); if (b) act("focus",b.position);
    setFading(true); entryTimer.current = setTimeout(()=>router.push(`${basePath}?inside=${encodeURIComponent(assetId)}`, {scroll:false}),220);
  }
  useImperativeHandle(officeNavigation,()=>({enter}));
  const building = buildings.find(b => `asset:${b.assetId}` === selected);
  const linkedId=building ? settings.buildings[building.assetId]?.linkedAssetId : null;
  const linkedAsset=building ? assets.find(a=>a.id===(settings.buildings[building.assetId] ? linkedId : building.assetId)) : undefined;
  const plot = worldPlots.find(p => `plot:${p.id}` === selected);
  const employee = employees.find(e => `employee:${e.id}` === selected);
  const selectedRoom=config?.rooms.find(r=>`room:${r.id}`===selected);
  const selectedDepartmentId=selectedRoom?roomDepartmentId(selectedRoom):undefined;
  const selectedDepartment=selectedDepartmentId?settings.departments[selectedDepartmentId]:null;
  const snapshot = telemetry?.staff?.find(s=>`employee:${s.id}`===selected);
  const issue = (action: StaffOrder["action"]) => { if(employee) setOrders(old=>({...old,[`${insideAssetId}:${employee.id}`]:{seq:(old[`${insideAssetId}:${employee.id}`]?.seq??0)+1,action}})); };
  const active = inside ?? building ?? buildings.find(b => b.assetId === "orbit-note");
  useEffect(() => { const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&!event.defaultPrevented&&!fullscreen.immersive)setSelected(null);}; window.addEventListener("keydown",escape); return ()=>window.removeEventListener("keydown",escape); }, [fullscreen.immersive,setSelected]);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setWalking(false); }, []);
  function register(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!plot) return; const data = new FormData(event.currentTarget); try { const id = addAsset({ name: String(data.get("name")), plotId: plot.id, type: String(data.get("type")) as AssetType }); setSelected(`asset:${id}`); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "등록하지 못했습니다."); } }
  const selectionPanel = selected && (!dashboard||fullscreen.immersive||!building) && <aside className={`${styles.selection} ${publicMode&&selectedRoom?styles.roomSelection:""} ${publicMode&&employee?styles.employeeSelection:""}`} aria-label="3D 선택 정보"><button aria-label="3D 선택 닫기" onClick={() => setSelected(null)}>×</button><span>YOUR LITTLE WORLD{personal?" · 내 데이터":" · DEMO"}</span><h2>{building?.asset.name ?? (plot ? settings.plots[plot.id].name : employee?.name ?? (config?.rooms.find(r=>`room:${r.id}`===selected) ? roomDisplayName(settings,config.rooms.find(r=>`room:${r.id}`===selected)!) : undefined))}</h2>
        {building && <><p>{settings.buildings[building.assetId]?.type??kindNames[building.kind]} · {building.status} · {building.stage} / 5단계<br/>{copy(building.asset.description)}<br/>담당 직원: {employees.find(e=>e.id===building.asset.employeeId)?.name??"미배정"}<br/>연결 자산: {linkedAsset?.name??"미연결"}<br/>{!publicMode&&(linkedAsset ? `${linkedAsset.kpi.label} ${linkedAsset.kpi.value}/${linkedAsset.kpi.target} ${linkedAsset.kpi.unit} (DEMO)` : "연결된 DEMO 자산 없음")}</p>{publicMode&&<BusinessKpis compact assetId={operations?.usingConnected?building.assetId:linkedAsset?.id??building.assetId}/>}<div className={styles.actions}>{linkedAsset && <Link href={`/assets/${linkedAsset.id}`}>운영 현황 보기 ↗</Link>}<button onClick={() => act("focus", building.position)}>건물 가까이 보기</button><button onClick={()=>enter(building.assetId)}>건물 내부 입장</button></div></>}
        {plot && <form onSubmit={register}><p>{plot.id} · {kindNames[plot.kind]} · {personal?"건물 등록":"DEMO 등록"}</p><label>건물 이름<input name="name" maxLength={40} minLength={1} required placeholder="작은 새 프로젝트"/></label><label>사업 유형<select name="type" defaultValue="앱"><option>웹사이트</option><option>앱</option><option>SNS</option><option>본사</option></select></label><button type="submit" disabled={!ready}>{personal?"건물 등록":"데모 건물 등록"}</button>{error && <p role="alert">{error}</p>}</form>}
        {selectedRoom && <p>{selectedDepartment?.description??(personal?"공용 회의 공간":"공용 회의 공간 · DEMO")}<br/>{selectedDepartment?.taskTypes.filter(Boolean).join(" · ")}<br/>{selectedDepartmentId && `소속 직원: ${employees.filter(e=>e.departmentId===selectedDepartmentId).map(e=>e.name).join(" · ")||"미배정"}`}</p>}
        {employee && <>{publicMode&&<StaffReport assetId={inside?.assetId} employeeId={employee.id}/>}<details open={!publicMode}><summary>캐릭터·발굴실 정보</summary>{!personal&&<EmployeeDiscoverySummary employeeId={employee.id}/>}<p>{employee.role} · {snapshot ? settings.departments[snapshot.department]?.name : ""}<br/>{copy(settings.employees[employee.id].cardDescription)}<br/>담당 업무: {copy(settings.employees[employee.id].taskDescription)}<br/>{!employee.active && "비활성 · "}이동 연출: {snapshot?.activity === "INSIDE" ? "건물 내부" : snapshot ? activityLabels[snapshot.activity as keyof typeof activityLabels] : "대기"}<br/>업무 신호: {snapshot ? workLabels[snapshot.workState as keyof typeof workLabels] : "실행 중인 업무 없음"}<br/>{!publicMode&&<>{tasks.find(t=>t.employeeId===employee.id)?.title} (DEMO)</>}<br/>실제 AI 실행 없음 · {personal?"실제 업무 미연결":"새로고침 시 직원 시뮬레이션 초기화"}</p><div className={styles.actions}><button onClick={()=>{if(snapshot){setVisibleFloor(inside?snapshot.floor:null);act("focus",[snapshot.x,snapshot.y+.5,snapshot.z],6);}}}>직원 가까이 보기</button>{inside && !publicMode && <><button onClick={()=>issue("DESK")}>책상에서 업무</button><button onClick={()=>issue("MEETING")}>회의 요청</button><button onClick={()=>issue("REST")}>휴식 요청</button></>}</div></details></>}
      </aside>;
  return <div className={`${styles.lab} ${dashboard?styles.dashboard:""}`}>
    {!dashboard && <><div className={styles.heading}><div><span className={styles.eyebrow}>{copy(renderCopy(settings.pages.city3d.subtitle))}</span><h1>{copy(renderCopy(settings.pages.city3d.title))}<span>.</span></h1><p>{copy(renderCopy(settings.pages.city3d.description))}</p></div><Link href="/city?preview=world-v2" className={styles.back}>V2 도시로 돌아가기 ↗</Link></div>
    <div className={styles.topline}><span><i/> 3D LAB{personal?"":" · DEMO"}</span><p>{inside ? `${inside.asset.name} · 3D 실내` : personal?"기존 자산·단계 공유":"기존 DEMO 자산·단계 공유"} · 실제 AI 실행 없음</p></div>
    </>}
    {storageWarning && <p role="status">{storageWarning}</p>}
    {insideAssetId && !inside && ready && <p role="alert">{personal?"해당 건물을 찾을 수 없습니다.":"해당 DEMO 건물을 찾을 수 없습니다."} <Link href={basePath}>도시로 돌아가기</Link></p>}
    {inside && <div ref={officeBar} style={publicMode?{scrollMarginTop:16}:undefined} className={styles.roomBar} role="group" aria-label="3D 실내 탐색"><Link href={basePath} scroll={false}>← 3D 도시로 돌아가기</Link><button onClick={()=>{setVisibleFloor(null);act("reset");}}>실내 전체 보기</button>{Array.from({length:config!.floors},(_,i)=><button key={i} aria-pressed={visibleFloor===i} onClick={()=>{setVisibleFloor(i);act("focus",[0,floorY(i)+.6,0],13);}}>{i+1}층 보기</button>)}{config!.rooms.map(r=><button key={r.id} aria-pressed={selected===`room:${r.id}`} onClick={()=>select(`room:${r.id}`)}>{roomDisplayName(settings,r)} 확대</button>)}</div>}
    <div ref={fullscreen.root} className={fullscreen.immersive?styles.immersive:styles.worldRoot} role={fullscreen.immersive?'dialog':undefined} aria-modal={fullscreen.immersive?true:undefined} aria-label={fullscreen.immersive?'스카이시티 전체 화면 탐험':undefined}>
    {dashboard&&<div className={styles.worldActions}>
      {dashboard&&!personal&&<button onClick={()=>publicMode?publicDemo!.toggle():setWalking(v=>!v)} aria-label={walking?'직원 모션 일시정지':'직원 모션 계속'}>{walking?'Ⅱ':'▷'} <span>직원 모션</span></button>}
      {fullscreen.immersive?<button ref={fullscreen.exitButton} onClick={fullscreen.exit} aria-label='전체 화면 종료'>✕ 종료</button>:<button ref={fullscreen.enterButton} onClick={fullscreen.enter} aria-label='전체 화면 탐험'>⛶ 전체 화면</button>}
    </div>}
    <section className={styles.theater} aria-label={dashboard?"3D 스카이시티 월드":"3D 스카이시티 실험"} data-world-version={dashboard?'3d':undefined} data-ready={!!telemetry} data-scene-stats={telemetry ? JSON.stringify(telemetry) : undefined}>
      <RendererBoundary>{ready && <Scene buildings={buildings} selected={selected} walking={walking} command={command} onSelect={select} onTelemetry={onTelemetry} restore={restorePose} mode={inside?.assetId ?? "city"} visibleFloor={visibleFloor} session={session} publicSimulation={publicSimulation} orders={orders} settings={settings} labelElements={labelElements}/>}</RendererBoundary>
      <div className={`${styles.fade} ${fading ? styles.fading : ""}`} aria-hidden="true"/>
      <div className={styles.worldMark} aria-hidden="true"><span>01 / CLOUD COMPANY</span><strong>{inside ? `${inside.asset.name} · 오피스` : settings.company.cityName}</strong><small>{settings.company.name} · {personal?sourceLabel:"DEMO"}</small></div>
      <div className={styles.labels} aria-label="3D 공간 이름표" aria-hidden="true">
        {!inside && buildings.map(b=><span key={b.id} ref={labelRef(`asset:${b.assetId}`)} data-world-label={`asset:${b.assetId}`} aria-label={`${b.asset.name} 3D 이름표`}>{b.asset.name}</span>)}
        {!inside && worldPlots.filter(p=>settings.plots[p.id].visible&&!assets.some(a=>a.plotId===p.id)).map(p=><span key={p.id} className={styles.plotLabel} data-muted={selected!==`plot:${p.id}` && settings.plots[p.id].name===`부지 ${p.id}`} ref={labelRef(`plot:${p.id}`)} data-world-label={`plot:${p.id}`} aria-label={`${settings.plots[p.id].name} 부지 이름표`}>{settings.plots[p.id].name}</span>)}
        {inside && config!.rooms.filter(r=>visibleFloor===null||visibleFloor===r.floor).map(r=><span key={r.id} ref={labelRef(`room:${r.id}`)} data-world-label={`room:${r.id}`}>{roomDisplayName(settings,r)}</span>)}
        {employees.filter(e=>e.visible&&(!inside||inside.kind==='hq'||e.id!=='aria')).map(e=><span key={e.id} className={styles.staffLabel} ref={labelRef(`employee:${e.id}`)} data-world-label={`employee:${e.id}`} data-character-color={e.bodyColor} aria-label={`${e.name} 직원 이름표`}>{e.name} · {settings.departments[e.departmentId].name}</span>)}
      </div>
      {publicMode&&<StaffBubbles insideAssetId={inside?.assetId} labelRef={labelRef}/>}
      {!inside && <div className={styles.districtNames} aria-label="3D 지구 이름">{Object.entries(settings.districts).map(([id,d])=><span key={id}>{d.name}</span>)}</div>}
      {!(publicMode&&employee)&&selectionPanel}
      <div className={styles.cameraBar} role="group" aria-label="3D 카메라 제어"><output aria-label="3D 확대 배율">{telemetry?.fit ? `${Math.round(telemetry.camera.zoom/telemetry.fit*100)}%` : "…"}</output><button aria-label="3D 왼쪽 회전" onClick={() => act("left")}>↶</button><button aria-label="3D 오른쪽 회전" onClick={() => act("right")}>↷</button><span/><button aria-label="3D 확대" onClick={() => act("in")}>＋</button><button aria-label="3D 축소" onClick={() => act("out")}>−</button><span/><button aria-label="3D 시점 초기화" onClick={() => act("reset")}>⌂</button></div>
      <p className={styles.cameraHelp}>드래그 회전 · Shift/오른쪽 드래그 이동 · 휠 확대<br/>터치: 한 손가락 회전 · 두 손가락 이동/확대</p>
    </section>
    {publicMode&&employee&&selectionPanel}
    {fullscreen.immersive&&<details className={styles.immersivePicker}><summary>건물·직원 선택</summary><div>
      {!inside&&buildings.map(b=><button key={b.id} onClick={()=>select(`asset:${b.assetId}`)} aria-pressed={selected===`asset:${b.assetId}`}>{b.asset.name} 선택</button>)}
      {inside&&config!.rooms.map(r=><button key={r.id} onClick={()=>select(`room:${r.id}`)}>{roomDisplayName(settings,r)} 확대</button>)}
      {employees.filter(e=>e.visible&&(!inside||inside.kind==='hq'||e.id!=='aria')).map(e=><button key={e.id} onClick={()=>select(`employee:${e.id}`)}>{e.name} 직원 선택</button>)}
    </div></details>}
    </div>
    {publicMode&&inside&&<><section className={styles.officeSummary} aria-label="건물 운영 요약"><h3>{inside.asset.name} · 운영 요약</h3><p>담당 직원: {employees.filter(e=>e.visible&&(inside.kind==="hq"||e.id===inside.asset.employeeId)).map(e=>`${e.name} (${e.role})`).join(" · ")}</p><BusinessKpis assetId={inside.assetId}/><Link href={`/assets/${inside.assetId}`}>건물 운영 현황 ↗</Link></section><SimulationControls/><WorkflowCard assetId={inside.assetId}/></>}
    {!dashboard&&<div className={styles.controls}>
      {active && <section className={styles.buildControls} aria-label="3D 모듈 건물 제어"><div><span className={styles.eyebrow}>ONE FLOOR AT A TIME</span><h2>{active.asset.name} <small>{active.stage} / 5단계</small></h2><p>{personal?"건설 단계는 도시·상세 화면과 공유합니다.":"기존 DEMO 데이터에 저장되며 도시·상세 화면과 공유합니다."}</p></div><div className={styles.stepper}><button aria-label="3D 층 제거" onClick={() => setStage(active.assetId, active.stage - 1)} disabled={active.stage === 0}>−</button><output aria-label="3D 모듈 층수">{active.stage}</output><button aria-label="3D 층 추가" onClick={() => setStage(active.assetId, active.stage + 1)} disabled={active.stage === 5}>＋</button></div></section>}
      <section className={styles.employeeControls} aria-label="3D 직원 제어"><span className={styles.eyebrow}>A SMALL WALK{personal?"":" · DEMO"}</span><h2>새싹 직원의 하루</h2><p>{personal?"실제 업무 미연결 · 캐릭터 업무 모션은 중지됩니다.":"이동과 업무 실행은 별개인 가상 시뮬레이션입니다."}</p><button disabled={personal} onClick={() => publicMode?publicDemo!.toggle():setWalking(value => !value)}>{inside ? (walking ? "직원 모션 일시정지" : "직원 모션 계속") : (walking ? "산책 일시정지" : "산책 계속")}</button></section>
    </div>}
    {!inside && <div className={styles.accessible} role="group" aria-label="3D 오브젝트 선택">{buildings.map(b => <button key={b.id} aria-pressed={selected === `asset:${b.assetId}`} onClick={() => select(`asset:${b.assetId}`)}>{b.asset.name} 선택</button>)}{worldPlots.filter(p => settings.plots[p.id].visible && !assets.some(a => a.plotId === p.id)).map(p => <button key={p.id} onClick={() => select(`plot:${p.id}`)}>{settings.plots[p.id].name===`부지 ${p.id}` ? `빈 부지 ${p.id}` : settings.plots[p.id].name}</button>)}</div>}
    <div className={styles.accessible} role="group" aria-label="3D 직원 선택">{employees.filter(e=>e.visible&&(!inside || config && (config.kind==="hq" || e.id!=="aria"))).map(e=><button key={e.id} aria-pressed={selected===`employee:${e.id}`} onClick={()=>select(`employee:${e.id}`)}>{e.name} 직원 선택</button>)}</div>
    {!dashboard&&<p className={styles.note}>이미지·외부 모델 없이 Geometry와 Material로 생성합니다. {personal?"기존 도시와 동일한 자산을 사용합니다.":"기존 2D 도시와 동일한 DEMO 자산을 사용합니다."}</p>}
  </div>;
}
