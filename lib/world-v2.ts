import type { Point } from "./employees/movement.ts";

/** Canonical 1000 × 750 plane, matching the 1448 × 1086 source aspect ratio.
 * Points are manually calibrated against terrain-base, never master-image crops. */
export const WORLD_V2 = { width: 1000, height: 750, sourceWidth: 1448, sourceHeight: 1086 };
export const previewQuery = "?preview=world-v2";
export const terrainV2 = "/skycity/world-v2/terrain.webp";
export const interiorV2 = "/skycity/world-v2/interior.webp";
export type WorldPlacement = Point & { width: number; height: number; anchor: { x: number; y: number }; hitWidth: number; hitHeight: number; entrance: Point; depth: number };
function place(x: number, y: number, width: number, height: number): WorldPlacement {
  return { x, y, width, height, anchor: { x: .5, y: 1 }, hitWidth: Math.round(width * .56), hitHeight: Math.max(30, Math.round(width * .2)), entrance: { x, y: y + 22 }, depth: Math.round(y) };
}
export const worldV2Plots: Record<string, WorldPlacement> = {
  "hq-0": place(491, 212, 246, 284),
  "hq-1": place(350, 220, 92, 107),
  "hq-2": place(637, 220, 92, 107),
  "revenue-0": place(237, 324, 175, 202),
  "revenue-1": place(224, 461, 153, 177),
  "revenue-2": place(154, 300, 95, 110),
  "build-0": place(820, 337, 187, 216),
  "build-1": place(892, 310, 96, 111),
  "build-2": place(738, 289, 96, 111),
  "marketing-0": place(735, 485, 177, 204),
  "marketing-1": place(673, 462, 94, 109),
  "marketing-2": place(815, 467, 94, 109),
};
export const worldV2Labels = {
  hq: { x: 410, y: 48, name: "중앙 본사" },
  revenue: { x: 48, y: 200, name: "수익 자산 구역" },
  build: { x: 775, y: 182, name: "개발 건설 구역" },
  marketing: { x: 744, y: 531, name: "마케팅 구역" },
};
export const worldV2Spawn = { x: 526, y: 535 };
// Open paving east of the fountain, then central stairs to the HQ front door.
export const worldV2Walk: readonly Point[] = [
  { x: 546, y: 501 }, { x: 595, y: 457 }, { x: 639, y: 402 },
  { x: 646, y: 349 }, { x: 611, y: 305 }, { x: 562, y: 282 },
  { x: 533, y: 262 }, { x: 510, y: 248 }, worldV2Plots["hq-0"].entrance,
];
export function sourceToWorld(point: Point): Point { return { x: point.x / WORLD_V2.sourceWidth * WORLD_V2.width, y: point.y / WORLD_V2.sourceHeight * WORLD_V2.height }; }
export function worldToScreen(point: Point, viewport: { width: number; height: number }, camera: Point, scale: number): Point {
  return { x: viewport.width / 2 + (point.x - WORLD_V2.width / 2 + camera.x) * scale, y: viewport.height / 2 + (point.y - WORLD_V2.height / 2 + camera.y) * scale };
}
export function screenToWorld(point: Point, viewport: { width: number; height: number }, camera: Point, scale: number): Point {
  return { x: (point.x - viewport.width / 2) / scale + WORLD_V2.width / 2 - camera.x, y: (point.y - viewport.height / 2) / scale + WORLD_V2.height / 2 - camera.y };
}
