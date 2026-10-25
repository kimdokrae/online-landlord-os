import type { Point } from "./movement.ts";
import { plotPositions } from "../../components/city/world-layout.ts";

// World-space coordinates on the existing 1000 × 750 garden plate. No screen pixels.
export const gardenSpawn: Point = { x: 545, y: 489 };
export const gardenWalk: readonly Point[] = [
  { x: 547, y: 451 }, { x: 528, y: 423 }, { x: 516, y: 388 },
  { x: 507, y: 357 }, { x: 535, y: 337 }, { x: 553, y: 314 },
  { x: 548, y: 290 }, { x: 520, y: 265 }, { x: 487, y: 254 }, { x: 481, y: 240 },
];
export function buildingEntrance(plotId: string): Point | null {
  if (plotId === "hq-0") return { ...gardenWalk[gardenWalk.length - 1] };
  const placement = plotPositions[plotId];
  return placement ? { x: placement.x, y: placement.y + 17 } : null;
}
