import {workflowFrame,employeeBusinesses} from '@/lib/public-demo/workflows';
import { useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Group } from 'three';
import type { OfficeSettings } from '@/lib/settings/defaults';
import { employees } from '@/lib/demo/data';
import { staffThemes, cityRoad, type WorldBuilding } from '@/lib/three-world/model';
import { officeConfig, officeStaff, advance3D, walkableTile } from '@/lib/three-world/office';
import { indoorRuntime, outdoorRuntime, stepIndoor, orderIndoor, type SimulationSession } from '@/lib/three-world/simulation';
import { EmployeeAvatar } from './sprout';
import { employeeAnimation } from '@/lib/employees/status-adapter';
import type { StaffOrder } from './lab-types';

type Common={selected:string|null;onSelect:(id:string)=>void;walking:boolean;session:SimulationSession;profiles:OfficeSettings["employees"];departments:OfficeSettings["departments"];publicSimulation?:{tick:number;revision:number;disabled?:boolean}};
function Actor({id,index,building,inside,visibleFloor,order,selected,onSelect,walking,session,profiles,departments,publicSimulation}:Common&{id:string;index:number;building:WorldBuilding;inside:boolean;visibleFloor:number|null;order?:StaffOrder}) {
  const profile=profiles[id],enabled=walking&&profile.active,bodyColor=profile.color??departments[profile.departmentId].color;
  const root=useRef<Group>(null), entry=useRef(0);
  const config=useMemo(()=>officeConfig(building.interior),[building.interior]);
  const runtime=useMemo(()=>inside?indoorRuntime(id,building.assetId,config,session):outdoorRuntime(id,index,building,session),[inside,id,index,building.assetId,config,session]);
  const frame=useMemo(()=>publicSimulation?workflowFrame(inside?building.assetId:employeeBusinesses[id]??building.assetId,publicSimulation.tick):null,[publicSimulation,inside,building.assetId,id]);
  // React updates only when the discrete activity changes; positions stay in the frame loop.
  useFrame((_,delta)=>{
    const group=root.current;if(!group)return;const dt=document.hidden?0:Math.min(delta,.08);
    if(inside&&frame&&profile.active&&!publicSimulation?.disabled)orderIndoor(runtime,{seq:publicSimulation!.revision*100000+frame.step+1,action:frame.phase.action},id,config);
    if(inside) {if(order&&profile.active&&!frame)orderIndoor(runtime,order,id,config);stepIndoor(runtime,dt,!enabled);session.lastWork.set(id,{state:profile.active?runtime.workState:"NONE",assetId:building.assetId});}
    else {
      if(enabled&&runtime.route.length) {const before=runtime.position,next=advance3D(before,runtime.route,dt*1.1);runtime.position=next.position;runtime.route=next.remaining;runtime.rotation=Math.atan2(runtime.position[0]-before[0],runtime.position[2]-before[2]);}
      if(!runtime.route.length&&enabled) {runtime.elapsed+=dt;if(index===0&&!publicSimulation)entry.current=Math.min(1,entry.current+dt*1.5);else if(runtime.elapsed>3) {const start=index*2;runtime.route=[...cityRoad.slice(start+1),...cityRoad.slice(0,start+1)].map(position=>({position,floor:0}));runtime.elapsed=0;}}
      runtime.activity=employeeAnimation({source:'demo',state:'NONE'},enabled&&runtime.route.length>0);
    }
    if(frame){runtime.workState=profile.active?frame.phase.state:"NONE";runtime.activity=employeeAnimation({source:"demo",state:runtime.workState},enabled&&runtime.route.length>0);}
    if(publicSimulation?.disabled){runtime.workState="NONE";runtime.activity="IDLE";}
    group.position.set(...runtime.position);group.rotation.y=runtime.rotation;group.scale.setScalar(inside?1:.9*(1-entry.current));group.visible=profile.visible&&(visibleFloor===null||visibleFloor===runtime.floor)&&entry.current<1;
    const state=publicSimulation?.disabled||!profile.active?'NONE':frame?frame.phase.state:inside?runtime.workState:session.lastWork.get(id)?.state??'NONE';
    group.userData.staff={id,taskTitle:publicSimulation?.disabled?"업무 미연결":frame?.phase.title,simulationStep:frame?.step,source:publicSimulation?.disabled?"unconnected":"demo",assetId:inside?building.assetId:publicSimulation?employeeBusinesses[id]??building.assetId:session.lastWork.get(id)?.assetId??building.assetId,x:runtime.position[0],y:runtime.position[1],z:runtime.position[2],floor:runtime.floor,activity:!profile.active?'IDLE':entry.current>=1?'INSIDE':runtime.activity,workState:state,department:profile.departmentId,color:bodyColor,visible:profile.visible,active:profile.active,action:runtime.action,walkable:!inside || runtime.position[0]<-6 || walkableTile({x:Math.round((runtime.position[0]+6)*2),y:Math.round((runtime.position[2]+3.5)*2),floor:runtime.floor},config)};
  });
  const click=(e:ThreeEvent<MouseEvent>)=>{if(e.delta>5)return;e.stopPropagation();onSelect(`employee:${id}`);};
  return <group ref={root} name={`employee:${id}`} userData={{focusY:.55}} onClick={click}><AnimatedAvatar runtime={runtime} color={bodyColor} active={profile.active} selected={selected===`employee:${id}`} walking={enabled}/></group>;
}
import type { ActorRuntime } from '@/lib/three-world/simulation';
function AnimatedAvatar({runtime,color,selected,walking,active}:{runtime:ActorRuntime;color:string;selected:boolean;walking:boolean;active:boolean}) {
  const [activity,setActivity]=useState(runtime.activity), last=useRef(activity);
  useFrame(()=>{if(last.current!==runtime.activity){last.current=runtime.activity;setActivity(runtime.activity);}});
  return <EmployeeAvatar color={color} activity={active?activity:'IDLE'} selected={selected} paused={!walking}/>;
}
export function StaffActors({buildings,inside,visibleFloor,orders,...common}:Common&{buildings:WorldBuilding[];inside?:WorldBuilding;visibleFloor:number|null;orders:Record<string,StaffOrder>}) {
  const ids=inside?officeStaff(officeConfig(inside.interior)).map(s=>s.id):employees.map(e=>e.id);
  return <>{ids.map((id,index)=>{const building=inside??buildings.find(b=>b.employeeId===id)??buildings[0];return building?<Actor key={`${inside?.assetId??'city'}:${id}`} id={id} index={index} building={building} inside={!!inside} visibleFloor={inside?visibleFloor:null} order={orders[`${inside?.assetId}:${id}`]} {...common}/>:null;})}</>;
}
