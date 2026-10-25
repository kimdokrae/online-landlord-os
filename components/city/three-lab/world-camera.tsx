import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OrthographicCamera, Vector3, Mesh } from "three";
import type { CameraCommand, CameraPose, LabTelemetry, StaffSnapshot } from "./lab-types";

/** Flush OrbitControls inertia through its public API before placing an exact pose. */
function stopInertia(orbit: OrbitControls) { const damped=orbit.enableDamping; orbit.enableDamping=false; orbit.update(); orbit.enableDamping=damped; }
export function WorldCamera({ command, onTelemetry, mode, restore, levels = 1 }: { command: CameraCommand | null; onTelemetry: (value: LabTelemetry) => void; mode: string; restore?: CameraPose; levels?: number }) {
  const { camera, gl, size, scene } = useThree(); const c = camera as OrthographicCamera;
  const controls = useRef<OrbitControls | null>(null), lastCommand = useRef(0), elapsed = useRef(0), frames = useRef(0);
  const inside = mode !== "city"; const fit = Math.min(size.width / (inside ? 19 : 31), size.height / (inside ? 16 : 24));
  const fitRef = useRef(fit); fitRef.current = fit; const lastFit = useRef(0);
  const approach = useRef<{ target: Vector3; position: Vector3; zoom: number } | null>(null);
  useEffect(() => {
    const orbit = new OrbitControls(camera, gl.domElement); controls.current = orbit;
    orbit.enableDamping = true; orbit.dampingFactor = .12; orbit.rotateSpeed = .5; orbit.zoomSpeed = .7;
    orbit.minPolarAngle = .4; orbit.maxPolarAngle = 1.18; orbit.minAzimuthAngle = Math.PI / 4 - .8; orbit.maxAzimuthAngle = Math.PI / 4 + .8;
    const cancelApproach = () => { approach.current = null; }; orbit.addEventListener("start", cancelApproach);
    const preventMenu = (event: Event) => event.preventDefault(); gl.domElement.addEventListener("contextmenu", preventMenu);
    return () => { orbit.dispose(); controls.current = null; gl.domElement.removeEventListener("contextmenu", preventMenu); };
  }, [camera, gl]);
  useEffect(() => {
    const orbit = controls.current; if (!orbit) return;
    // OrbitControls.update clamps zoom immediately. Apply the destination limits BEFORE restoring a pose.
    // Otherwise the previous interior minimum can clamp the city pose before the next animation frame.
    orbit.minZoom = fitRef.current * .8; orbit.maxZoom = fitRef.current * 3.8;
    approach.current = null; stopInertia(orbit);
    const distance = inside ? 12 : 22; camera.position.set(distance, distance + .2, distance); orbit.target.set(0, inside ? (levels > 1 ? 2.2 : .8) : .2, 0); camera.position.y += inside ? (levels > 1 ? 2 : .6) : 0; c.zoom = fitRef.current;
    if (restore && !inside) { camera.position.fromArray(restore.position); orbit.target.fromArray(restore.target); c.zoom = restore.zoom / (restore.fit ?? fitRef.current) * fitRef.current; }
    c.updateProjectionMatrix(); orbit.update(); lastFit.current = fitRef.current;
    // A mode change restores the prior city pose; ordinary telemetry never resets it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, camera]);
  useEffect(() => { if (lastFit.current) c.zoom = c.zoom / lastFit.current * fit; lastFit.current = fit; c.updateProjectionMatrix(); }, [c, fit]);
  useEffect(() => {
    const orbit = controls.current; if (!orbit || !command || lastCommand.current === command.id) return; lastCommand.current = command.id;
    approach.current = null;
    if (command.action === "left" || command.action === "right") orbit.rotateLeft((command.action === "left" ? 1 : -1) * Math.PI / 8);
    if (command.action === "in" || command.action === "out") c.zoom = Math.max(fitRef.current * .8, Math.min(fitRef.current * 3.8, c.zoom * (command.action === "in" ? 1.25 : .8)));
    if (command.action === "reset") { stopInertia(orbit); const d = inside ? 12 : 22; camera.position.set(d, d + .2, d); orbit.target.set(0, inside ? (levels > 1 ? 2.2 : .8) : .2, 0); camera.position.y += inside ? (levels > 1 ? 2 : .6) : 0; c.zoom = fitRef.current; }
    if (command.action === "focus" && command.target) { stopInertia(orbit); const target = new Vector3(...command.target); approach.current = { target, position: camera.position.clone().sub(orbit.target).add(target), zoom: Math.min(fitRef.current * 3.8, fitRef.current * (inside ? 2.1 : 2.2) * (10 / (command.span ?? 10))) }; }
    c.updateProjectionMatrix(); orbit.update();
  }, [command, camera, c, inside]);
  useFrame((_, delta) => {
    const orbit = controls.current; if (!orbit) return; const dt = Math.min(delta, .08);
    orbit.minZoom = fitRef.current * .8; orbit.maxZoom = fitRef.current * 3.8;
    if (approach.current) { const next = approach.current; const alpha = 1 - Math.exp(-dt * 8); orbit.target.lerp(next.target, alpha); camera.position.lerp(next.position, alpha); c.zoom += (next.zoom - c.zoom) * alpha; c.updateProjectionMatrix(); if (orbit.target.distanceTo(next.target) < .01 && Math.abs(c.zoom - next.zoom) < .03) approach.current = null; }
    const before = orbit.target.clone(); orbit.target.clamp(new Vector3(-9, -.5, -7), new Vector3(9, inside ? 5 : 3, 7)); camera.position.add(orbit.target.clone().sub(before)); orbit.update();
    frames.current++; elapsed.current += delta; if (elapsed.current < .35) return; elapsed.current = 0;
    const anchors: LabTelemetry["anchors"] = {}, buildings: NonNullable<LabTelemetry["buildings"]> = [], staff: StaffSnapshot[] = [];
    let meshes = 0, floorModules = 0, imageMaps = 0;
    scene.traverse(object => {
      if (/^(asset:|employee:|plot:|room:)/.test(object.name)) { const p = object.getWorldPosition(new Vector3()); p.y += object.userData.focusY ?? .65; p.project(camera); anchors[object.name] = { x: (p.x + 1) / 2, y: (1 - p.y) / 2 }; }
      if (object.name.startsWith("asset:")) buildings.push({ assetId: object.userData.assetId, plotId: object.userData.plotId, kind: object.userData.kind, stage: object.userData.stage });
      if (object.userData.staff) staff.push({ ...object.userData.staff });
      if (object.name.startsWith("floor:")) floorModules++;
      if (object instanceof Mesh) { meshes++; for (const material of Array.isArray(object.material) ? object.material : [object.material]) if ("map" in material && material.map) imageMaps++; }
    });
    const first = staff[0];
    onTelemetry({ frames: frames.current, meshes, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, calls: gl.info.render.calls, triangles: gl.info.render.triangles,
      camera: { kind: camera.type, position: camera.position.toArray(), zoom: c.zoom, target: orbit.target.toArray() }, fit: fitRef.current, mode,
      employee: { x: first?.x ?? 0, z: first?.z ?? 0, walking: first?.activity === "WALKING" }, anchors, shadows: gl.shadowMap.enabled, renderer: gl.getContext().getParameter(gl.getContext().VERSION), floors: buildings.find(b => b.assetId === "orbit-note")?.stage ?? 0, floorModules, imageMaps, buildings, staff });
  });
  return null;
}
