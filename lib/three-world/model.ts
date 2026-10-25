import type { Asset } from "../domain.ts";
import { assetStatus } from "../domain.ts";

export type BuildingKind = "hq" | "revenue" | "development" | "marketing" | "operations";
export type Vec3 = [number, number, number];
export const kindNames: Record<BuildingKind, string> = { hq: "중앙 본사", revenue: "수익 자산", development: "개발 연구소", marketing: "마케팅 스튜디오", operations: "운영 지원" };
export const palettes: Record<BuildingKind, { wall: string; roof: string; trim: string }> = {
  hq: { wall: "#fff0d3", roof: "#88b5a1", trim: "#ddc59c" },
  revenue: { wall: "#f6e4c8", roof: "#d9a18c", trim: "#e4c4a5" },
  development: { wall: "#dfe9ec", roof: "#91afc9", trim: "#c0d0db" },
  marketing: { wall: "#f3dce8", roof: "#b59aca", trim: "#ddbad1" },
  operations: { wall: "#e6ecd8", roof: "#a1b29a", trim: "#c4ceb1" },
};
export type WorldPlot = { id: string; kind: BuildingKind; position: Vec3; entrance: Vec3; road: Vec3; scale: number; islandId: string };
const plot = (id: string, kind: BuildingKind, x: number, z: number, road: Vec3, scale = .9): WorldPlot => ({ id, kind, position: [x, .2, z], entrance: [x, .23, z + (kind === "hq" ? 1.75 : 1.3)], road, scale, islandId: "main" });
export const worldPlots: WorldPlot[] = [
  plot("hq-0", "hq", 0, -3.8, [0, .23, -.8], 1.1),
  plot("hq-1", "hq", -4, -5, [-3.3, .23, -.7], .7), plot("hq-2", "hq", 4, -5, [3.3, .23, -.7], .7),
  plot("revenue-0", "revenue", -5.2, -.7, [-3.3, .23, 1]),
  plot("revenue-1", "operations", -4.8, 3.1, [-2, .23, 5.3]),
  plot("revenue-2", "revenue", -8, 1.4, [-3.3, .23, 1], .65),
  plot("build-0", "development", 5, -.8, [3.4, .23, 1]),
  plot("build-1", "development", 7.8, -2.7, [3.3, .23, -.7], .65), plot("build-2", "development", 8, .9, [3.4, .23, 1], .65),
  plot("marketing-0", "marketing", 4.5, 3.4, [2, .23, 5.3]),
  plot("marketing-1", "marketing", 1, 6.4, [0, .23, 5.6], .65), plot("marketing-2", "marketing", 7, 4.1, [3.4, .23, 3.4], .65),
];
export type WorldBuilding = WorldPlot & { id: string; plotId: string; assetId: string; asset: Asset; stage: number; status: string; employeeId: string | null; interior: BuildingKind };
export function projectBuildings(assets: readonly Asset[]): WorldBuilding[] {
  return assets.flatMap(asset => { const p = worldPlots.find(p => p.id === asset.plotId); return p ? [{ ...p, id: `world:${asset.id}`, plotId: p.id, assetId: asset.id, asset, stage: asset.stage, status: assetStatus(asset.stage), employeeId: asset.employeeId, interior: p.kind }] : []; });
}
export const cityRoad: Vec3[] = [[-3.3, .23, 1], [-2.5, .23, -.4], [0, .23, -.8], [2.5, .23, -.4], [3.4, .23, 1], [3.4, .23, 3.4], [2, .23, 5.3], [0, .23, 5.6], [-2, .23, 5.3], [-3.4, .23, 3.4]];
export const floatingIslands = [{ id: "park-east", position: [14, -1, -4] as Vec3, scale: .32 }];

// 3D-only presentation palette: the established 2D employee themes stay unchanged.
export const staffThemes = {
  executive: { label: "대표", color: "#bba2df" }, development: { label: "개발", color: "#93bee5" },
  marketing: { label: "마케팅", color: "#e5a8c8" }, content: { label: "콘텐츠", color: "#c6b1e6" },
  finance: { label: "재무", color: "#ead28d" }, operations: { label: "운영", color: "#a6bd9a" },
  support: { label: "고객지원", color: "#a7d4ea" }, quality: { label: "검수", color: "#77b7a3" },
} as const;
export type StaffDepartment = keyof typeof staffThemes;
