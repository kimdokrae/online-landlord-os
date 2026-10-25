import { memo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { officeConfig, floorY, type Room, type OfficeConfig } from '@/lib/three-world/office';
import type { BuildingKind } from '@/lib/three-world/model';
import { RoundBox, Ball } from './primitives';

function Chair({ x, z, y = 0, rotation = 0, color = '#b9a6c7' }: {x:number;z:number;y?:number;rotation?:number;color?:string}) {
  return <group position={[x,y,z]} rotation={[0,rotation,0]}><RoundBox position={[0,.43,0]} size={[.63,.13,.6]} color={color}/><RoundBox position={[0,.76,.26]} size={[.63,.6,.12]} color={color}/>{[-.23,.23].flatMap(x => [-.2,.2].map(z => <RoundBox key={`${x}:${z}`} position={[x,.2,z]} size={[.055,.4,.055]} color='#b7a18b'/>))}</group>;
}
function Desk({ x, color, lab = false, compact = false }: {x:number;color:string;lab?:boolean;compact?:boolean}) {
  return <group position={[x,0,-.5]} scale={[compact ? .65 : 1,1,1]}><RoundBox position={[0,.85,0]} size={[2,.15,1.5]} color='#e2caaa'/>{[-.8,.8].flatMap(x => [-.6,.6].map(z => <RoundBox key={`${x}:${z}`} position={[x,.41,z]} size={[.1,.8,.1]} color='#d3b797'/>))}
    <RoundBox position={[0,1.3,-.25]} size={[.85,.57,.09]} color='#8b9a9a'/><RoundBox position={[0,1.3,-.19]} size={[.73,.45,.025]} color={lab ? '#b4d2d9' : '#c9c2df'}/><RoundBox position={[0,1,-.25]} size={[.1,.3,.1]} color='#8b9a9a'/><RoundBox position={[0,.96,.6]} size={[.7,.04,.25]} color='#f6edda'/><Ball position={[.66,1,.15]} scale={[.1,.1,.1]} color={color}/>
  </group>;
}
function Plant({x,z}:{x:number;z:number}) { return <group position={[x,0,z]}><mesh position={[0,.24,0]} castShadow><cylinderGeometry args={[.23,.18,.48,12]}/><meshStandardMaterial color='#d8bba4'/></mesh><Ball position={[0,.75,0]} scale={[.34,.5,.3]} color='#a1be94'/><Ball position={[.18,.6,0]} scale={[.25,.35,.24]} color='#b6cc9e'/></group>; }
function Shelf({x}:{x:number}) { return <group position={[x,0,-3.05]}>{[.15,.75,1.35].map(y => <RoundBox key={y} position={[0,y,0]} size={[1.2,.12,.35]} color='#c7ab8b'/>)}{[-.55,.55].map(x => <RoundBox key={x} position={[x,.76,0]} size={[.08,1.4,.35]} color='#c7ab8b'/>)}{[-.4,-.15,.1,.35].map((x,i) => <RoundBox key={x} position={[x,1,-.01]} size={[.16,.36,.25]} color={['#a7bdb2','#dfb7c9','#c2b6d8','#e0c891'][i]}/>)}</group>; }
function RoomContents({ room }: {room:Room}) {
  const meeting = room.purpose === 'meeting';
  return <group position={[room.x,0,0]}>
    {meeting ? <><RoundBox position={[0,.82,-1.2]} size={[2.25,.16,1.6]} color='#dbbf99'/>{[-.8,.8].map(x => <RoundBox key={x} position={[x,.4,-1.2]} size={[.12,.8,1.2]} color='#cbb18d'/>)}{[-1,0,1].map(x => <Chair key={x} x={x} z={.5} color='#b6c5ab'/>)}<Chair x={-1.5} z={-1} rotation={Math.PI/2} color='#b6c5ab'/><RoundBox position={[0,1.75,-3.25]} size={[2.3,.95,.08]} color='#f7f1db'/><RoundBox position={[-.35,1.75,-3.18]} size={[1.2,.035,.02]} color='#c0d3b9'/></>
    : <>{(room.stationXs??[0]).map(x=><group key={x}><Desk x={x} color={room.color} lab={room.purpose === 'lab'} compact={(room.stationXs?.length??1)>1}/><Chair x={x} z={.5} color={room.color}/></group>)}<Shelf x={room.width > 4 ? 1.7 : 1.1}/>
      {room.purpose === 'studio' && <group position={[1.9,.9,.4]}><RoundBox size={[.4,.35,.3]} color='#849298'/><mesh rotation={[Math.PI/2,0,0]} position={[0,0,.2]}><cylinderGeometry args={[.13,.13,.16,12]}/><meshStandardMaterial color='#586b74'/></mesh><RoundBox position={[0,-.35,0]} size={[.05,.65,.05]} color='#8c9797'/></group>}
      {(room.purpose === 'lab' || room.purpose === 'support') && <group position={[-1.8,.65,-2.7]}><RoundBox size={[.45,1.3,.4]} color='#9baeb5'/>{[-.3,0,.3].map(y => <RoundBox key={y} position={[0,y,.22]} size={[.3,.12,.03]} color='#c8dfca'/>)}</group>}
    </>}
  </group>;
}
function OfficeLevel({config,floor,selected,onSelect}:{config:OfficeConfig;floor:number;selected:string|null;onSelect:(id:string)=>void}) {
  const rooms=config.rooms.filter(r=>r.floor===floor), partitions = config.kind === 'hq' && floor === 1 ? [0] : [-2,2];
  return <group position={[0,floorY(floor),0]} name={`office-level:${floor}`}>
    <RoundBox position={[0,-.13,0]} size={[12,.25,7]} color='#edddc4' radius={.15}/>
    <RoundBox position={[0,1.25,-3.5]} size={[12.1,2.5,.18]} color='#f1e5d4'/><RoundBox position={[6, .7,0]} size={[.13,1.4,7]} color='#eadaca'/>
    {partitions.map(x => <RoundBox key={x} position={[x,.65,-1.6]} size={[.12,1.3,3.7]} color='#e2d4c4'/>)}
    {rooms.map(r => <group key={r.id} name={`room:${r.id}`} position={[r.x,0,-1.5]} userData={{focusY:.3}} onClick={(e:ThreeEvent<MouseEvent>)=>{if(e.delta>5)return;e.stopPropagation();onSelect(`room:${r.id}`);}}>
      <RoundBox position={[0,.012,0]} size={[r.width-.15,.025,3.6]} color={selected===`room:${r.id}` ? '#f3dfb0' : r.color}/>
      <RoundBox position={[0,2.02,-1.87]} size={[1.5,.72,.08]} color='#d8e8df'/>{[-.55,.55].map(x=><RoundBox key={x} position={[x,2.02,-1.81]} size={[.035,.74,.03]} color='#f8efd9'/>)}
    </group>)}
    {rooms.map(r=><RoomContents key={r.id} room={r}/>)}
    <Plant x={5.45} z={2.7}/><Plant x={-5.45} z={-3.2}/>
    <RoundBox position={[-3,.32,3.1]} size={[1.7,.5,.55]} color='#cbb8d2'/><RoundBox position={[-3,.6,3.33]} size={[1.7,.5,.13]} color='#cbb8d2'/>
    <RoundBox position={[2,.035,2.25]} size={[3.1,.025,.8]} color='#e1d2bc'/>
    {[-3,3].map(x=><group key={x} position={[x,2.5,-.9]}><RoundBox size={[.045,.4,.045]} color='#b5a185'/><mesh position={[0,-.3,0]}><coneGeometry args={[.35,.25,16,1,true]}/><meshStandardMaterial color='#e9d3a7' side={2}/></mesh></group>)}
    {floor>0 && <RoundBox position={[0,.35,3.45]} size={[12,.08,.08]} color='#d8c4ac'/>}
  </group>;
}
export const OfficeScene=memo(function OfficeScene({kind,visibleFloor,selected,onSelect}:{kind:BuildingKind;visibleFloor:number|null;selected:string|null;onSelect:(id:string)=>void}) {
  const config=officeConfig(kind);
  return <group name='true-3d-office'>{Array.from({length:config.floors},(_,floor)=>visibleFloor===null||visibleFloor===floor ? <OfficeLevel key={floor} config={config} floor={floor} selected={selected} onSelect={onSelect}/> : null)}
    {config.floors>1 && <group name='navigable-stairs'><RoundBox position={[-6.5,.1,2.5]} size={[1.7,.2,.9]} color='#d5bea1'/>{Array.from({length:12},(_,i)=><RoundBox key={i} position={[-6.7,.2+(i+1)*.3-.1,2.5-(i+1)*5/12]} size={[1,.2,.52]} color='#d5bea1'/>)}<RoundBox position={[-6.7,3.7,-2.5]} size={[1.4,.2,.6]} color='#d5bea1'/></group>}
  </group>;
});
