import { findOfficePath } from '../office/pathfinding.ts';
import type { BuildingKind, StaffDepartment, Vec3 } from './model.ts';
export type Tile = { x: number; y: number; floor: number };
export type Room = { id: string; name: string; floor: number; x: number; width: number; color: string; purpose: 'executive'|'desk'|'meeting'|'finance'|'studio'|'lab'|'support'; stationXs?: number[] };
export type OfficeConfig = { kind: BuildingKind; floors: number; rooms: Room[] };
const names = {
  revenue: ['자산 운영실', '리포트 회의실', '수익 관리실'], development: ['개발 연구실', '설계 회의실', '테스트 랩'],
  marketing: ['콘텐츠 스튜디오', '기획 회의실', '편집 작업실'], operations: ['고객지원실', '운영 회의실', '모니터링실'],
};
export function officeConfig(kind: BuildingKind): OfficeConfig {
  const rooms: Room[] = kind === 'hq' ? [
    { id:'executive', name:'대표실', floor:0, x:-4, width:3.7, color:'#ddd2eb', purpose:'executive' },
    { id:'meeting', name:'회의실', floor:0, x:0, width:3.7, color:'#f2dfb8', purpose:'meeting' },
    { id:'finance', name:'재무·운영팀', floor:0, x:4, width:3.7, color:'#dbe4c5', purpose:'finance' },
    { id:'development', name:'개발팀', floor:1, x:-3, width:5.7, color:'#d5e4ed', purpose:'lab' },
    { id:'marketing', name:'마케팅·콘텐츠팀', floor:1, x:3, width:5.7, color:'#ead4e3', purpose:'studio' },
  ] : [-4,0,4].map((x, i) => ({ id: ['work','meeting','support'][i], name: names[kind][i], floor:0, x, width:3.7, color:['#e6d9ec','#f1dfc7','#d9e5d6'][i], stationXs:i===2 ? [-1,.5] : [0], purpose: i === 1 ? 'meeting' : kind === 'development' ? 'lab' : kind === 'marketing' ? 'studio' : kind === 'operations' ? 'support' : i === 2 ? 'finance' : 'desk' }));
  return { kind, floors:kind === 'hq' ? 2 : 1, rooms };
}
export const floorY = (floor: number) => .2 + floor * 3.6;
export const tileWorld = (p: Tile): Vec3 => [p.x * .5 - 6, floorY(p.floor), p.y * .5 - 3.5];
export function walkableTile(p: Tile, config: OfficeConfig): boolean {
  if (!Number.isInteger(p.x) || !Number.isInteger(p.y) || p.floor < 0 || p.floor >= config.floors || p.x < 0 || p.x > 24 || p.y < 1 || p.y > 13) return false;
  if (p.x === 0) return (p.floor === 0 && p.y === 12) || (p.floor === 1 && p.y === 2);
  if (p.x === 24) return false;
  const partitions = p.floor === 1 && config.kind === 'hq' ? [12] : [8,16];
  if (p.y <= 7 && partitions.includes(p.x)) return false;
  // Matches the physical desks and meeting table, including their legs.
  if (p.y >= 3 && p.y <= 7) {
    if (p.floor === 1 && config.kind === 'hq') { if ((p.x >= 2 && p.x <= 8) || (p.x >= 16 && p.x <= 22)) return false; }
    else if ((p.x >= 2 && p.x <= 6) || (p.x >= 10 && p.x <= 14) || (p.x >= (config.kind === 'hq' ? 18 : 17) && p.x <= 22)) return false;
  }
  if (p.y === 13 && (p.x >= 4 && p.x <= 8 || p.x === 23)) return false;
  if (p.x === 23 && p.y === 12) return false;
  // Shelves and potted plants occupy the back wall, not the corridor.
  if (p.y === 1 && p.x !== 1) return false;
  return true;
}
export type RoutePoint = { position: Vec3; floor: number; stair?: boolean };
export function officeRoute(from: Tile, to: Tile, config: OfficeConfig): RoutePoint[] | null {
  const horizontal = (a: Tile, b: Tile) => findOfficePath(a, b, p => walkableTile({ ...p, floor:a.floor }, config) && (p.y >= 9 || p.y <= 2 || p.x === 1 || p.x === 23 || p.x === a.x || p.x === b.x))?.map(p => ({ position: tileWorld({ ...p, floor:a.floor }), floor:a.floor }));
  if (!walkableTile(from, config) || !walkableTile(to, config)) return null;
  if (from.floor === to.floor) return horizontal(from,to) ?? null;
  const lower: Tile = {x:0,y:12,floor:0}, upper: Tile = {x:0,y:2,floor:1};
  const up = from.floor === 0, first = horizontal(from, up ? lower : upper), last = horizontal(up ? upper : lower, to);
  if (!first || !last) return null;
  const stairs: RoutePoint[] = [{position:[-6.7,.2,2.5],floor:0,stair:true}, ...Array.from({length:12}, (_,i) => ({position:[-6.7,.2+(i+1)*.3,2.5-(i+1)*5/12] as Vec3,floor:i === 11 ? 1 : 0,stair:true})), {position:tileWorld(upper),floor:1,stair:true}];
  if (!up) stairs.reverse();
  return [...first,...stairs,...last];
}
export type StaffPlacement = { id: string; department: StaffDepartment; start: Tile; desk: Tile; meeting: Tile; rest: Tile };
export function officeStaff(config: OfficeConfig): StaffPlacement[] {
  const hq = config.kind === 'hq';
  return [
    {id:'aria', department:'executive' as const, desk:{x:4,y:8,floor:0}},
    {id:'leo', department:'development' as const, desk:{x:hq ? 6 : 4,y:8,floor:hq ? 1 : 0}},
    {id:'milo', department:'content' as const, desk:{x:18,y:8,floor:hq ? 1 : 0}},
    {id:'nova', department:'marketing' as const, desk:{x:hq ? 20 : 21,y:8,floor:0}},
  ].filter((_,i) => hq || i !== 0).map((p,i) => ({...p, start:{x:3+i*5,y:12,floor:p.desk.floor}, meeting:i === 3 ? {x:9,y:5,floor:0} : {x:10+i*2,y:8,floor:0}, rest:{x:3+i*5,y:12,floor:0}}));
}
/** Distance-based movement, independent of animation and frame rate. */
export function advance3D(position: Vec3, route: readonly RoutePoint[], distance: number): { position: Vec3; remaining: RoutePoint[]; floor?: number } {
  let point: Vec3 = [...position]; const remaining = [...route]; let floor: number | undefined;
  while (remaining.length && distance >= 0) {
    const target = remaining[0], delta = target.position.map((v,i) => v - point[i]); const length = Math.hypot(...delta);
    if (length > distance && length > 0) { point = point.map((v,i) => v + delta[i] / length * distance) as Vec3; break; }
    point = [...target.position]; distance -= length; floor = target.floor; remaining.shift();
  }
  return {position:point,remaining,floor};
}
