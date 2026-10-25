import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Vector3, type Group } from "three";
import { islandGeometry, pathGeometry, walkCurve, GROUND } from "./geometry";
import { Ball, RoundBox } from "./primitives";

export function Island({ paths = true }: { paths?: boolean }) {
  const soil = useMemo(() => islandGeometry([{ r: .15, y: -4.1 }, { r: 2.6, y: -3.1 }, { r: 5.15, y: -1.65 }, { r: 6.45, y: -1.4 }, { r: 6.8, y: -1.1 }, { r: 6.8, y: -.12 }], false, true), []);
  const grass = useMemo(() => islandGeometry([{ r: 6.8, y: -.12 }, { r: 6.86, y: -.01 }, { r: 6.78, y: .14 }, { r: 6.65, y: GROUND }], true), []);
  const path = useMemo(() => pathGeometry(walkCurve, .8), []);
  const entrance = useMemo(() => pathGeometry(new CatmullRomCurve3([new Vector3(-2, .23, -.1), new Vector3(-2, .23, .5), new Vector3(-1.65, .23, .75)]), .85), []);
  useEffect(() => () => { soil.dispose(); grass.dispose(); path.dispose(); entrance.dispose(); }, [soil, grass, path, entrance]);
  return <group name="floating-island">
    <mesh castShadow receiveShadow geometry={soil}><meshStandardMaterial vertexColors roughness={1}/></mesh>
    <mesh receiveShadow geometry={grass}><meshStandardMaterial color="#b8cba7" roughness={.95}/></mesh>
    {(paths ? [path, entrance] : []).map((g, i) => <mesh key={i} receiveShadow geometry={g}><meshStandardMaterial color="#e8dbc2" roughness={.95}/></mesh>)}
    {[-2.4, -1.6, -.8, 0, .8, 1.6, 2.4].map((x, i) => <Ball key={x} position={[x, -1.55 - .2 * Math.sin(i), 4.1 - .1 * i]} scale={[.34, .5, .2]} color={i % 2 ? "#cbb6b1" : "#d8bcb2"}/>)}
  </group>;
}
function Tree({ x, z, size = 1, pink = false }: { x: number; z: number; size?: number; pink?: boolean }) {
  return <group position={[x, GROUND, z]} scale={size}>
    <mesh position={[0, .65, 0]} castShadow><cylinderGeometry args={[.1, .16, 1.3, 10]}/><meshStandardMaterial color="#ac8f76" roughness={1}/></mesh>
    <mesh position={[.16, .9, 0]} rotation={[0, 0, -.5]} castShadow><cylinderGeometry args={[.055, .08, .65, 8]}/><meshStandardMaterial color="#ac8f76"/></mesh>
    <Ball position={[-.28, 1.37, .05]} scale={[.69, .63, .61]} color={pink ? "#e3b6c8" : "#8faa8d"}/>
    <Ball position={[.35, 1.55, .04]} scale={[.64, .78, .58]} color={pink ? "#efc6d5" : "#a5bd98"}/>
    <Ball position={[0, 1.95, -.14]} scale={[.64, .64, .61]} color={pink ? "#eac3d2" : "#b5c8a3"}/>
    <Ball position={[.03, 1.35, .42]} scale={[.57, .48, .43]} color={pink ? "#dcaec5" : "#a1b998"}/>
  </group>;
}
function Flower({ x, z, color, size = 1 }: { x: number; z: number; color: string; size?: number }) {
  return <group position={[x, GROUND, z]} scale={size}>
    <mesh position={[0, .13, 0]}><cylinderGeometry args={[.018, .022, .26, 5]}/><meshStandardMaterial color="#88a682"/></mesh>
    {[0, 1, 2, 3, 4].map(i => <Ball key={i} position={[Math.cos(i * Math.PI * .4) * .09, .28, Math.sin(i * Math.PI * .4) * .09]} scale={[.075, .04, .075]} color={color}/>)}
    <Ball position={[0, .305, 0]} scale={.045} color="#e8c98c"/>
  </group>;
}
function Bench({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return <group position={[x, GROUND, z]} rotation={[0, rotation, 0]}>
    {[-.42, .42].map(a => <RoundBox key={a} position={[a, .22, 0]} size={[.08, .44, .45]} color="#8faaa0"/>)}
    {[0, 1, 2].map(i => <RoundBox key={i} position={[0, .46, -.2 + i * .19]} size={[1.16, .09, .16]} color="#c9a987"/>)}
    {[.68, .87].map(y => <RoundBox key={y} position={[0, y, -.3]} size={[1.16, .13, .08]} color="#d0b498"/>)}
    {[-.48, .48].map(x => <RoundBox key={x} position={[x, .65, -.3]} size={[.07, .65, .07]} color="#8faaa0"/>)}
  </group>;
}
function Lamp({ x, z }: { x: number; z: number }) {
  return <group position={[x, GROUND, z]}>
    <mesh position={[0, .74, 0]} castShadow><cylinderGeometry args={[.038, .065, 1.48, 10]}/><meshStandardMaterial color="#8a9390"/></mesh>
    <RoundBox position={[0, 1.51, 0]} size={[.25, .35, .25]} color="#fff0c6" radius={.045}/>
    <mesh position={[0, 1.78, 0]} castShadow><coneGeometry args={[.24, .22, 4]}/><meshStandardMaterial color="#9ba79d"/></mesh>
  </group>;
}
export function Garden() {
  const trees: [number, number, number, boolean][] = [[-5.2, -.3, .95, false], [-4.4, -2.9, 1.05, true], [-2.2, -4.05, .85, false], [.1, -3.9, .9, false], [3.65, -3, .95, true], [5, -1.4, .86, false], [5.1, 1.3, .85, false], [-4.6, 2.2, .8, true]];
  return <group name="garden-life">
    {trees.map(([x, z, size, pink], i) => <Tree key={i} {...{ x, z, size, pink }}/>) }
    {Array.from({ length: 36 }, (_, i) => { const a = i / 36 * Math.PI * 2; const r = 5.5 + .2 * Math.sin(i * 7); return <Flower key={i} x={Math.cos(a) * r} z={Math.sin(a) * r * .77} color={["#f0c9d6", "#e7d7ec", "#f6e8c3"][i % 3]} size={.8 + (i % 3) * .13}/>; })}
    <Bench x={-3.8} z={2.1} rotation={.4}/><Bench x={2.1} z={4.15} rotation={Math.PI}/>
    <Lamp x={-3.7} z={.3}/><Lamp x={3.9} z={1.65}/><Lamp x={-.2} z={4.6}/>
    {[-1, 1].map(side => <group key={side} position={[side * 4.1, GROUND, 3.3]} rotation={[0, side * -.6, 0]}>{[-.55, 0, .55].map(x => <RoundBox key={x} position={[x, .29, 0]} size={[.09, .58, .09]} color="#dfc7a8"/>)}{[.2, .44].map(y => <RoundBox key={y} position={[0, y, 0]} size={[1.3, .065, .07]} color="#e8d5b9"/>)}</group>)}
  </group>;
}
export function Fountain({ animate }: { animate: boolean }) {
  const drops = useRef<Group>(null); const phase = useRef(0);
  useFrame((_, delta) => { if (!animate || !drops.current) return; phase.current += Math.min(delta, .05); drops.current.children.forEach((drop, i) => { drop.position.y = .92 + ((phase.current * .65 + i / 8) % 1) * .56; }); });
  return <group name="fountain" position={[.05, GROUND, 2.1]}>
    <mesh receiveShadow castShadow position={[0, .1, 0]}><cylinderGeometry args={[1.03, 1.1, .2, 48]}/><meshStandardMaterial color="#ded1bf" roughness={.9}/></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .23, 0]}><torusGeometry args={[.95, .09, 10, 48]}/><meshStandardMaterial color="#f5e5ce"/></mesh>
    <mesh position={[0, .2, 0]}><cylinderGeometry args={[.88, .88, .06, 48]}/><meshStandardMaterial color="#a1ccd0" roughness={.24} metalness={.05}/></mesh>
    <mesh position={[0, .53, 0]} castShadow><cylinderGeometry args={[.17, .23, .64, 16]}/><meshStandardMaterial color="#e1d7c8"/></mesh>
    <mesh position={[0, .83, 0]} castShadow><cylinderGeometry args={[.48, .25, .16, 32]}/><meshStandardMaterial color="#efe2ce"/></mesh>
    <mesh position={[0, .925, 0]}><cylinderGeometry args={[.4, .4, .035, 32]}/><meshStandardMaterial color="#aed9d7" roughness={.2}/></mesh>
    <group ref={drops}>{Array.from({ length: 8 }, (_, i) => <Ball key={i} position={[Math.cos(i * .785) * .2, 1.1, Math.sin(i * .785) * .2]} scale={[.028, .07, .028]} color="#c4e8e0"/>)}</group>
  </group>;
}
export function Clouds() {
  return <group name="volumetric-clouds">{[[-7, -2.3, -4, 1.5], [6, -2.5, 4.2, 1.1], [-4.5, -3.4, 5, .9]].map(([x, y, z, s], i) => <group key={i} position={[x, y, z]} scale={s}>{[[-1, 0, 0, 1], [0, .15, 0, 1.4], [1, 0, 0, 1], [.3, 0, .5, 1]].map(([x, y, z, r], j) => <Ball key={j} position={[x, y, z]} scale={[r, r * .45, r * .8]} color="#f4e9e5" castShadow={false} receiveShadow={false}/>)}</group>)}</group>;
}
