import { test } from "node:test";
import assert from "node:assert/strict";
import { plots } from "../lib/demo/data.ts";
import { worldV2Plots, worldV2Spawn, worldV2Walk, sourceToWorld, worldToScreen, screenToWorld } from "../lib/world-v2.ts";
import { findOfficePath } from "../lib/office/pathfinding.ts";
import { interiorDestinations, interiorWalkable, departmentZones, interiorStaff } from "../lib/office/world-v2-layout.ts";
import { advanceMovement } from "../lib/employees/movement.ts";

test("v2 placement keeps every existing plot ID and independent footprint/anchor/entrance", () => {
  assert.deepEqual(Object.keys(worldV2Plots).sort(), plots.map(p => p.id).sort());
  for (const p of Object.values(worldV2Plots)) {
    assert.ok(p.x > 0 && p.x < 1000 && p.y > 0 && p.y < 750);
    assert.ok(p.width > 0 && p.height > 0 && p.hitWidth > 0 && p.hitHeight > 0);
    assert.deepEqual(p.anchor, { x: .5, y: 1 }); assert.equal(p.depth, Math.round(p.y));
  }
});
test("source/world/screen conversion remains aligned across viewport, pan and zoom", () => {
  assert.deepEqual(sourceToWorld({ x: 724, y: 543 }), { x: 500, y: 375 });
  for (const viewport of [{ width: 320, height: 400 }, { width: 1400, height: 900 }]) for (const scale of [.2, .65, 1, 3]) {
    const camera = { x: 113, y: -76 };
    for (const p of Object.values(worldV2Plots)) {
      const back = screenToWorld(worldToScreen(p, viewport, camera, scale), viewport, camera, scale);
      assert.ok(Math.abs(back.x - p.x) < 1e-9 && Math.abs(back.y - p.y) < 1e-9);
    }
  }
});
test("new outdoor walk arrives at the calibrated HQ entrance", () => {
  assert.deepEqual(worldV2Walk.at(-1), worldV2Plots["hq-0"].entrance);
  const result = advanceMovement(worldV2Spawn, worldV2Walk, 10000);
  assert.equal(result.arrived, true); assert.deepEqual(result.point, worldV2Plots["hq-0"].entrance);
});
test("new interior paths stay on the connected ground-floor corridor", () => {
  for (const destination of Object.values(interiorDestinations)) {
    const path = findOfficePath(interiorDestinations.lobby.point, destination.point, interiorWalkable);
    assert.ok(path); assert.ok(path.every(interiorWalkable));
  }
  assert.equal(findOfficePath(interiorDestinations.lobby.point, { x: 72, y: 36 }, interiorWalkable), null);
  assert.equal(findOfficePath(interiorDestinations.lobby.point, { x: 50, y: 57 }, interiorWalkable), null);
  assert.equal(departmentZones.length, 9); assert.equal(interiorStaff.length, 3);
});
