import type { Point } from "../employees/movement.ts";
import { isWalkable } from "./layout.ts";

/** Breadth-first search on this small unweighted grid; no diagonal corner cutting. */
export function findOfficePath(start: Point, goal: Point, walkable: (point: Point) => boolean = isWalkable): Point[] | null {
  if (!walkable(start) || !walkable(goal)) return null;
  const key = (p: Point) => `${p.x},${p.y}`;
  const queue: Point[] = [{ ...start }];
  const parent = new Map<string, Point | null>([[key(start), null]]);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = []; let node: Point | null = current;
      while (node && parent.get(key(node))) { path.unshift(node); node = parent.get(key(node))!; }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (walkable(next) && !parent.has(key(next))) { parent.set(key(next), current); queue.push(next); }
    }
  }
  return null;
}
