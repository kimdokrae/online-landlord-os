import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, TubeGeometry, CatmullRomCurve3, Vector3 } from 'three';
import { heartGeometry } from './geometry';
import { RoundBox, Ball } from './primitives';
import type { EmployeeActivity } from '@/lib/employees/status-adapter';

/** The original STEP 7 sprout silhouette; movement belongs to the actor controller. */
export function EmployeeAvatar({color,activity,selected,paused=false}:{color:string;activity:EmployeeActivity;selected:boolean;paused?:boolean}) {
  const figure=useRef<Group>(null), leftLeg=useRef<Group>(null),rightLeg=useRef<Group>(null),leftArm=useRef<Group>(null),rightArm=useRef<Group>(null), clock=useRef(0);
  const heart=useMemo(heartGeometry,[]), smile=useMemo(()=>new TubeGeometry(new CatmullRomCurve3([new Vector3(-.06,.83,.222),new Vector3(0,.805,.237),new Vector3(.06,.83,.222)]),8,.011,5,false),[]);
  useEffect(()=>()=>{heart.dispose();smile.dispose();},[heart,smile]);
  useFrame((_,delta)=>{
    if(!paused&&!document.hidden)clock.current+=Math.min(delta,.08);
    const walking=activity==='WALKING', working=activity==='WORKING', t=clock.current;
    const step=walking?Math.sin(t*9)*.5:0;
    if(figure.current)figure.current.position.y=working?.32:walking?Math.abs(Math.sin(t*9))*.025:0;
    if(leftLeg.current)leftLeg.current.rotation.x=working?-1.1:step;
    if(rightLeg.current)rightLeg.current.rotation.x=working?-1.1:-step;
    if(leftArm.current)leftArm.current.rotation.x=working?-1.1+Math.sin(t*7)*.07:activity==='MEETING'?-.45+Math.sin(t*2)*.12:-step*.6;
    if(rightArm.current)rightArm.current.rotation.x=working?-1.1-Math.sin(t*7)*.07:step*.6;
  });
  return <group>
    <group ref={figure} scale={.76}>
      <group ref={leftLeg} position={[-.115,.27,0]}><RoundBox position={[0,-.12,.025]} size={[.13,.26,.16]} color={color}/></group>
      <group ref={rightLeg} position={[.115,.27,0]}><RoundBox position={[0,-.12,.025]} size={[.13,.26,.16]} color={color}/></group>
      <Ball position={[0,.48,0]} scale={[.235,.32,.19]} color={color}/><Ball position={[0,.84,0]} scale={[.275,.34,.23]} color={color}/>
      <group ref={leftArm} position={[-.23,.57,0]}><RoundBox position={[-.025,-.13,0]} size={[.1,.29,.12]} color={color}/></group><group ref={rightArm} position={[.23,.57,0]}><RoundBox position={[.025,-.13,0]} size={[.1,.29,.12]} color={color}/></group>
      {[-.09,.09].map(x=><Ball key={x} position={[x,.89,.215]} scale={[.025,.036,.018]} color='#425a60'/>)}{[-.15,.15].map(x=><Ball key={x} position={[x,.82,.19]} scale={[.042,.018,.017]} color='#f0c9d2'/>)}
      <mesh geometry={smile}><meshStandardMaterial color='#425a60'/></mesh><RoundBox position={[0,1.22,0]} size={[.025,.21,.025]} color='#709a88'/><mesh position={[0,1.29,0]} geometry={heart} castShadow><meshStandardMaterial color='#91bca5' roughness={.7}/></mesh>
    </group>
    {selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.015,0]}><ringGeometry args={[.34,.39,24]}/><meshBasicMaterial color='#f5d58e'/></mesh>}
  </group>;
}
