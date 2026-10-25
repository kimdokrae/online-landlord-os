import type {RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
/** DOM labels and brief reports use the real scene/camera. Reports avoid projected building hit points. */
export function WorldLabels({elements}:{elements:RefObject<Map<string,HTMLElement>>}){
 const {scene,camera,size}=useThree();
 useFrame(()=>{
  camera.updateMatrixWorld();const protectedPoints:{x:number;y:number}[]=[];
  const project=(id:string)=>{const target=scene.getObjectByName(id.replace(/^bubble:/,''));if(!target||!target.visible)return null;const p=target.getWorldPosition(new Vector3());p.y+=(target.userData.focusY??.3)+(id.includes('employee:')?.6:0);p.project(camera);return p.z<-1||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1?null:p;};
  for(const [id,element] of elements.current){if(id.startsWith('bubble:'))continue;const p=project(id);if(!p){element.style.visibility='hidden';continue;}element.style.visibility='visible';element.style.left=`${(p.x+1)*50}%`;element.style.top=`${(1-p.y)*50}%`;if(id.startsWith('asset:'))protectedPoints.push({x:(p.x+1)/2*size.width,y:(1-p.y)/2*size.height});}
  for(const [id,element] of elements.current){if(!id.startsWith('bubble:'))continue;const p=project(id);if(!p){element.style.visibility='hidden';continue;}
   const x=(p.x+1)/2*size.width,y=(1-p.y)/2*size.height,w=element.offsetWidth,h=element.offsetHeight;
   const candidates=[[x-w/2,y-h-24],[x+20,y-h/2],[x-w-20,y-h/2],[x-w/2,y+32],[12,y-h-24],[size.width-w-12,y-h-24],[12,80],[size.width-w-12,80]];
   const positions=candidates.map(([left,top])=>({left:Math.max(8,Math.min(size.width-w-8,left)),top:Math.max(80,Math.min(size.height-h-95,top))}));
   const position=positions.find(r=>protectedPoints.every(a=>a.x<r.left-18||a.x>r.left+w+18||a.y<r.top-18||a.y>r.top+h+18));
   if(!position){element.style.visibility='hidden';continue;}element.style.visibility='visible';element.style.transform='none';element.style.left=`${position.left}px`;element.style.top=`${position.top}px`;
  }
 });
 return null;
}
