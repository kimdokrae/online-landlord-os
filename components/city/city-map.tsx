"use client";
import {useDataMode} from "../operations/data-mode-provider";
import {useOperations} from "../operations/operations-provider";
import {BusinessKpis} from "../public-demo/business-dashboard";
import Link from "next/link";
import { useState } from "react";
import { assetStatus, stages, type Asset, type Plot } from "@/lib/domain";
import { islands, plots } from "@/lib/demo/data";
import { BuildingObject, PlotObject } from "./world-objects";
import { previewQuery, worldV2Plots, worldV2Labels } from "@/lib/world-v2";
import { TerrainWorld, BuildingDiorama } from "./terrain-world";
import { plotPositions, districtLabels } from "./world-layout";
import { useCityCamera } from "./use-city-camera";
import { useSettings } from "../settings/settings-provider";
import { WorldSky } from "./world-sky";
import { useImmersive } from "./use-immersive";
import { CityEmployee } from "../employees/city-employee";
import styles from "./village.module.css";

function ExpandIcon({ exit = false }: { exit?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">{exit ? <path d="m7 7 10 10M7 17 17 7"/> : <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>}</svg>;
}
export function CityMap({ assets, selectedId, onSelect, onEmptyPlot, disabled, worldV2 = false }: {
  worldV2?: boolean; assets: Asset[]; selectedId: string | null; onSelect: (id: string) => void; onEmptyPlot: (plot: Plot) => void; disabled: boolean;
}) {
  const {personal}=useDataMode(),operations=useOperations();
  const {config}=useSettings(),company=config.company;
  const positions = worldV2 ? worldV2Plots : plotPositions;
  const labels = worldV2 ? worldV2Labels : districtLabels;
  const suffix = worldV2 ? previewQuery : "";
  const mode = useImmersive();
  const camera = useCityCamera(worldV2 ? { bounded: true, minZoom: 1, maxZoom: 4, sourceWidth: 1448 } : {});
  const [cardOpen, setCardOpen] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const selected = assets.find(a => a.id === selectedId);
  const cardVisible = !!(mode.immersive && cardOpen && selected);
  const select = (id: string) => { onSelect(id); setCardOpen(true); setEmployeeOpen(false); };
  return <div ref={mode.root} className={`${styles.explorer} ${mode.immersive ? styles.immersive : ""} ${cardVisible ? styles.withCard : ""}`}
    role={mode.immersive ? "dialog" : undefined} aria-modal={mode.immersive ? true : undefined} aria-label={mode.immersive ? "스카이시티 전체 화면 탐험" : personal?"공중섬 도시":"데모 공중섬 도시"} data-immersive={mode.immersive} data-world-version={worldV2 ? "world-v2" : "stable"}>
    {worldV2 ? <WorldSky/> : <><div className={styles.skyGlow}/><div className={`${styles.cloud} ${styles.cloudOne}`}/><div className={`${styles.cloud} ${styles.cloudTwo}`}/><div className={`${styles.cloud} ${styles.cloudThree}`}/></>}
    <div className={styles.exploreHeader}>
      <div className={styles.worldTitle}><span>SKY CITY {!personal&&<i>DEMO</i>}</span><strong>{company.cityName}</strong><small>{company.name}</small></div>
      <button type="button" className={styles.modeButton} ref={mode.immersive ? mode.exitButton : mode.enterButton} onClick={mode.immersive ? mode.exit : mode.enter} aria-label={mode.immersive ? "전체 화면 종료" : "전체 화면 탐험"}><ExpandIcon exit={mode.immersive}/><span>{mode.immersive ? "전체 화면 종료" : "전체 화면"}</span>{mode.immersive && <kbd>ESC</kbd>}</button>
    </div>
    <div className={styles.viewport} ref={camera.viewport} {...camera.gestures} tabIndex={0} role="region" aria-label="도시 탐색 영역" aria-describedby="city-camera-help" data-camera={JSON.stringify(camera.camera)} data-dragging={camera.dragging}>
      <div className={styles.world} style={camera.worldStyle}>
        <TerrainWorld worldV2={worldV2}/>
        <CityEmployee worldV2={worldV2} overlayRoot={mode.root} open={employeeOpen} onOpen={() => { setEmployeeOpen(true); setCardOpen(false); }} onClose={() => setEmployeeOpen(false)} immersive={mode.immersive}/>
        {islands.map((island, index) => {
          const label = labels[island.id];
          return <section key={island.id} className={styles.district} aria-label={config.districts[island.id].name}>
            <div className={styles.districtLabel} style={{ left: label.x, top: label.y }}><span>0{index + 1}</span><div><strong>{config.districts[island.id].name}</strong><small>{config.districts[island.id].description}</small></div><i aria-hidden="true">{["⚑", "↗", "⚒", "✦"][index]}</i></div>
            {plots.filter(p => p.islandId === island.id).map(plot => {
              const asset = assets.find(a => a.plotId === plot.id);
              const position = positions[plot.id];
              return asset ? <BuildingObject grounded={worldV2} key={plot.id} asset={asset} district={island.id} placement={position} selected={selectedId === asset.id} onSelect={() => select(asset.id)} disabled={disabled}/>
                : <PlotObject key={plot.id} plotId={plot.id} placement={position} label={`${island.name} 빈 부지 ${plot.position + 1} 등록`} onSelect={() => { mode.exit(); onEmptyPlot(plot); }} disabled={disabled}/>;
            })}
          </section>;
        })}
      </div>
    </div>
    {cardVisible && selected && <aside className={styles.floatingCard} aria-label="탐험 모드 건물 정보" aria-live="polite"><button className={styles.cardClose} aria-label="건물 정보 카드 닫기" onClick={() => setCardOpen(false)}><ExpandIcon exit/></button><span className={styles.cardEyebrow}>A LITTLE PLACE IN YOUR WORLD{personal?"":" · DEMO"}</span><div className={styles.cardArt}><BuildingDiorama worldV2={worldV2} stage={selected.stage} color={selected.color} district={plots.find(p => p.id === selected.plotId)?.islandId} headquarters={selected.type === "본사"}/></div><h3>{selected.name}</h3><span className={styles.cardStatus}>{assetStatus(selected.stage)} · {stages[selected.stage]} · {selected.stage}/5층</span>{operations?.usingConnected?<BusinessKpis assetId={selected.id}/>:<p>{selected.kpi.label}<strong>{selected.kpi.value.toLocaleString()} / {selected.kpi.target.toLocaleString()}{selected.kpi.unit}</strong></p>}<Link href={`/assets/${selected.id}${suffix}`} onClick={mode.exit} className={styles.detailLink}>{selected.type === "본사" ? "운영 현황 보기" : "건물 상세 보기"} <span aria-hidden="true">↗</span></Link>{selected.type === "본사" && <Link href={`/assets/${selected.id}/office${suffix}`} onClick={mode.exit} className={styles.detailLink} style={{ marginTop: 8 }}>건물 내부 입장 <span aria-hidden="true">↗</span></Link>}</aside>}
    <div className={styles.cameraControls} role="group" aria-label="도시 카메라 제어"><span className={styles.zoomValue} aria-live="polite">{Math.round(camera.camera.zoom * 100)}%</span><button aria-label="도시 확대" onClick={() => camera.zoomAt(1.25)} disabled={camera.camera.zoom >= camera.limits.max}>＋</button><button aria-label="도시 축소" onClick={() => camera.zoomAt(1 / 1.25)} disabled={camera.camera.zoom <= camera.limits.min}>−</button><span className={styles.controlDivider}/><button aria-label="전체 섬 맞춤 보기" title="전체 섬 맞춤 보기" onClick={camera.reset}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8Z"/></svg></button><button aria-label="카메라 위치 초기화" title="카메라 위치 초기화" onClick={camera.reset}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 10a8 8 0 1 1 0 5M4 4v6h6"/></svg></button></div>
    <div className={styles.worldFooter}><span><i className={styles.live}/> 운영 예시 <i className={styles.construction}/> 건설 예시</span><span id="city-camera-help">드래그로 산책 · 휠/두 손가락으로 확대<br/>키보드: 방향키 이동 · + / − 확대 · 0 맞춤</span></div>
  </div>;
}
