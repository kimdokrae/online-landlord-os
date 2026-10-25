import type { Point } from "../employees/movement.ts";
export const OFFICE = { columns: 24, rows: 18, tile: 32, width: 768, height: 576 } as const;
export type Rect = { x: number; y: number; width: number; height: number };
export type Furniture = Rect & { id: string; kind: "desk" | "meeting" | "plant" | "sofa" | "shelf"; label: string };
export const furniture: Furniture[] = [
  { id: "main-desk", kind: "desk", label: "본부 업무 책상", x: 4, y: 4, width: 3, height: 2 },
  { id: "dev-desk", kind: "desk", label: "개발 업무 책상", x: 17, y: 12, width: 3, height: 2 },
  { id: "meeting-table", kind: "meeting", label: "회의 테이블", x: 16, y: 3, width: 5, height: 3 },
  { id: "content-sofa", kind: "sofa", label: "콘텐츠 라운지", x: 3, y: 13, width: 4, height: 2 },
  { id: "hq-shelf", kind: "shelf", label: "자료 보관장", x: 1, y: 2, width: 1, height: 3 },
  { id: "dev-shelf", kind: "shelf", label: "개발 자료장", x: 21, y: 12, width: 1, height: 3 },
  { id: "plant-a", kind: "plant", label: "본부 화분", x: 8, y: 2, width: 1, height: 1 },
  { id: "plant-b", kind: "plant", label: "회의실 화분", x: 21, y: 2, width: 1, height: 1 },
  { id: "plant-c", kind: "plant", label: "라운지 화분", x: 8, y: 15, width: 1, height: 1 },
];
export const destinations = {
  desk: { label: "본부 책상", point: { x: 5, y: 6 }, state: "RUNNING" },
  meeting: { label: "회의 테이블", point: { x: 17, y: 6 }, state: "MEETING" },
  executive: { label: "대표실 입구", point: { x: 11, y: 2 }, state: "COMPLETED" },
  development: { label: "개발 구역", point: { x: 18, y: 14 }, state: "RUNNING" },
  lobby: { label: "로비", point: { x: 11, y: 16 }, state: "NONE" },
} as const;
export type DestinationId = keyof typeof destinations;
export const officeEntrance = destinations.lobby.point;
function contains(rect: Rect, x: number, y: number) { return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height; }
export function isWall(x: number, y: number) {
  if (x === 0 || y === 0 || x === 23 || y === 17) return true;
  if ((x === 10 || x === 13) && (y <= 7 || y >= 11)) return true;
  if ((y === 8 || y === 10) && x >= 1 && x <= 9 && x !== 5 && x !== 6) return true;
  if ((y === 8 || y === 10) && x >= 14 && x <= 22 && x !== 18 && x !== 19) return true;
  return false;
}
export function isWalkable(point: Point) {
  const { x, y } = point;
  return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < OFFICE.columns && y >= 0 && y < OFFICE.rows && !isWall(x, y) && !furniture.some(item => contains(item, x, y));
}
