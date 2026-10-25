"use client";
import {useDataMode} from "../operations/data-mode-provider";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef, type MouseEvent } from "react";
import { usePresentation } from "@/components/settings/settings-provider";
import { useDemoEmployee } from "@/components/employees/employee-provider";
import { useEmployeeMovement } from "@/components/employees/use-employee-movement";
import { EmployeeCharacter } from "@/components/employees/employee-character";
import { EmployeeInspector } from "@/components/employees/employee-inspector";
import { employeeAnimation, activityLabels } from "@/lib/employees/status-adapter";
import { employeeThemes } from "@/lib/employees/themes";
import type { Point } from "@/lib/employees/movement";
import { OFFICE as originalOffice, destinations as originalDestinations, type DestinationId, isWalkable as originalWalkable } from "@/lib/office/layout";
import { findOfficePath } from "@/lib/office/pathfinding";
import { EmptyState, PageHeading, Badge } from "../ui";
import { INTERIOR_GRID, interiorDestinations, interiorWalkable, departmentZones, type DepartmentZoneSpec } from "@/lib/office/world-v2-layout";
import { previewQuery } from "@/lib/world-v2";
import { useCityCamera } from "../city/use-city-camera";
import { OfficeV2Scene } from "./office-v2-scene";
import { OfficeScene } from "./office-scene";
import styles from "./office.module.css";

export function OfficeWorld({ assetId, worldV2 = false }: { assetId: string; worldV2?: boolean }) {
  const {personal,copy}=useDataMode();
  const OFFICE = worldV2 ? INTERIOR_GRID : originalOffice;
  const destinations = worldV2 ? interiorDestinations : originalDestinations;
  const isWalkable = worldV2 ? interiorWalkable : originalWalkable;
  const officeEntrance = destinations.lobby.point;
  const { assets, ready } = usePresentation();
  const asset = assets.find(item => item.id === assetId);
  const valid = asset?.type === "본사";
  const camera = useCityCamera({ enabled: worldV2 && ready && valid, bounded: true, minZoom: 1, maxZoom: 6, sourceWidth: 1448 });
  const { focusRect } = camera;
  const overlayRoot = useRef<HTMLDivElement>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const employee = useDemoEmployee();
  const movement = useEmployeeMovement(officeEntrance, worldV2 ? 10 : 5);
  const { move, setPaused, positionRef } = movement;
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<Point>(destinations.desk.point);
  const [goalName, setGoalName] = useState("본부 책상");
  const [routePreview, setRoutePreview] = useState<Point[]>([]);
  const [message, setMessage] = useState("입구에서 책상으로 이동을 준비합니다.");
  const { setWorkState } = employee;
  const goTo = useCallback((point: Point, name: string, arrivalState: typeof destinations[DestinationId]["state"], follow = false) => {
    const start = { x: Math.round(positionRef.current.x), y: Math.round(positionRef.current.y) };
    const path = findOfficePath(start, point, isWalkable);
    if (!path) { setMessage("벽이나 가구가 있는 곳으로는 이동할 수 없습니다. 빈 복도나 목적지를 선택해 주세요."); return; }
    if (worldV2 && follow) focusRect({ x: point.x * 10 - 100, y: point.y * 10 - 90, width: 200, height: 160 });
    setWorkState("NONE"); setPaused(false); setGoal(point); setGoalName(name); setRoutePreview([start, ...path]);
    setMessage(`${name}(으)로 이동합니다. 이동은 DEMO 동작입니다.`);
    move([start, ...path], () => { setWorkState(arrivalState); setMessage(`${name}에 도착했습니다. ${arrivalState === "NONE" ? "대기" : "업무 모션"} DEMO입니다.`); setRoutePreview([]); });
  }, [positionRef, move, setPaused, setWorkState, isWalkable, worldV2, focusRect]);
  useEffect(() => { if (ready && valid) goTo(destinations.desk.point, destinations.desk.label, destinations.desk.state); }, [ready, valid, goTo, destinations]);
  useEffect(() => { if (employee.signal.state === "FAILED") setPaused(true); }, [employee.signal.state, setPaused]);
  const activity = employeeAnimation(employee.signal, movement.walking);
  function selectZone(zone: DepartmentZoneSpec | null) { setSelectedZoneId(zone?.id ?? null); if (zone) focusRect(zone); }
  function resetCamera() { setSelectedZoneId(null); camera.reset(); }
  function floorClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: Math.floor((event.clientX - rect.left) / rect.width * OFFICE.columns), y: Math.floor((event.clientY - rect.top) / rect.height * OFFICE.rows) };
    const target = Object.values(destinations).find(item => item.point.x === point.x && item.point.y === point.y);
    goTo(point, target?.label ?? "선택한 복도", target?.state ?? "NONE");
  }
  if (!ready) return <div role="status" className="loading-state">오피스를 준비하는 중…</div>;
  if (!valid) return <EmptyState title="본사 실내를 찾을 수 없습니다" description="현재는 중앙 본사의 DEMO 실내만 지원합니다. 도시에서 본사를 선택해 주세요."/>;
  const scene = <div className={styles.scene} data-office-version={worldV2 ? "world-v2" : "stable"} onClick={floorClick} style={worldV2 ? camera.worldStyle : undefined}>{worldV2 ? <OfficeV2Scene selectedZoneId={selectedZoneId} onSelectZone={selectZone} overlayRoot={overlayRoot}/> : <OfficeScene/>}
      <svg className={styles.route} viewBox={`0 0 ${OFFICE.width} ${OFFICE.height}`} aria-hidden="true"><polyline points={routePreview.map(p => `${(p.x + .5) * OFFICE.tile},${(p.y + .5) * OFFICE.tile}`).join(" ")} fill="none" stroke="#8eac91" strokeWidth="4" strokeDasharray="5 7" opacity=".45"/><circle cx={(goal.x + .5) * OFFICE.tile} cy={(goal.y + .5) * OFFICE.tile} r="10" fill="#fff4c13b" stroke="#cab679" strokeWidth="2"/></svg>
      <button className={styles.actor} aria-label={`${employee.name} 실내 직원 선택`} style={{ display:employee.visible?undefined:"none", left: `${(movement.position.x + .5) / OFFICE.columns * 100}%`, top: `${(movement.position.y + .5) / OFFICE.rows * 100}%` }} onClick={event => { event.stopPropagation(); setOpen(true); }} data-employee-id={employee.id} data-scene-employee="office" data-x={movement.position.x} data-y={movement.position.y} data-motion={activity} data-goal={goalName} data-walkable={isWalkable({ x: Math.round(movement.position.x), y: Math.round(movement.position.y) })}>
        <EmployeeCharacter bodyColor={employee.customColor} department={employee.department} activity={activity} facing={movement.facing}/><span>{employee.name}</span>
      </button>
    </div>;
  return <><Link className="back-link" href={worldV2 ? `/city${previewQuery}` : "/city"}>← 도시로 돌아가기</Link><PageHeading pageId="interior" entity={{name:asset?.name,description:asset?.description}} action={<Badge>실제 AI 실행 없음</Badge>}/>
    <div className={styles.toolbar}><div><strong>{personal?"실내 탐색 · 업무 미연결":"DEMO 실내 시뮬레이션"}</strong><span>{worldV2 ? "부서를 선택하거나 1층 복도 목적지로 이동하세요." : "빈 복도를 클릭하거나 목적지 버튼을 선택하세요."}</span></div><button className="button secondary" onClick={() => { setWorkState("NONE"); setPaused(!movement.paused); }}>{movement.paused ? "이동 계속" : "이동 일시정지"}</button></div>
    <div className={styles.layout}><section className={styles.worldPanel} aria-label="본사 실내 오피스">{worldV2 ? <><div className={styles.departmentViews} role="group" aria-label="부서별 빠른 확대">{departmentZones.map(zone => <button key={zone.id} aria-label={`${zone.quickLabel} 빠른 확대`} aria-pressed={selectedZoneId === zone.id} onClick={() => selectZone(zone)}>{zone.quickLabel}</button>)}</div>
      <div className={styles.cameraStage} ref={overlayRoot}>
        <div className={styles.cameraViewport} ref={camera.viewport} {...camera.gestures} tabIndex={0} role="region" aria-label="본사 내부 탐색 영역" aria-describedby="office-camera-help" data-camera={JSON.stringify(camera.camera)} data-scale={camera.scale} data-dragging={camera.dragging}>{scene}</div>
        <div className={styles.cameraControls} role="group" aria-label="본사 카메라 제어"><output aria-label="본사 확대 배율">{Math.round(camera.camera.zoom * 100)}%</output><button aria-label="본사 확대" onClick={() => camera.zoomAt(1.25)} disabled={camera.camera.zoom >= camera.limits.max}>＋</button><button aria-label="본사 축소" onClick={() => camera.zoomAt(.8)} disabled={camera.camera.zoom <= camera.limits.min}>−</button><button aria-label="전체 건물 맞춤 보기" onClick={resetCamera}>⊡<span>전체 보기</span></button><button aria-label="본사 카메라 초기화" onClick={resetCamera}>↺<span>초기화</span></button></div>
      </div></> : scene}<div className={styles.sceneFooter} id={worldV2 ? "office-camera-help" : undefined}><span>{worldV2 ? "드래그 이동 · 휠/두 손가락 확대 · + / − · 방향키 · 0 맞춤" : "입구 → 책상 · 벽과 가구를 피해 4방향으로 이동"}</span><span>{activityLabels[activity]}{personal?"":" · DEMO"}</span></div></section>
    <aside className={styles.sidebar}>{open ? <EmployeeInspector activity={activity} onClose={() => setOpen(false)} onStateChange={state => setPaused(state !== "NONE")}/> : <div className={styles.employeeSummary}><EmployeeCharacter bodyColor={employee.customColor} department={employee.department} activity={activity}/><Badge tone="neutral">{personal?"직원 · 업무 미연결":"DEMO 직원 1명"}</Badge><h2>{employee.name}</h2><p>{employeeThemes[employee.department].label} · {activityLabels[activity]}</p><small>캐릭터를 클릭하면 부서 색상과<br/>{personal?"직원 정보를 확인할 수 있어요.":"데모 업무 상태를 바꿀 수 있어요."}</small><button className="button secondary full" onClick={() => setOpen(true)}>직원 카드 보기</button></div>}
    <div className={styles.destinations}><h2>어디로 갈까요?</h2>{Object.entries(destinations).map(([id, destination]) => <button key={id} aria-pressed={goalName === destination.label} onClick={() => goTo(destination.point, destination.label, destination.state, true)}>{destination.label}<span aria-hidden="true">↗</span></button>)}</div></aside></div>
    <p role="status" className={styles.message}>{copy(message)}</p><p className={styles.disclaimer}>이동과 업무 모션은 브라우저에서 실행되는 가상 시뮬레이션입니다. 실제 업무 성공·승인·모델 실행을 의미하지 않습니다.</p>
  </>;
}
