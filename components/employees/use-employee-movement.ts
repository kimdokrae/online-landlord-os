"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { advanceMovement, type Point } from "@/lib/employees/movement";

export function useEmployeeMovement(initial: Point, speed: number) {
  const [position, setPosition] = useState<Point>(initial);
  const positionRef = useRef<Point>(initial);
  const route = useRef<readonly Point[]>([]);
  const arrival = useRef<(() => void) | undefined>(undefined);
  const [hasRoute, setHasRoute] = useState(false);
  const [paused, setPausedState] = useState(false);
  const pausedRef = useRef(false);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const setPaused = useCallback((value: boolean) => { pausedRef.current = value; setPausedState(value); }, []);
  const move = useCallback((points: readonly Point[], onArrival?: () => void) => {
    route.current = points.map(p => ({ ...p })); arrival.current = onArrival; setHasRoute(points.length > 0);
    if (!points.length) { arrival.current = undefined; onArrival?.(); }
  }, []);
  const reset = useCallback((point: Point) => {
    route.current = []; arrival.current = undefined; positionRef.current = { ...point }; setPosition({ ...point }); setHasRoute(false);
  }, []);
  useEffect(() => {
    let frame = 0; let previous = 0;
    const tick = (time: number) => {
      const elapsed = previous ? Math.min((time - previous) / 1000, .08) : 0; previous = time;
      if (!document.hidden && !pausedRef.current && route.current.length) {
        const next = advanceMovement(positionRef.current, route.current, elapsed * speed);
        const dx = next.point.x - positionRef.current.x;
        if (Math.abs(dx) > .001) setFacing(dx < 0 ? "left" : "right");
        positionRef.current = next.point; route.current = next.remaining; setPosition(next.point);
        if (next.arrived) { setHasRoute(false); const done = arrival.current; arrival.current = undefined; done?.(); }
      }
      frame = requestAnimationFrame(tick);
    };
    const resetClock = () => { previous = 0; };
    frame = requestAnimationFrame(tick); document.addEventListener("visibilitychange", resetClock);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("visibilitychange", resetClock); };
  }, [speed]);
  return { position, positionRef, facing, walking: hasRoute && !paused, paused, setPaused, move, reset };
}
