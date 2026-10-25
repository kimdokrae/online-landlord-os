import { test, expect, type Page } from "@playwright/test";
import { departmentZones } from "../../lib/office/world-v2-layout";
const city = "/city?preview=world-v2";
const office = "/assets/studio-hq/office?preview=world-v2";
const cityArea = (p: Page) => p.getByRole("region", { name: "도시 탐색 영역" });
const officeArea = (p: Page) => p.getByRole("region", { name: "본사 내부 탐색 영역" });
async function camera(area: ReturnType<typeof officeArea>) { return JSON.parse((await area.getAttribute("data-camera"))!) as { x: number; y: number; zoom: number }; }

test("v2 sky continues outside the sharp protected terrain and cannot shrink to a tiny plate", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto(city);
  const area = cityArea(page); await area.scrollIntoViewIfNeeded(); const root = page.locator('[data-world-version="world-v2"]');
  expect((await camera(area)).zoom).toBe(1); await expect(page.getByRole("button", { name: "도시 축소", exact: true })).toBeDisabled();
  const image = area.locator("img"); await expect(image).toHaveCount(1);
  const rendering = await image.evaluate(el => ({ mask: getComputedStyle(el).maskImage, filter: getComputedStyle(el).filter }));
  expect(rendering.mask).toContain("edge-mask.svg"); expect(rendering.filter).toBe("none");
  const cloudMasks = await root.locator('[aria-hidden="true"] > span').evaluateAll(nodes => nodes.map(el => getComputedStyle(el).maskImage));
  expect(cloudMasks).toHaveLength(4); expect(cloudMasks.every(mask => mask.includes("radial-gradient"))).toBe(true);
  await root.screenshot({ path: info.outputPath("city-fit.png") });
  await page.getByRole("button", { name: "도시 확대", exact: true }).click(); await root.screenshot({ path: info.outputPath("city-zoom.png") });
  await page.getByRole("button", { name: "도시 축소", exact: true }).click(); await root.screenshot({ path: info.outputPath("city-min.png") });
  const box = (await area.boundingBox())!; await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.wheel(0, 2000);
  expect((await camera(area)).zoom).toBe(1);
  await area.focus(); for (let n = 0; n < 30; n++) await page.keyboard.press("ArrowRight");
  expect(Math.abs((await camera(area)).x)).toBeLessThanOrEqual(24);
  await page.getByRole("button", { name: "카메라 위치 초기화" }).click();
  expect(await camera(area)).toEqual({ x: 0, y: 0, zoom: 1 });
});

test("office controls zoom and pan a single image/object plane; reset shows the full building", async ({ page }, info) => {
  await page.goto(office); const area = officeArea(page); await area.scrollIntoViewIfNeeded();
  await expect(area).toHaveAttribute("data-camera", JSON.stringify({ x: 0, y: 0, zoom: 1 }));
  await expect(page.getByRole("button", { name: "본사 축소", exact: true })).toBeDisabled();
  const image = area.locator("img"); await expect(image).toBeVisible();
  const box = (await area.boundingBox())!; const base = (await image.boundingBox())!;
  expect(base.width).toBeLessThanOrEqual(box.width); expect(base.height).toBeLessThanOrEqual(box.height);
  await page.getByRole("region", { name: "본사 실내 오피스" }).screenshot({ path: info.outputPath("office-fit.png") });
  await page.getByRole("button", { name: "본사 확대", exact: true }).click(); expect((await image.boundingBox())!.width).toBeGreaterThan(base.width);
  await area.focus(); await page.keyboard.press("ArrowLeft"); expect((await camera(area)).x).toBeGreaterThan(0);
  await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.wheel(0, -150); await expect.poll(async () => (await camera(area)).zoom).toBeGreaterThan(1.25);
  await page.getByRole("button", { name: "전체 건물 맞춤 보기" }).click(); expect(await camera(area)).toEqual({ x: 0, y: 0, zoom: 1 });
  await page.getByRole("button", { name: "본사 확대", exact: true }).click(); await page.getByRole("button", { name: "본사 카메라 초기화" }).click(); expect((await camera(area)).zoom).toBe(1);
});

test("all department shortcuts center their rectangles, remain accessible and do not restart employee movement", async ({ page }, info) => {
  await page.goto(office); const area = officeArea(page);
  const actor = page.locator('[data-scene-employee="office"]'); await expect(actor).toHaveAttribute("data-motion", "WORKING", { timeout: 10000 });
  const initial = { x: await actor.getAttribute("data-x"), y: await actor.getAttribute("data-y") };
  for (const zone of departmentZones) {
    await page.getByRole("button", { name: `${zone.quickLabel} 빠른 확대`, exact: true }).click();
    await expect(page.getByRole("region", { name: "선택한 부서 정보" })).toContainText(zone.label);
    const c = await camera(area); expect(c.zoom).toBeGreaterThan(1);
    expect(c.x + zone.x + zone.width / 2).toBeCloseTo(500); expect(c.y + zone.y + zone.height / 2).toBeCloseTo(375);
    await expect(actor).toHaveAttribute("data-x", initial.x!); await expect(actor).toHaveAttribute("data-y", initial.y!); await expect(actor).toHaveAttribute("data-motion", "WORKING");
  }
  await page.getByRole("button", { name: "개발팀 빠른 확대" }).click(); await page.getByRole("button", { name: "레오 실내 직원 선택" }).click();
  await expect(page.getByRole("region", { name: "배치 직원 업무 정보" })).toContainText("개발 엔지니어");
  await page.getByRole("region", { name: "본사 실내 오피스" }).screenshot({ path: info.outputPath("office-department-zoom.png") });
  await page.getByRole("button", { name: "전체 건물 맞춤 보기" }).click(); expect((await camera(area)).zoom).toBe(1);
});

test("zoomed floor clicks use world/tile coordinates and dragging never dispatches a move", async ({ page }, info) => {
  await page.goto(office); const area = officeArea(page); await area.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "재무팀 빠른 확대" }).click(); await page.getByRole("button", { name: "실내 선택 정보 닫기" }).click();
  const scene = area.locator('[data-office-version="world-v2"]'); const box = (await scene.boundingBox())!; const scale = box.width / 1000;
  await page.mouse.click(box.x + 735 * scale, box.y + 605 * scale);
  const actor = area.locator('[data-scene-employee="office"]');
  await expect(actor).toHaveAttribute("data-x", "73", { timeout: 12000 }); await expect(actor).toHaveAttribute("data-y", "60"); await expect(actor).toHaveAttribute("data-motion", "IDLE"); await expect(actor).toHaveAttribute("data-walkable", "true");
  const geometry = await actor.evaluate(el => { const hit = el.getBoundingClientRect(); const world = el.parentElement!.getBoundingClientRect(); const s = world.width / 1000; return { x: hit.x + hit.width / 2, y: hit.bottom, expectedX: world.x + (Number(el.getAttribute("data-x")) + .5) * 10 * s, expectedY: world.y + (Number(el.getAttribute("data-y")) + .5) * 10 * s }; });
  expect(geometry.x).toBeCloseTo(geometry.expectedX, 0); expect(geometry.y).toBeCloseTo(geometry.expectedY, 0);
  await actor.click(); await expect(page.getByRole("region", { name: "직원 상세 카드" })).toContainText("아리아");
  const viewport = (await area.boundingBox())!; const goal = await actor.getAttribute("data-goal");
  await page.mouse.move(viewport.x + 20, viewport.y + 20); await page.mouse.down(); await page.mouse.move(viewport.x + 100, viewport.y + 80, { steps: 6 }); await page.mouse.up();
  expect((await camera(area)).x).not.toBe(0); await expect(actor).toHaveAttribute("data-goal", goal!); await expect(actor).toHaveAttribute("data-motion", "IDLE");
  await page.getByRole("region", { name: "본사 실내 오피스" }).screenshot({ path: info.outputPath("office-pan.png") });
  await page.getByRole("link", { name: "도시로 돌아가기" }).click(); await expect(page).toHaveURL(/city\?preview=world-v2/); await expect(cityArea(page)).toBeVisible();
});

for (const size of [{ width: 320, height: 844 }, { width: 844, height: 390 }]) test(`office ${size.width} mobile controls, room focus and touch camera stay aligned`, async ({ page }, info) => {
  await page.setViewportSize(size); await page.goto(office); const area = officeArea(page); await area.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(size.width);
  for (const name of ["본사 확대", "본사 축소", "전체 건물 맞춤 보기", "본사 카메라 초기화"]) { const box = (await page.getByRole("button", { name, exact: true }).boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(size.width); }
  const box = (await area.boundingBox())!; const x = box.x + box.width / 2; const y = box.y + box.height / 2;
  const client = await page.context().newCDPSession(page); await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - 25, y, id: 1 }, { x: x + 25, y, id: 2 }] });
  for (const spread of [35, 45, 55]) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - spread, y, id: 1 }, { x: x + spread, y, id: 2 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await expect.poll(async () => (await camera(area)).zoom).toBeGreaterThan(1.5);
  await page.getByRole("button", { name: "본사 카메라 초기화" }).click();
  await page.getByRole("button", { name: "고객지원팀 빠른 확대" }).click(); expect((await camera(area)).zoom).toBeGreaterThan(1);
  await page.getByRole("region", { name: "본사 실내 오피스" }).screenshot({ path: info.outputPath(`office-mobile-${size.width}.png`) });
});
