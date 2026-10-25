import { memo } from "react";
import type { IslandId } from "@/lib/domain";
import { VillageBuilding } from "./village-building";
import { terrainV2 } from "@/lib/world-v2";
import styles from "./village.module.css";

/** Generated scenery only. Buildings, selection and input targets are independent React nodes. */
export const TerrainWorld = memo(function TerrainWorld({ worldV2 = false }: { worldV2?: boolean }) {
  return <img className={styles.terrainPlate} src={worldV2 ? terrainV2 : "/skycity/garden-terrain.webp"} alt="" aria-hidden="true" width="1448" height="1086" decoding="async" fetchPriority="high" draggable={false}/>;
});

export function BuildingDiorama(props: { worldV2?: boolean; stage: number; color: string; district?: IslandId; headquarters?: boolean }) {
  return <div className={styles.diorama} aria-hidden="true"><img src={props.worldV2 ? terrainV2 : "/skycity/garden-terrain.webp"} alt="" width="1448" height="1086" decoding="async" draggable={false}/><VillageBuilding {...props} grounded={props.worldV2}/></div>;
}
