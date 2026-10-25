import { test, expect, type Page } from "@playwright/test";
import { initialAssets, plots } from "../../lib/demo/data";
import { registerAsset } from "../../lib/demo/state";

const preview = "/city?preview=world-v2";
const area = (page: Page) => page.getByRole("region", { name: "도시 탐색 영역" });
const building = (page: Page, name = "스튜디오 본사") => page.getByRole("button", { name: `${name} 건물 선택`, exact: true });
const panel = (page: Page) => page.getByRole("complementary", { name: "선택한 건물 정보" });
async function clickMoving(page: Page, selector: string) {
  const box = await page.locator(selector).boundingBox(); expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test("v2 uses empty terrain and independent clickable buildings; stages persist across both versions", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => requests.push(r.url()));
  await page.goto(preview);
  const plate = area(page).locator('img[src="/skycity/world-v2/terrain.webp"]');
  await expect(plate).toBeVisible(); await expect.poll(() => plate.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1448);
  await expect(area(page).locator('[data-asset-id]')).toHaveCount(5);
  await building(page).click(); await expect(panel(page).getByRole("heading", { name: "스튜디오 본사" })).toBeVisible();
  const groundAlignment = await building(page).evaluate(button => {
    const svg = button.querySelector("svg")!; const point = svg.createSVGPoint(); point.x = 130; point.y = 274;
    const screen = point.matrixTransform(svg.getScreenCTM()!); const hit = button.getBoundingClientRect();
    return { x: Math.abs(screen.x - hit.x - hit.width / 2), y: Math.abs(screen.y - hit.bottom) };
  });
  expect(groundAlignment.x).toBeLessThan(1); expect(groundAlignment.y).toBeLessThan(1);
  await page.getByLabel("데모 건설 단계").selectOption("2"); await expect(building(page).locator("[data-floor]")).toHaveCount(2);
  await expect(panel(page).locator('img[src="/skycity/world-v2/terrain.webp"]')).toBeVisible();
  await page.screenshot({ path: "test-results/world-v2-desktop.png", fullPage: true });
  await page.reload(); await expect(building(page).locator("[data-floor]")).toHaveCount(2); await building(page).click();
  await panel(page).getByRole("link", { name: "운영 현황 보기" }).click(); await expect(page).toHaveURL(/assets\/studio-hq\?preview=world-v2/);
  await page.getByRole("link", { name: "스카이시티로 돌아가기" }).click(); await expect(page).toHaveURL(/city\?preview=world-v2/);
  await page.goto("/city?view=legacy"); await expect(area(page).locator('img[src="/skycity/garden-terrain.webp"]')).toBeVisible(); await expect(building(page).locator("[data-floor]")).toHaveCount(2);
  expect(requests.some(url => /master\.png|terrain-base\.png/.test(url))).toBe(false);
  expect(requests.every(url => ["127.0.0.1", "localhost"].includes(new URL(url).hostname))).toBe(true);
});

test("v2 pan, zoom, fullscreen fallback and ESC retain one scene, selection and employee", async ({ page }) => {
  await page.goto(preview);
  await page.evaluate(() => { Object.defineProperty(Element.prototype, "requestFullscreen", { configurable: true, value: () => Promise.reject(new Error("test fallback")) }); });
  await building(page, "오빗 노트").click();
  const terrain = area(page).locator("img"); const before = await terrain.boundingBox();
  await page.getByRole("button", { name: "도시 확대", exact: true }).click();
  const zoomed = await terrain.boundingBox(); expect(zoomed!.width).toBeGreaterThan(before!.width);
  await area(page).scrollIntoViewIfNeeded(); const preFull = (await area(page).boundingBox())!;
  await page.mouse.move(preFull.x + 20, preFull.y + 20); await page.mouse.down(); await page.mouse.move(preFull.x + 28, preFull.y + 20, { steps: 2 }); await page.mouse.up();
  const camera = await area(page).getAttribute("data-camera");
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const dialog = page.getByRole("dialog", { name: "스카이시티 전체 화면 탐험" }); await expect(dialog).toBeVisible();
  expect(await area(page).getAttribute("data-camera")).toBe(camera);
  await expect(building(page, "오빗 노트")).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.locator('[data-scene-employee="city"]')).toHaveCount(1);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0); expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await page.getByRole("button", { name: "전체 섬 맞춤 보기" }).click(); await expect(area(page)).toHaveAttribute("data-camera", JSON.stringify({ x: 0, y: 0, zoom: 1 }));
  await area(page).scrollIntoViewIfNeeded(); const vp = (await area(page).boundingBox())!;
  await page.mouse.move(vp.x + 20, vp.y + 20); await page.mouse.down(); await page.mouse.move(vp.x + 70, vp.y + 50, { steps: 5 }); await page.mouse.up();
  expect(JSON.parse((await area(page).getAttribute("data-camera"))!).x).not.toBe(0);
  await page.mouse.wheel(0, -120); await expect.poll(async () => JSON.parse((await area(page).getAttribute("data-camera"))!).zoom).toBeGreaterThan(1);
  await expect(panel(page)).toBeVisible();
});

test("v2 employee moves in the same camera plane, can be selected, paused and recolored", async ({ page }) => {
  await page.goto(preview); await area(page).scrollIntoViewIfNeeded();
  const actor = page.locator('[data-scene-employee="city"]');
  await expect(actor).toHaveAttribute("data-motion", "WALKING"); const x = await actor.getAttribute("data-x");
  await expect.poll(() => actor.getAttribute("data-x")).not.toBe(x);
  await clickMoving(page, '[data-scene-employee="city"]'); await expect(page.getByRole("region", { name: "직원 상세 카드" })).toBeVisible();
  await page.getByRole("button", { name: "산책 일시정지" }).click(); await expect(actor).toHaveAttribute("data-motion", "IDLE");
  await page.getByLabel("직원 부서", { exact: true }).selectOption("marketing"); await expect(actor.locator("svg")).toHaveAttribute("data-department", "marketing");
  await page.getByLabel("데모 업무 상태").selectOption("RUNNING"); await expect(actor).toHaveAttribute("data-motion", "WORKING");
  await page.getByRole("button", { name: "직원 카드 닫기" }).click();
  await page.getByRole("button", { name: "도시 확대", exact: true }).click(); await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const geometry = await actor.evaluate(element => {
    const hit = element.getBoundingClientRect(); const world = element.parentElement!.getBoundingClientRect(); const scale = world.width / 1000;
    return { actualX: hit.x + hit.width / 2, actualY: hit.bottom, expectedX: world.x + Number(element.getAttribute("data-x")) * scale, expectedY: world.y + Number(element.getAttribute("data-y")) * scale };
  });
  expect(geometry.actualX).toBeCloseTo(geometry.expectedX, 0); expect(geometry.actualY).toBeCloseTo(geometry.expectedY, 0);
  await page.keyboard.press("Escape");
});

test("v2 empty plot registers an independent object and keeps preview and saved stage", async ({ page }) => {
  await page.goto(preview); await page.getByRole("button", { name: "중앙 본사섬 빈 부지 2 등록" }).click();
  await expect(page).toHaveURL(/plots\/new\?plot=hq-1&preview=world-v2/);
  await page.getByLabel("건물 이름").fill("V2 테스트 상점"); await page.getByRole("button", { name: "데모 건물 등록" }).click();
  await expect(page).toHaveURL(/assets\/.*\?preview=world-v2/); await page.getByLabel("데모 건설 단계").selectOption("4");
  await page.getByRole("link", { name: "스카이시티로 돌아가기" }).click(); await expect(building(page, "V2 테스트 상점").locator("[data-floor]")).toHaveCount(4);
  await page.reload(); await expect(building(page, "V2 테스트 상점").locator("[data-floor]")).toHaveCount(4);
});

test("all twelve v2 plots remain independently selectable when fully built", async ({ page }) => {
  let assets = initialAssets;
  for (const plot of plots.filter(p => !assets.some(a => a.plotId === p.id))) assets = registerAsset(assets, { id: `v2-full-${plot.id}`, name: `V2-${plot.id}`, type: "앱", plotId: plot.id });
  assets = assets.map(a => ({ ...a, stage: 5 }));
  await page.addInitScript(value => localStorage.setItem("online-landlord-os:demo:v1", JSON.stringify({ version: 1, assets: value })), assets);
  await page.goto(preview);
  for (const asset of assets) { await building(page, asset.name).click(); await expect(building(page, asset.name)).toHaveAttribute("aria-pressed", "true"); }
});

test("v2 native fullscreen exits and floating HQ menu enters the same preview interior", async ({ page }) => {
  await page.goto(preview); await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await building(page).click(); const card = page.getByRole("complementary", { name: "탐험 모드 건물 정보" }); await expect(card).toContainText("스튜디오 본사");
  await card.getByRole("link", { name: "건물 내부 입장" }).click(); await expect(page).toHaveURL(/office\?preview=world-v2/);
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  await expect(page.locator('img[src="/skycity/world-v2/interior.webp"]')).toBeVisible();
});

test("v2 HQ cutaway has selectable departments, existing staff, safe corridor movement and return", async ({ page }) => {
  await page.goto(preview); await building(page).click(); await panel(page).getByRole("link", { name: "건물 내부 입장" }).click();
  await expect(page).toHaveURL(/assets\/studio-hq\/office\?preview=world-v2/);
  const plate = page.locator('img[src="/skycity/world-v2/interior.webp"]'); await expect(plate).toBeVisible(); await expect.poll(() => plate.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1448);
  await page.getByRole("button", { name: "개발 부서 선택", exact: true }).locator("span").click(); await expect(page.getByRole("region", { name: "선택한 부서 정보" })).toContainText("개발 업무 공간");
  await page.getByRole("button", { name: "레오 실내 직원 선택" }).click(); await expect(page.getByRole("region", { name: "배치 직원 업무 정보" })).toContainText("개발 엔지니어");
  await page.getByRole("button", { name: "실내 선택 정보 닫기" }).click();
  const actor = page.locator('[data-scene-employee="office"]');
  await expect(actor).toHaveAttribute("data-motion", "WORKING", { timeout: 15000 }); await expect(actor).toHaveAttribute("data-walkable", "true");
  await page.getByRole("button", { name: "운영 구역 앞 복도" }).click(); await expect(actor).toHaveAttribute("data-motion", "WALKING");
  await expect(actor).toHaveAttribute("data-x", "26", { timeout: 15000 }); await expect(actor).toHaveAttribute("data-y", "59");
  await expect(actor).toHaveAttribute("data-motion", "WORKING"); await actor.click(); await expect(page.getByRole("region", { name: "직원 상세 카드" })).toBeVisible();
  await page.screenshot({ path: "test-results/world-v2-office.png", fullPage: true });
  await page.getByRole("link", { name: "도시로 돌아가기" }).click(); await expect(page).toHaveURL(/city\?preview=world-v2/);
});

for (const width of [320, 390, 844]) test(`v2 mobile viewport ${width} fits exterior, fullscreen and interior`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 844 ? 390 : 844 }); await page.goto(preview);
  await page.evaluate(() => { Object.defineProperty(Element.prototype, "requestFullscreen", { configurable: true, value: () => Promise.reject(new Error("fallback")) }); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  for (const label of ["전체 화면 종료", "도시 확대", "도시 축소", "전체 섬 맞춤 보기"]) {
    const box = await page.getByRole("button", { name: label, exact: true }).boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(width); expect(box!.y + box!.height).toBeLessThanOrEqual(width === 844 ? 390 : 844);
  }
  const terrain = await area(page).locator("img").boundingBox(); const vp = await area(page).boundingBox();
  expect(terrain!.width).toBeLessThanOrEqual(vp!.width); expect(terrain!.height).toBeLessThanOrEqual(vp!.height);
  await page.screenshot({ path: `test-results/world-v2-mobile-${width}.png` });
  await page.getByRole("button", { name: "전체 화면 종료" }).click();
  await page.goto("/assets/studio-hq/office?preview=world-v2"); await expect(page.locator('img[src="/skycity/world-v2/interior.webp"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});
