"use client";
import { memo, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { PCFSoftShadowMap } from "three";
import { SceneResources } from "./resources";
import { CityTerrain, CityBuilding, CityPlots } from "./city-world";
import { StaffActors } from "./staff-actors";
import type { SimulationSession } from "@/lib/three-world/simulation";
import { OfficeScene } from "./office-scene";
import { WorldLabels } from "./world-labels";
import type { OfficeSettings } from "@/lib/settings/defaults";
import { WorldCamera } from "./world-camera";
import type { WorldBuilding } from "@/lib/three-world/model";
import type { CameraCommand, CameraPose, LabSelection, LabTelemetry, StaffOrder } from "./lab-types";
export type SceneProps = { buildings: WorldBuilding[]; selected: LabSelection; walking: boolean; command: CameraCommand | null; onSelect: (id: LabSelection) => void; onTelemetry: (value: LabTelemetry) => void; mode?: string; restore?: CameraPose; visibleFloor?: number | null; session: SimulationSession; orders: Record<string,StaffOrder>; settings: OfficeSettings; publicSimulation?:{tick:number;revision:number;disabled?:boolean}; labelElements: RefObject<Map<string,HTMLElement>> };
export default memo(function LabScene({ buildings, selected, command, onSelect, onTelemetry, mode = "city", restore, visibleFloor = null, walking, session, orders, settings, labelElements, publicSimulation }: SceneProps) {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches;
  const inside = buildings.find(b => b.assetId === mode);
  return <Canvas orthographic camera={{ position: [22, 22.2, 22], zoom: 30, near: .1, far: 150 }} dpr={mobile ? 1 : [1, 1.5]} shadows gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.shadowMap.type = PCFSoftShadowMap; gl.toneMappingExposure = 1.05; }} onPointerMissed={() => onSelect(null)} fallback={<div role="alert">WebGL2를 사용할 수 없어 실제 3D 월드를 표시하지 못했습니다.</div>}>
    <hemisphereLight args={["#fff5ed", "#b8b7c7", 1.25]}/><ambientLight intensity={.35}/>
    <directionalLight position={[-8, 18, 12]} intensity={3.2} color="#fff0d8" castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-near={.5} shadow-camera-far={60} shadow-bias={-.0002} shadow-normalBias={.035} shadow-radius={4}/>
    <directionalLight position={[7, 5, -6]} intensity={.65} color="#e4dffc"/>
    <SceneResources>{inside ? <OfficeScene kind={inside.interior} visibleFloor={visibleFloor} selected={selected} onSelect={onSelect}/> : <><CityTerrain/>{buildings.map(b => <CityBuilding key={b.id} building={b} selected={selected === `asset:${b.assetId}`} onSelect={onSelect}/>)}<CityPlots plotVisibility={settings.plots} buildings={buildings} selected={selected} onSelect={onSelect}/></>}<StaffActors publicSimulation={publicSimulation} profiles={settings.employees} departments={settings.departments} buildings={buildings} inside={inside} visibleFloor={visibleFloor} orders={orders} session={session} walking={walking} selected={selected} onSelect={onSelect}/></SceneResources>
    <WorldCamera command={command} onTelemetry={onTelemetry} mode={mode} restore={restore} levels={inside?.kind === "hq" ? 2 : 1}/><WorldLabels elements={labelElements}/>
  </Canvas>;
});
