export type CameraPoint = { x: number; y: number };
export type CameraState = CameraPoint & { zoom: number };
export type CameraRect = CameraPoint & { width: number; height: number };
export type CameraOptions = { bounded?: boolean; minZoom?: number; maxZoom?: number; sourceWidth?: number; pixelBudget?: number; enabled?: boolean };
export const CAMERA_WORLD = { width: 1000, height: 750 };
export const CAMERA_INITIAL: CameraState = { x: 0, y: 0, zoom: 1 };
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Zoom is relative to a contain fit, not a fixed CSS pixel scale. */
export function cameraMetrics(size: { width: number; height: number }, options: CameraOptions = {}) {
  const fit = Math.max(.01, Math.min((Math.max(25, size.width) - 24) / CAMERA_WORLD.width, (Math.max(25, size.height) - 24) / CAMERA_WORLD.height));
  const min = options.minZoom ?? .65;
  const max = Math.max(min, Math.min(options.maxZoom ?? 3, options.sourceWidth ? options.sourceWidth / CAMERA_WORLD.width * (options.pixelBudget ?? 1.4) / fit : Infinity));
  return { fit, min, max, size, bounded: !!options.bounded };
}
export type CameraMetrics = ReturnType<typeof cameraMetrics>;
export function boundCamera(next: CameraState, metrics: CameraMetrics): CameraState {
  const zoom = clamp(next.zoom, metrics.min, metrics.max);
  const scale = metrics.fit * zoom;
  // A small elastic margin still permits a gentle drag at full fit, but never
  // lets the entire scene be dragged away. Legacy /city keeps its original bounds.
  const limitX = metrics.bounded ? Math.max(0, (CAMERA_WORLD.width - metrics.size.width / scale) / 2) + 24 : CAMERA_WORLD.width * .75;
  const limitY = metrics.bounded ? Math.max(0, (CAMERA_WORLD.height - metrics.size.height / scale) / 2) + 24 : CAMERA_WORLD.height * .75;
  return { x: clamp(next.x, -limitX, limitX), y: clamp(next.y, -limitY, limitY), zoom };
}
export function cameraTransform(camera: CameraState, scale: number) {
  return `translate(calc(-50% + ${camera.x * scale}px), calc(-50% + ${camera.y * scale}px)) scale(${scale})`;
}
export function focusCamera(rect: CameraRect, metrics: CameraMetrics): CameraState {
  const targetScale = Math.min(metrics.size.width * .78 / Math.max(1, rect.width), metrics.size.height * .78 / Math.max(1, rect.height));
  return boundCamera({ x: CAMERA_WORLD.width / 2 - rect.x - rect.width / 2, y: CAMERA_WORLD.height / 2 - rect.y - rect.height / 2, zoom: targetScale / metrics.fit }, metrics);
}
