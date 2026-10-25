import { test } from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { GROUND, walkCurve, islandGeometry, pathGeometry, roofGeometry, heartGeometry } from "../components/city/three-lab/geometry.ts";

test("procedural island has real indexed triangles, a smooth opaque top and soil depth", () => {
  const island = islandGeometry([{ r: .1, y: -4.1 }, { r: 6.8, y: 0 }], true, true);
  island.computeBoundingBox(); assert.ok(island.index!.count > 500); assert.ok(island.getAttribute("normal")); assert.ok(island.getAttribute("color"));
  assert.ok(Math.abs(island.boundingBox!.min.y + 4.1) < .00001); assert.ok(island.boundingBox!.max.x > 6); assert.equal(island.boundingBox!.max.y, 0);
  island.dispose();
});
test("walk path is a closed 3D curve on the grass, and path geometry stays on that plane", () => {
  assert.ok(walkCurve.getPointAt(0).distanceTo(walkCurve.getPointAt(1)) < .001);
  for (let i = 0; i <= 100; i++) { const point = walkCurve.getPointAt(i / 100); assert.equal(point.y, GROUND + .025); assert.ok(point.x > -4 && point.x < 4 && point.z < 4.5); }
  const path = pathGeometry(walkCurve, .8); assert.ok(path.index!.count > 600);
  const v = new Vector3(); const positions = path.getAttribute("position"); for (let i = 0; i < positions.count; i++) { v.fromBufferAttribute(positions, i); assert.ok(Math.abs(v.y - GROUND - .025) < .000001); }
  path.dispose();
});
test("beveled roof and sprout heart are solid geometry with actual depth", () => {
  const roof = roofGeometry(3, 1, 2.5); const heart = heartGeometry();
  for (const geometry of [roof, heart]) { geometry.computeBoundingBox(); assert.ok(geometry.getAttribute("position").count > 100); assert.ok(geometry.boundingBox!.max.z - geometry.boundingBox!.min.z > .05); geometry.dispose(); }
});
