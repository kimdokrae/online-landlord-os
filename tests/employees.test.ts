import { test } from "node:test";
import assert from "node:assert/strict";
import { employeeAnimation, workActivity, workStates, type EmployeeWorkSignal } from "../lib/employees/status-adapter.ts";
import { employeeThemes } from "../lib/employees/themes.ts";
import { advanceMovement, type Point } from "../lib/employees/movement.ts";
import { gardenWalk, gardenSpawn, buildingEntrance } from "../lib/employees/city-navigation.ts";
import { OFFICE, destinations, officeEntrance, isWalkable } from "../lib/office/layout.ts";
import { findOfficePath } from "../lib/office/pathfinding.ts";

test("work adapter maps signals without making decorative walking into a job", () => {
  const expected = ["IDLE", "WORKING", "MEETING", "REPORTING", "WAITING_APPROVAL", "ERROR"];
  workStates.forEach((state, index) => assert.equal(workActivity({ source: "demo", state }), expected[index]));
  const signal: EmployeeWorkSignal = { source: "demo", state: "NONE" };
  assert.equal(employeeAnimation(signal, true), "WALKING");
  assert.equal(signal.state, "NONE");
  assert.equal(workActivity({ source: "integration", state: "FAILED", runId: "future-run" }), "ERROR");
});
test("all eight department palettes have independent configurable colors", () => {
  assert.equal(Object.keys(employeeThemes).length, 8);
  assert.equal(new Set(Object.values(employeeThemes).map(theme => theme.body)).size, 8);
  assert.equal(employeeThemes.marketing.body, "#d4b7ef");
});
test("movement follows every waypoint and stops exactly at the destination", () => {
  const route = [{ x: 3, y: 0 }, { x: 3, y: 4 }];
  const part = advanceMovement({ x: 0, y: 0 }, route, 5);
  assert.deepEqual(part.point, { x: 3, y: 2 }); assert.equal(part.arrived, false);
  const final = advanceMovement(part.point, part.remaining, 100);
  assert.deepEqual(final.point, { x: 3, y: 4 }); assert.equal(final.arrived, true);
  assert.equal(route.length, 2);
  assert.deepEqual(advanceMovement({ x: 3, y: 4 }, [{ x: 3, y: 4 }], 0).remaining, []);
});
test("every named office destination is reachable without walls, furniture or diagonal cuts", () => {
  for (const destination of Object.values(destinations)) {
    const path = findOfficePath(officeEntrance, destination.point);
    assert.ok(path);
    let previous: Point = officeEntrance;
    for (const point of path) {
      assert.ok(isWalkable(point));
      assert.equal(Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y), 1);
      previous = point;
    }
    assert.deepEqual(previous, destination.point);
  }
});
test("blocked, out-of-range and invalid office targets are rejected", () => {
  for (const goal of [{ x: 10, y: 4 }, { x: 4, y: 4 }, { x: 17, y: 4 }, { x: 0, y: 0 }, { x: 100, y: 1 }, { x: 1.5, y: 9 }]) assert.equal(findOfficePath(officeEntrance, goal), null);
  assert.deepEqual(findOfficePath(officeEntrance, officeEntrance), []);
});
test("interpolated office travel and mid-step replanning stay on free tiles", () => {
  let position: Point = officeEntrance;
  let route: readonly Point[] = findOfficePath(position, destinations.desk.point)!;
  for (let step = 0; step < 800 && route.length; step++) {
    const advanced = advanceMovement(position, route, .13); position = advanced.point; route = advanced.remaining;
    assert.ok(isWalkable({ x: Math.round(position.x), y: Math.round(position.y) }));
    if (step === 19) {
      const anchor = { x: Math.round(position.x), y: Math.round(position.y) };
      route = [anchor, ...findOfficePath(anchor, destinations.meeting.point)!];
    }
  }
  assert.deepEqual(position, destinations.meeting.point);
});
test("city walk and entrances use bounded existing world coordinates", () => {
  assert.deepEqual(buildingEntrance("hq-0"), gardenWalk.at(-1));
  assert.equal(buildingEntrance("missing"), null);
  for (const point of [gardenSpawn, ...gardenWalk]) assert.ok(point.x > 0 && point.x < 1000 && point.y > 0 && point.y < 750);
  assert.equal(OFFICE.columns * OFFICE.tile, OFFICE.width);
});
