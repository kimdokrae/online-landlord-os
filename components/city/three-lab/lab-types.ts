export type LabSelection = string | null;
export type CameraPose = { position: number[]; target: number[]; zoom: number; fit?: number };
export type CameraCommand = { id: number; action: "left" | "right" | "in" | "out" | "reset" | "focus"; target?: [number, number, number]; span?: number };
export type LabTelemetry = {
  frames: number; meshes: number; geometries: number; textures: number; calls: number; triangles: number;
  camera: { kind: string; position: number[]; zoom: number; target: number[] };
  employee: { x: number; z: number; walking: boolean };
  anchors: Record<string, { x: number; y: number }>;
  shadows: boolean; renderer: string; floors: number; floorModules: number; imageMaps: number;
  mode?: string; fit?: number; buildings?: { assetId: string; plotId: string; kind: string; stage: number }[];
  staff?: StaffSnapshot[];
};
export type StaffOrder = { seq: number; action: "DESK" | "MEETING" | "REST" };
export type StaffSnapshot = { id: string; assetId: string; x: number; y: number; z: number; floor: number; activity: string; workState: string; department: string; action: StaffOrder["action"]; walkable: boolean; source?: "demo"|"unconnected"; color?:string; visible?:boolean; active?:boolean };
