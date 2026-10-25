export type Point = { x: number; y: number };
export function advanceMovement(position: Point, route: readonly Point[], distance: number) {
  let point = { ...position };
  let index = 0;
  let budget = Math.max(0, Number.isFinite(distance) ? distance : 0);
  while (index < route.length) {
    const target = route[index];
    const length = Math.hypot(target.x - point.x, target.y - point.y);
    if (length < .00001) { point = { ...target }; index++; continue; }
    if (length > budget) {
      point = { x: point.x + (target.x - point.x) * budget / length, y: point.y + (target.y - point.y) * budget / length };
      break;
    }
    point = { ...target }; budget -= length; index++;
  }
  return { point, remaining: route.slice(index), arrived: index === route.length };
}
