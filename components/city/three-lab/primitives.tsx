import { type ReactNode } from "react";
import { useResources } from "./resources";
import type { ThreeElements } from "@react-three/fiber";

export function RoundBox({ size, color, radius = .07, children, ...props }: ThreeElements["mesh"] & { size: [number, number, number]; color: string; radius?: number; children?: ReactNode }) {
  const [x, y, z] = size;
  const resources = useResources();
  return <mesh castShadow receiveShadow {...props} geometry={resources.box(x, y, z, radius)} material={resources.material(color)} dispose={null}>{children}</mesh>;
}
export function Ball({ color, ...props }: ThreeElements["mesh"] & { color: string }) {
  const resources = useResources();
  return <mesh castShadow receiveShadow {...props} geometry={resources.sphere()} material={resources.material(color)} dispose={null}/>;
}
