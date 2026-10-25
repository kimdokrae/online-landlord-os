import { test } from "node:test";
import assert from "node:assert/strict";
import { cameraMetrics, boundCamera, focusCamera } from "../lib/world-camera.ts";
import { departmentZones } from "../lib/office/world-v2-layout.ts";

test("legacy camera retains its zoom range and world pan limits", () => {
  const metrics = cameraMetrics({ width: 650, height: 550 });
  assert.equal(metrics.min, .65); assert.equal(metrics.max, 3);
  assert.deepEqual(boundCamera({ x: 9000, y: -9000, zoom: .1 }, metrics), { x: 750, y: -562.5, zoom: .65 });
});
test("contain fit and raster-aware limits adapt to portrait, landscape and desktop", () => {
  for (const size of [{ width: 280, height: 400 }, { width: 800, height: 220 }, { width: 1440, height: 850 }]) {
    const m = cameraMetrics(size, { bounded: true, minZoom: 1, maxZoom: 6, sourceWidth: 1448 });
    assert.ok(1000 * m.fit <= size.width && 750 * m.fit <= size.height);
    assert.equal(m.min, 1); assert.ok(m.max >= 1 && m.max <= 6);
    assert.ok(m.fit * m.max <= 1448 / 1000 * 1.4 + 1e-9);
    const p = boundCamera({ x: 99999, y: -99999, zoom: -1 }, m);
    assert.equal(p.zoom, 1); assert.ok(Math.abs(p.x) <= 24 && Math.abs(p.y) <= 24);
  }
});
test("every quick department view centers its existing rectangle and respects image limits", () => {
  const m = cameraMetrics({ width: 650, height: 480 }, { bounded: true, minZoom: 1, maxZoom: 6, sourceWidth: 1448 });
  for (const zone of departmentZones) {
    const c = focusCamera(zone, m);
    assert.ok(c.zoom > 1 && c.zoom <= m.max);
    assert.equal(c.x + zone.x + zone.width / 2, 500);
    assert.equal(c.y + zone.y + zone.height / 2, 375);
  }
});
