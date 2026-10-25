import { test } from "node:test";
import assert from "node:assert/strict";
import { initialAssets, plots } from "../lib/demo/data.ts";
import { floorCount } from "../lib/domain.ts";
import { changeStage, parseStoredAssets, registerAsset } from "../lib/demo/state.ts";

test("construction stages change module count without changing KPI or revenue", () => {
  const changed = changeStage(initialAssets, "orbit-note", 5);
  assert.equal(floorCount(changed.find(a => a.id === "orbit-note")!.stage), 5);
  assert.equal(initialAssets.find(a => a.id === "orbit-note")!.stage, 3);
  assert.deepEqual(changed[3].kpi, initialAssets[3].kpi);
  assert.equal(changed[3].revenue, initialAssets[3].revenue);
  for (const invalid of [-1, 6, 1.5, NaN]) assert.throws(() => changeStage(initialAssets, "orbit-note", invalid));
});
test("registration assigns a unique building to exactly one valid vacant plot", () => {
  const assets = registerAsset(initialAssets, { id: "demo-test", name: "  새 건물  ", plotId: "build-1", type: "앱" });
  assert.equal(assets.length, initialAssets.length + 1);
  assert.equal(assets.at(-1)!.name, "새 건물");
  assert.equal(assets.at(-1)!.stage, 0);
  assert.equal(floorCount(assets.at(-1)!.stage), 0);
  assert.throws(() => registerAsset(assets, { id: "another", name: "중복 부지", plotId: "build-1", type: "앱" }));
  assert.throws(() => registerAsset(assets, { id: "demo-test", name: "중복 ID", plotId: "build-2", type: "앱" }));
  assert.throws(() => registerAsset(assets, { id: "new", name: "   ", plotId: "build-2", type: "앱" }));
});
test("all plots fill without overwriting existing buildings", () => {
  let assets = initialAssets;
  for (const plot of plots.filter(p => !initialAssets.some(a => a.plotId === p.id))) assets = registerAsset(assets, { id: `new-${plot.id}`, name: "샘플", type: "웹사이트", plotId: plot.id });
  assert.equal(assets.length, plots.length);
  assert.equal(new Set(assets.map(a => a.plotId)).size, plots.length);
});
test("storage roundtrip preserves custom buildings and strips unrecognized properties", () => {
  const assets = registerAsset(initialAssets, { id: "demo-custom", name: "저장 테스트", plotId: "build-1", type: "SNS" });
  const raw = JSON.stringify({ version: 1, assets: assets.map(a => ({ ...a, arbitrary: "discard" })) });
  assert.deepEqual(parseStoredAssets(raw), assets);
});
test("invalid JSON, versions, shapes, duplicate plots and out of range stages are rejected", () => {
  const wrap = (assets: unknown) => JSON.stringify({ version: 1, assets });
  for (const raw of ["invalid", "null", "[]", '{"version":2,"assets":[]}', wrap([null]), wrap([{ ...initialAssets[0], stage: 20 }]), wrap([{ ...initialAssets[0], kpi: { target: 0 } }]), wrap([{ ...initialAssets[0], employeeId: "unknown" }]), wrap([initialAssets[0], { ...initialAssets[1], plotId: initialAssets[0].plotId }])]) assert.equal(parseStoredAssets(raw), null);
});
