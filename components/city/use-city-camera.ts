"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent, type MouseEvent } from "react";

import { CAMERA_WORLD, CAMERA_INITIAL, cameraMetrics, boundCamera, cameraTransform, focusCamera, clamp, type CameraOptions, type CameraRect } from "@/lib/world-camera";
export const WORLD = CAMERA_WORLD;
export const ZOOM = { min: .65, max: 3 };
type Camera = { x: number; y: number; zoom: number };
type Point = { x: number; y: number };
const initial = CAMERA_INITIAL;

export function useCityCamera(options: CameraOptions = {}) {
  const enabled = options.enabled !== false;
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [camera, setCamera] = useState<Camera>(initial);
  const current = useRef(camera);
  const metrics = cameraMetrics(size, options);
  const metricsRef = useRef(metrics); metricsRef.current = metrics;
  const fit = metrics.fit;
  const fitRef = useRef(fit); fitRef.current = fit;
  const points = useRef(new Map<number, Point>());
  const gesture = useRef({ moved: false, start: { x: 0, y: 0 }, suppressUntil: 0 });
  const [dragging, setDragging] = useState(false);
  const update = useCallback((next: Camera) => {
    const bounded = boundCamera(next, metricsRef.current);
    current.current = bounded; setCamera(previous => previous.x === bounded.x && previous.y === bounded.y && previous.zoom === bounded.zoom ? previous : bounded);
  }, []);
  const zoomAt = useCallback((factor: number, anchor: Point = { x: 0, y: 0 }) => {
    const old = current.current; const limits = metricsRef.current; const zoom = clamp(old.zoom * factor, limits.min, limits.max);
    const before = fitRef.current * old.zoom; const after = fitRef.current * zoom;
    update({ zoom, x: old.x + anchor.x / after - anchor.x / before, y: old.y + anchor.y / after - anchor.y / before });
  }, [update]);
  useEffect(() => {
    const element = viewport.current; if (!element || !enabled) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    const wheel = (event: WheelEvent) => {
      event.preventDefault(); const rect = element.getBoundingClientRect();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      zoomAt(Math.exp(-clamp(delta, -180, 180) * .003), { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => { observer.disconnect(); element.removeEventListener("wheel", wheel); };
  }, [zoomAt, enabled]);
  useEffect(() => { if (metrics.bounded) update(current.current); }, [metrics.fit, metrics.min, metrics.max, metrics.size.width, metrics.size.height, metrics.bounded, update]);
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.current.size === 1) gesture.current = { moved: false, start: { x: event.clientX, y: event.clientY }, suppressUntil: 0 };
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const previous = points.current.get(event.pointerId); if (!previous) return;
    const before = [...points.current.values()]; const next = { x: event.clientX, y: event.clientY };
    points.current.set(event.pointerId, next); const after = [...points.current.values()];
    if (!gesture.current.moved && points.current.size === 1 && Math.hypot(next.x - gesture.current.start.x, next.y - gesture.current.start.y) < 5) return;
    gesture.current.moved = true; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
    if (before.length === 2) {
      const distance = (p: Point[]) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      const rect = event.currentTarget.getBoundingClientRect();
      const oldCenter = { x: (before[0].x + before[1].x) / 2, y: (before[0].y + before[1].y) / 2 };
      const center = { x: (after[0].x + after[1].x) / 2, y: (after[0].y + after[1].y) / 2 };
      if (distance(before) > 0) zoomAt(distance(after) / distance(before), { x: oldCenter.x - rect.left - rect.width / 2, y: oldCenter.y - rect.top - rect.height / 2 });
      update({ ...current.current, x: current.current.x + (center.x - oldCenter.x) / (fitRef.current * current.current.zoom), y: current.current.y + (center.y - oldCenter.y) / (fitRef.current * current.current.zoom) });
    } else {
      const scale = fitRef.current * current.current.zoom;
      update({ ...current.current, x: current.current.x + (next.x - previous.x) / scale, y: current.current.y + (next.y - previous.y) / scale });
    }
  }
  function pointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (gesture.current.moved) gesture.current.suppressUntil = performance.now() + 350;
    points.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!points.current.size) setDragging(false);
  }
  function keyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const direction: Record<string, Point> = { ArrowLeft: { x: 65, y: 0 }, ArrowRight: { x: -65, y: 0 }, ArrowUp: { x: 0, y: 65 }, ArrowDown: { x: 0, y: -65 } };
    if (direction[event.key]) { event.preventDefault(); const delta = direction[event.key]; update({ ...current.current, x: current.current.x + delta.x, y: current.current.y + delta.y }); }
    if (["+", "=", "-", "0"].includes(event.key)) { event.preventDefault(); if (event.key === "0") update(initial); else zoomAt(event.key === "-" ? 1 / 1.25 : 1.25); }
  }
  const focusRect = useCallback((rect: CameraRect) => update(focusCamera(rect, metricsRef.current)), [update]);
  const scale = fit * camera.zoom;
  return { viewport, camera, scale, limits: { min: metrics.min, max: metrics.max }, dragging, zoomAt, reset: () => update(initial),
    focusRect,
    worldStyle: { width: WORLD.width, height: WORLD.height, transform: cameraTransform(camera, scale) },
    gestures: { onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: pointerUp, onPointerCancel: pointerUp, onKeyDown: keyDown,
      onClickCapture: (event: MouseEvent) => { if (performance.now() < gesture.current.suppressUntil) { event.preventDefault(); event.stopPropagation(); } },
    },
  };
}
