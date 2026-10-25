import { useEffect, useMemo } from "react";
import { GROUND, roofGeometry } from "./geometry";
import { RoundBox, Ball } from "./primitives";
import type { LabSelection } from "./lab-types";
import type { ThreeEvent } from "@react-three/fiber";

export function Window({ x, y, z, side = false }: { x: number; y: number; z: number; side?: boolean }) {
  return <group position={[x, y, z]} rotation={[0, side ? Math.PI / 2 : 0, 0]}>
    <RoundBox size={[.48, .67, .11]} color="#f8e5c7"/>
    <RoundBox position={[0, 0, .065]} size={[.34, .5, .04]} color="#94c3c7" radius={.055}/>
    <RoundBox position={[0, 0, .1]} size={[.035, .51, .025]} color="#fff1d5"/>
    <RoundBox position={[0, -.03, .1]} size={[.35, .035, .025]} color="#fff1d5"/>
    <RoundBox position={[0, -.36, .025]} size={[.58, .08, .23]} color="#d6bca4"/>
  </group>;
}
export function Roof({ width, depth, height, color, y }: { width: number; depth: number; height: number; color: string; y: number }) {
  const geometry = useMemo(() => roofGeometry(width, height, depth), [width, height, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh position={[0, y, 0]} castShadow receiveShadow><primitive object={geometry} attach="geometry"/><meshStandardMaterial color={color} roughness={.78}/></mesh>;
}
export function Buildings({ floors, selected, onSelect }: { floors: number; selected: LabSelection; onSelect: (id: LabSelection) => void }) {
  const click = (id: LabSelection) => (e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelect(id); };
  return <>
    <group name="lab-hq" position={[-2, GROUND, -1.6]} onClick={click("hq")}>
      <RoundBox position={[0, .12, 0]} size={[3.9, .24, 3.25]} color="#e6d4b7" radius={.12}/>
      <RoundBox position={[0, 1.43, 0]} size={[3.1, 2.65, 2.5]} color="#f3e6cc" radius={.15}/>
      {[.34, 1.55, 2.8].map(y => <RoundBox key={y} position={[0, y, 0]} size={[3.28, .13, 2.65]} color="#e0ccb0"/>)}
      {[.9, 2.1].flatMap(y => [-.95, 0, .95].map(x => <Window key={`${x}-${y}`} x={x} y={y} z={1.29}/>))}
      {[.9, 2.1].flatMap(y => [-.65, .65].map(z => <Window key={`${z}-${y}`} x={1.57} y={y} z={z} side/>))}
      <Roof width={3.55} depth={2.95} height={1.05} y={2.86} color="#8bb4a3"/>
      <RoundBox position={[0, .8, 1.45]} size={[.92, 1.38, .3]} color="#ead6b7" radius={.18}/>
      <RoundBox position={[0, .8, 1.63]} size={[.61, 1.12, .09]} color="#7fa697" radius={.18}/>
      <Ball position={[.18, .72, 1.71]} scale={.045} color="#d4ae68"/>
      {[0, 1, 2].map(i => <RoundBox key={i} position={[0, .09 - i * .025, 1.72 + i * .23]} size={[1.38 + i * .15, .12, .35]} color="#eadac0"/>)}
      <group position={[0, 3.25, 1.57]}><mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.45, .45, .13, 40]}/><meshStandardMaterial color="#d8b576"/></mesh><mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, .08]}><cylinderGeometry args={[.37, .37, .045, 40]}/><meshStandardMaterial color="#fff4d8"/></mesh><RoundBox position={[0, .1, .13]} size={[.035, .22, .02]} color="#a5815f"/><RoundBox position={[.09, 0, .13]} size={[.2, .035, .02]} color="#a5815f"/></group>
      <RoundBox position={[-1, 3.8, -.6]} size={[.35, .5, .35]} color="#eadac2"/>
      <mesh position={[.92, 4.08, -.05]} castShadow><cylinderGeometry args={[.025, .025, .9, 8]}/><meshStandardMaterial color="#ac9073"/></mesh>
      <RoundBox position={[1.2, 4.28, -.05]} size={[.55, .32, .06]} color="#d9a4b4" radius={.045}/>
      {selected === "hq" && <SelectionRing radius={2.15}/>}
    </group>
    <group name="lab-module" position={[2.55, GROUND, -.6]} onClick={click("module")}>
      <RoundBox position={[0, .1, 0]} size={[2.8, .2, 2.7]} color="#d9c8b5" radius={.12}/>
      {Array.from({ length: floors }, (_, i) => <group key={i} name={`module-floor-${i + 1}`} position={[0, .22 + i * .72, 0]}>
        <RoundBox position={[0, .35, 0]} size={[2.18, .68, 2.04]} color={i % 2 ? "#e5dced" : "#f1e8ed"} radius={.09}/>
        <RoundBox position={[0, .02, 0]} size={[2.38, .1, 2.22]} color="#cbbbd4"/>
        {[-.58, .58].map(x => <group key={x} position={[x, .36, 1.055]}><RoundBox size={[.6, .43, .08]} color="#fff0d6"/><RoundBox size={[.46, .31, .06]} position={[0, 0, .05]} color="#b4ccda" radius={.04}/></group>)}
        <RoundBox position={[1.13, .35, 0]} size={[.08, .4, 1.13]} color="#d8e8e2"/>
      </group>)}
      {floors > 0 ? <><Roof y={.24 + floors * .72} width={2.58} depth={2.5} height={.7} color="#b8a4c9"/><RoundBox position={[0, .65, 1.15]} size={[.45, .79, .12]} color="#b09bb8"/></> : <><RoundBox position={[0, .24, 0]} size={[1.7, .06, 1.65]} color="#e6d3b7"/>{[-1, 1].map(x => <RoundBox key={x} position={[x, .45, 0]} size={[.07, .7, .07]} color="#be9879"/>)}</>}
      {selected === "module" && <SelectionRing radius={1.55}/>}
    </group>
  </>;
}
function SelectionRing({ radius }: { radius: number }) {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .015, 0]}><ringGeometry args={[radius - .045, radius, 64]}/><meshBasicMaterial color="#fff3b2" transparent opacity={.85} depthWrite={false}/></mesh>;
}
