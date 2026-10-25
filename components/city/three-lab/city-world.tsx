import { memo, useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3, InstancedMesh, Object3D, Color } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { worldPlots, cityRoad, palettes, floatingIslands, type WorldBuilding, type Vec3 } from "@/lib/three-world/model";
import { pathGeometry } from "./geometry";
import { Island, Fountain, Clouds } from "./garden";
import { RoundBox, Ball } from "./primitives";
import { Roof } from "./buildings";
import { useResources } from "./resources";

function Road({ points, width = .9, closed = false }: { points: Vec3[]; width?: number; closed?: boolean }) {
  const geometry = useMemo(() => pathGeometry(new CatmullRomCurve3(points.map(p => new Vector3(...p)), closed, "catmullrom", .2), width), [points, width, closed]);
  useEffect(() => () => geometry.dispose(), [geometry]); return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#edddbd" roughness={1}/></mesh>;
}
const branchRoads = worldPlots.map(p => [p.road, [p.entrance[0], .23, p.entrance[2] + .7] as Vec3, p.entrance]);
function PlantInstances() {
  const leaves = useRef<InstancedMesh>(null), flowers = useRef<InstancedMesh>(null); const resources = useResources();
  const trees = useMemo(() => Array.from({ length: 17 }, (_, i) => { const a = i / 17 * Math.PI * 2; return [Math.cos(a) * 10.1, .2, Math.sin(a) * 7.5] as Vec3; }), []);
  useEffect(() => {
    const dummy = new Object3D();
    trees.forEach(([x, y, z], i) => { for (let j = 0; j < 3; j++) { dummy.position.set(x + (j - 1) * .28, y + 1.5 + (j % 2) * .5, z); dummy.scale.set(.62, j === 1 ? .9 : .65, .63); dummy.updateMatrix(); leaves.current!.setMatrixAt(i * 3 + j, dummy.matrix); leaves.current!.setColorAt(i * 3 + j, new Color(i % 4 === 0 ? "#eab1c8" : j % 2 ? "#acd08f" : "#96bc92")); } });
    for (let i = 0; i < 80; i++) { const a = i * Math.PI * 2 / 80; dummy.position.set(Math.cos(a) * 9.25, .36, Math.sin(a) * 6.8); dummy.scale.set(.15, .09, .15); dummy.updateMatrix(); flowers.current!.setMatrixAt(i, dummy.matrix); flowers.current!.setColorAt(i, new Color(["#efb2ce", "#f8dfa5", "#c6b1e4"][i % 3])); }
    for (const instance of [leaves.current, flowers.current]) { instance!.instanceMatrix.needsUpdate = true; if (instance!.instanceColor) instance!.instanceColor.needsUpdate = true; instance!.computeBoundingSphere(); }
  }, [trees]);
  return <group name="instanced-city-planting">
    <instancedMesh ref={leaves} args={[resources.sphere(), resources.material("#ffffff"), 51]} castShadow receiveShadow dispose={null}/>
    <instancedMesh ref={flowers} args={[resources.sphere(), resources.material("#ffffff"), 80]} dispose={null}/>
    {trees.map(([x, y, z], i) => <RoundBox key={i} position={[x, y + .6, z]} size={[.17, 1.2, .17]} color="#b18c70"/>)}
  </group>;
}
export const CityTerrain = memo(function CityTerrain() {
  return <group name="expanded-city-terrain"><group scale={[1.65, 1, 1.65]}><Island paths={false}/></group>
    <Road points={cityRoad} closed width={1.1}/>{branchRoads.map((points, i) => <Road key={i} points={points}/>)}
    <PlantInstances/><group position={[.15, 0, .6]}><Fountain animate={false}/></group>
    <mesh position={[-7, .23, 4.5]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.15, 48]}/><meshStandardMaterial color="#8ec8cd" roughness={.25}/></mesh>
    {[-1.1, 1.1].map(x => <RoundBox key={x} position={[x, .48, 5]} size={[1.2, .15, .43]} color="#c9a17b"/>)}
    {floatingIslands.map(island => <group key={island.id} position={island.position} scale={island.scale}><Island paths={false}/><Ball position={[0, 1.1, 0]} scale={[.7, 1, .7]} color="#b3cda0"/></group>)}
    {Array.from({ length: 10 }, (_, i) => <RoundBox key={i} position={[10.3 + i * .31, .18 - i * .105, -3 - i * .08]} size={[.28, .12, 1.05]} color="#c5a783"/>)}
    <Clouds/>
  </group>;
});
export function CityBuilding({ building: b, selected, onSelect }: { building: WorldBuilding; selected: boolean; onSelect: (id: string) => void }) {
  const p = palettes[b.kind]; const hq = b.kind === "hq"; const width = hq ? 3 : 2.3;
  const click = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelect(`asset:${b.assetId}`); };
  return <group name={`asset:${b.assetId}`} position={b.position} scale={b.scale} onClick={click} userData={{ assetId: b.assetId, plotId: b.plotId, kind: b.kind, stage: b.stage, focusY: .5 + b.stage * .26 * b.scale }}>
    <RoundBox position={[0, .08, 0]} size={[width + .4, .16, 2.7]} color="#e5d0ad"/>
    {Array.from({ length: b.stage }, (_, i) => <group key={i} name={`floor:${b.assetId}:${i}`} position={[0, .19 + i * .52, 0]}>
      <RoundBox position={[0, .26, 0]} size={[width, .5, 2.2]} color={p.wall}/><RoundBox position={[0, 0, 0]} size={[width + .17, .08, 2.35]} color={p.trim}/>
      {[-.65, .65].map(x => <group key={x} position={[x, .28, 1.14]}><RoundBox size={[.52, .34, .08]} color="#fff2d2"/><RoundBox position={[0, 0, .045]} size={[.39, .22, .04]} color="#9fc8cd"/></group>)}
      <RoundBox position={[width / 2 + .03, .27, 0]} size={[.06, .3, .9]} color="#afcfd4"/>
    </group>)}
    {b.stage > 0 && <>{b.kind === "operations" ? <RoundBox position={[0,.3+b.stage*.52,0]} size={[width+.3,.2,2.55]} color={p.roof}/> : <Roof width={width + .4} depth={2.65} height={hq ? 1 : b.kind === "marketing" ? .95 : .65} color={p.roof} y={.2 + b.stage * .52}/>}<RoundBox position={[0, .58, 1.23]} size={[.56, .84, .1]} color={p.roof}/></>}
    {hq && b.stage > 0 && <group position={[0, .4 + b.stage * .52, 1.4]}><mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.37, .37, .12, 24]}/><meshStandardMaterial color="#f7de9f"/></mesh><RoundBox position={[0, .06, .1]} size={[.025, .18, .03]} color="#aa8866"/></group>}
    {b.kind === "revenue" && b.stage>0 && <group position={[0, 1.05, 1.4]} rotation={[.22,0,0]}>{Array.from({length:6},(_,i)=><RoundBox key={i} position={[-.85+i*.34,0,0]} size={[.34,.13,.6]} color={i%2 ? "#f4e2c1" : "#df9f8d"}/>)}</group>}
    {b.kind === "development" && b.stage>0 && <RoundBox position={[.3,.57+b.stage*.52,.55]} rotation={[.5,0,0]} size={[1.2,.09,.9]} color="#b9d5d7"/>}
    {b.kind === "operations" && b.stage>0 && <group position={[.5,.6+b.stage*.52,0]}><RoundBox size={[.8,.35,.8]} color="#cfbe9e"/><Ball position={[0,.3,0]} scale={[.48,.25,.4]} color="#acc397"/></group>}
    {hq && b.stage>0 && <group><RoundBox position={[0,.06,1.5]} size={[1.2,.12,.7]} color="#ddc9a7"/><RoundBox position={[0,1.05,1.4]} size={[1.35,.14,.65]} color="#8db29d"/></group>}
    {b.kind === "operations" && <group position={[.85, .55, 1.3]}><RoundBox size={[.5, .8, .35]} color="#a0b69a"/>{[.1, -.1].map(y => <Ball key={y} position={[.06, y, .2]} scale={.035} color="#f0d69b"/>)}</group>}
    {b.kind === "marketing" && b.stage>0 && <group position={[.9, .4 + b.stage * .52, .1]}><mesh rotation={[0, 0, -.4]}><coneGeometry args={[.28, .5, 16, 1, true]}/><meshStandardMaterial color="#d9a8d0"/></mesh></group>}
    {b.stage > 0 && b.stage < 5 && <group name={`construction:${b.assetId}`} position={[1.5, 0, -.75]}>{[-.3, .3].map(x => <RoundBox key={x} position={[x, 1.9, 0]} size={[.07, 3.8, .07]} color="#d7b56a"/>)}{[.7,1.5,2.3,3.1].map(y=><RoundBox key={y} position={[0,y,0]} size={[.7,.06,.08]} color="#d7b56a"/>)}<RoundBox position={[.3, 3.8, 0]} size={[2, .12, .15]} color="#d7b56a"/><RoundBox position={[-.55, 3.1, 0]} size={[.03, 1.4, .03]} color="#a99f89"/></group>}
    <RoundBox position={[-.9, .3, 1.35]} size={[.55, .38, .09]} color={p.roof}/>
    {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .014, 0]}><ringGeometry args={[1.6, 1.66, 48]}/><meshBasicMaterial color="#fff0a8"/></mesh>}
  </group>;
}
export function CityPlots({ buildings, selected, onSelect, plotVisibility }: { buildings: WorldBuilding[]; selected: string | null; onSelect: (id: string) => void; plotVisibility?: Record<string,{visible:boolean}> }) {
  return <>{worldPlots.filter(p => plotVisibility?.[p.id]?.visible !== false && !buildings.some(b => b.asset.plotId === p.id)).map(p => <group key={p.id} name={`plot:${p.id}`} position={p.position} onClick={(e: ThreeEvent<MouseEvent>) => { if (e.delta > 5) return; e.stopPropagation(); onSelect(`plot:${p.id}`); }}>
    <RoundBox position={[0, .03, 0]} size={[1.8, .06, 1.6]} color={selected === `plot:${p.id}` ? "#eee0ac" : "#cad3b4"}/><RoundBox position={[0, .35, 0]} size={[.65, .55, .1]} color="#f3dfb7"/><RoundBox position={[0, .35, .07]} size={[.3, .055, .03]} color="#a9b391"/><RoundBox position={[0, .35, .07]} size={[.055, .3, .03]} color="#a9b391"/>
  </group>)}</>;
}
