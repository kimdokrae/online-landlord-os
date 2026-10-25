import { officeRoute, officeStaff, tileWorld, advance3D, type OfficeConfig, type Tile, type RoutePoint } from './office.ts';
import { cityRoad, type Vec3, type WorldBuilding, type StaffDepartment } from './model.ts';
import { employeeAnimation, type WorkState, type EmployeeActivity } from '../employees/status-adapter.ts';
export type Action = 'DESK'|'MEETING'|'REST';
export type ActorRuntime = { position:Vec3; route:RoutePoint[]; tile:Tile; goal:Tile; action:Action; workState:WorkState; activity:EmployeeActivity; department:StaffDepartment; floor:number; lastOrder:number; queued?:{seq:number;action:Action}; rotation:number; elapsed:number };
export type SimulationSession = { offices:Map<string,ActorRuntime>; city:Map<string,ActorRuntime>; lastWork:Map<string,{state:WorkState;assetId:string}> };
export const createSession = ():SimulationSession=>({offices:new Map(),city:new Map(),lastWork:new Map()});
export function indoorRuntime(id:string,assetId:string,config:OfficeConfig,session:SimulationSession):ActorRuntime {
  const key=`${assetId}:${id}`, existing=session.offices.get(key); if(existing)return existing;
  const placement=officeStaff(config).find(p=>p.id===id)!;
  const runtime:ActorRuntime={position:tileWorld(placement.start),route:officeRoute(placement.start,placement.desk,config)??[],tile:placement.start,goal:placement.desk,action:'DESK',workState:'NONE',activity:'WALKING',department:placement.department,floor:placement.start.floor,lastOrder:0,rotation:Math.PI,elapsed:0};
  session.offices.set(key,runtime);return runtime;
}
export function orderIndoor(runtime:ActorRuntime,order:{seq:number;action:Action},id:string,config:OfficeConfig) {
  if(order.seq<=runtime.lastOrder)return;
  runtime.queued=order;
  if(runtime.route.length)return; // Finish the current valid route before replanning, including stairs.
  const placement=officeStaff(config).find(p=>p.id===id)!;
  const goal=order.action==='DESK'?placement.desk:order.action==='MEETING'?placement.meeting:placement.rest;
  const route=officeRoute(runtime.tile,goal,config); if(!route)return;
  runtime.goal=goal;runtime.route=route;runtime.action=order.action;runtime.lastOrder=order.seq;runtime.queued=undefined;runtime.workState='NONE';
}
export function stepIndoor(runtime:ActorRuntime,dt:number,paused=false) {
  if(!paused&&runtime.route.length) {
    const before=runtime.position, next=advance3D(before,runtime.route,dt*2.4); runtime.position=next.position;runtime.route=next.remaining;if(next.floor!==undefined)runtime.floor=next.floor;
    if(Math.hypot(runtime.position[0]-before[0],runtime.position[2]-before[2])>.0001)runtime.rotation=Math.atan2(runtime.position[0]-before[0],runtime.position[2]-before[2]);
  }
  if(!runtime.route.length) {runtime.tile={...runtime.goal};runtime.floor=runtime.goal.floor;runtime.workState=runtime.action==='DESK'?'RUNNING':runtime.action==='MEETING'?'MEETING':'NONE';runtime.rotation=runtime.action==='REST'?0:Math.PI;}
  runtime.activity=employeeAnimation({source:'demo',state:runtime.workState},!paused&&runtime.route.length>0);
}
export function outdoorRuntime(id:string,index:number,building:WorldBuilding,session:SimulationSession):ActorRuntime {
  const existing=session.city.get(id);if(existing)return existing;
  const startIndex=index*2, path=[...cityRoad.slice(startIndex),...cityRoad.slice(0,startIndex+1)];
  if(index===0) {const stop=cityRoad.findIndex(p=>p[0]===0&&p[2]===-.8);path.push(...cityRoad.slice(startIndex+1,stop+1),building.road,building.entrance);}
  const runtime:ActorRuntime={position:[...path[0]],route:path.slice(1).map(position=>({position,floor:0})),tile:{x:0,y:0,floor:0},goal:{x:0,y:0,floor:0},action:'REST',workState:'NONE',activity:'WALKING',department:(['executive','development','content','marketing'] as const)[index],floor:0,lastOrder:0,rotation:0,elapsed:0};session.city.set(id,runtime);return runtime;
}
