import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { BufferGeometry, MeshStandardMaterial, SphereGeometry } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

class Resources {
  geometries = new Map<string, BufferGeometry>(); materials = new Map<string, MeshStandardMaterial>();
  box(x: number, y: number, z: number, radius: number) { const key = `${x},${y},${z},${radius}`; if (!this.geometries.has(key)) this.geometries.set(key, new RoundedBoxGeometry(x, y, z, 1, Math.min(radius, x / 3, y / 3, z / 3))); return this.geometries.get(key)!; }
  sphere() { if (!this.geometries.has("sphere")) this.geometries.set("sphere", new SphereGeometry(1, 12, 8)); return this.geometries.get("sphere")!; }
  material(color: string) { if (!this.materials.has(color)) this.materials.set(color, new MeshStandardMaterial({ color, roughness: .8 })); return this.materials.get(color)!; }
  dispose() { this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose()); }
}
const Context = createContext<Resources | null>(null);
export function SceneResources({ children }: { children: ReactNode }) { const resources = useMemo(() => new Resources(), []); useEffect(() => () => resources.dispose(), [resources]); return <Context.Provider value={resources}>{children}</Context.Provider>; }
export function useResources() { const resources = useContext(Context); if (!resources) throw new Error("3D resources provider missing"); return resources; }
