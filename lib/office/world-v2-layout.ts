import type { Point } from "../employees/movement.ts";
import type { EmployeeDepartment } from "../employees/themes.ts";
// The background is a flat cutaway. Only the ground-floor open front corridor
// is navigable; upper floors are selectable rooms, not fake connected stairs.
export const INTERIOR_GRID = { columns: 100, rows: 75, tile: 10, width: 1000, height: 750 };
export const interiorDestinations = {
  desk: { label: "본부 업무 자리 앞", point: { x: 57, y: 59 }, state: "RUNNING" },
  meeting: { label: "로비 미팅 지점", point: { x: 43, y: 61 }, state: "MEETING" },
  executive: { label: "본부 보고 지점", point: { x: 50, y: 59 }, state: "COMPLETED" },
  development: { label: "운영 구역 앞 복도", point: { x: 26, y: 59 }, state: "RUNNING" },
  lobby: { label: "중앙 로비", point: { x: 50, y: 61 }, state: "NONE" },
} as const;
export function interiorWalkable({ x, y }: Point) {
  return Number.isInteger(x) && Number.isInteger(y) && ((y === 61 && x >= 22 && x <= 78) || (y >= 59 && y <= 61 && [26, 43, 50, 57, 73].includes(x)));
}
const originalZones: { id: EmployeeDepartment; label: string; x: number; y: number; width: number; height: number; description: string }[] = [
  { id: "headquarters", label: "본부 · 대표실", x: 180, y: 181, width: 215, height: 94, description: "경영 및 전략 검토 공간 · 상층 이동은 준비 중" },
  { id: "quality", label: "검수 · 회의실", x: 410, y: 181, width: 195, height: 94, description: "품질 검토 및 회의 공간 · 상층 이동은 준비 중" },
  { id: "marketing", label: "마케팅 · 전략실", x: 620, y: 181, width: 196, height: 94, description: "채널 전략 공간 · 상층 이동은 준비 중" },
  { id: "development", label: "개발", x: 620, y: 290, width: 222, height: 86, description: "개발 업무 공간 · 상층 이동은 준비 중" },
  { id: "content", label: "콘텐츠", x: 165, y: 394, width: 226, height: 83, description: "콘텐츠 스튜디오 · 상층 이동은 준비 중" },
  { id: "support", label: "고객지원", x: 620, y: 394, width: 222, height: 83, description: "고객지원 공간 · 상층 이동은 준비 중" },
  { id: "operations", label: "운영", x: 165, y: 500, width: 226, height: 88, description: "운영 데스크 · 아래 개방 복도에서 이동 가능" },
  { id: "finance", label: "재무", x: 620, y: 500, width: 222, height: 88, description: "재무 데스크 · 아래 개방 복도에서 이동 가능" },
];
export type DepartmentZoneSpec = { id: string; department: EmployeeDepartment; label: string; quickLabel: string; x: number; y: number; width: number; height: number; description: string };
const quickLabels: Record<EmployeeDepartment, string> = { headquarters: "대표실", quality: "회의실", development: "개발팀", marketing: "마케팅팀", content: "콘텐츠팀", support: "고객지원팀", operations: "운영팀", finance: "재무팀" };
export const departmentZones: DepartmentZoneSpec[] = [
  ...originalZones.map(zone => ({ ...zone, department: zone.id, quickLabel: quickLabels[zone.id] })),
  { id: "legal-quality", department: "quality", label: "법무·검수", quickLabel: "법무·검수팀", x: 165, y: 290, width: 226, height: 86, description: "법무·검수 공간 · 상층 이동은 준비 중" },
];
// Presentation assignments point to existing DEMO employee IDs; no second employee store.
export const interiorStaff: { employeeId: string; department: EmployeeDepartment; x: number; y: number; activity: "WORKING" | "IDLE" }[] = [
  { employeeId: "leo", department: "development", x: 730, y: 368, activity: "WORKING" },
  { employeeId: "milo", department: "content", x: 270, y: 470, activity: "WORKING" },
  { employeeId: "nova", department: "marketing", x: 728, y: 270, activity: "IDLE" },
];
