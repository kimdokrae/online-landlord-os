import type { CSSProperties } from "react";
import type { Asset, IslandId } from "@/lib/domain";
import type { WorldPlacement } from "@/lib/world-v2";
import { VillageBuilding } from "./village-building";
import styles from "./village.module.css";

type Placement = { x: number; y: number; width: number; height: number } & Partial<WorldPlacement>;
function placementStyle(p: Placement): CSSProperties {
  return { left: p.x, top: p.y, zIndex: p.depth ?? Math.round(p.y), width: p.hitWidth, height: p.hitHeight,
    transform: p.anchor ? `translate(${-p.anchor.x * 100}%, ${-p.anchor.y * 100}%)` : undefined,
    "--building-width": `${p.width}px`, "--building-height": `${p.height}px` } as CSSProperties;
}
export function BuildingObject({ asset, district, placement, selected, disabled, onSelect, grounded = false }: { grounded?: boolean; asset: Asset; district: IslandId; placement: Placement; selected: boolean; disabled: boolean; onSelect: () => void }) {
  return <button type="button" className={`${styles.building} ${selected ? styles.selected : ""}`} style={placementStyle(placement)} aria-label={`${asset.name} 건물 선택`} aria-pressed={selected} onClick={onSelect} disabled={disabled} data-asset-id={asset.id} data-plot-id={asset.plotId} data-world-x={placement.x} data-world-y={placement.y}>
    <span className={styles.selectionRing}/><VillageBuilding grounded={grounded} stage={asset.stage} color={asset.color} district={district} headquarters={asset.type === "본사"}/><span className={styles.buildingLabel}>{asset.name}<i className={asset.stage === 5 ? styles.live : styles.construction}/></span>
  </button>;
}
export function PlotObject({ placement, label, plotId, disabled, onSelect }: { placement: Placement; label: string; plotId: string; disabled: boolean; onSelect: () => void }) {
  return <button type="button" className={styles.emptyPlot} style={{ left: placement.x, top: placement.y, zIndex: placement.depth ?? Math.round(placement.y) }} aria-label={label} onClick={onSelect} disabled={disabled} data-plot-id={plotId}><span aria-hidden="true">＋</span><small>빈 부지</small></button>;
}
