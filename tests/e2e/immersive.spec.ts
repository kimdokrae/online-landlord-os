import { test, expect, type Page } from "@playwright/test";

async function fallback(page: Page) {
  await page.addInitScript(() => { HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("Fullscreen denied for fallback test")); });
}
const viewport = (page: Page) => page.getByRole("region", { name: "도시 탐색 영역" });
async function camera(page: Page) {
  return JSON.parse((await viewport(page).getAttribute("data-camera"))!) as { x: number; y: number; zoom: number };
}

test("fallback preserves selection and camera; exit restores scroll, focus and dashboard", async ({ page }) => {
  await fallback(page);
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "페이퍼 가든 건물 선택" }).click();
  await page.getByLabel("데모 건설 단계").selectOption("2");
  await page.getByRole("button", { name: "도시 확대", exact: true }).click();
  const before = await camera(page);
  const enter = page.getByRole("button", { name: "전체 화면 탐험" });
  await enter.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await enter.click();
  await expect(page.getByRole("dialog", { name: "스카이시티 전체 화면 탐험" })).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", true);
  expect(await camera(page)).toEqual(before);
  await expect(page.getByRole("button", { name: "페이퍼 가든 건물 선택" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("complementary", { name: "탐험 모드 건물 정보" })).toContainText("2/5층");
  await expect(page.getByRole("button", { name: "전체 화면 종료" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "카메라 위치 초기화" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "전체 화면 종료" })).toBeFocused();
  await page.getByRole("button", { name: "전체 화면 종료" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(enter).toBeFocused();
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", false);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  expect(await camera(page)).toEqual(before);
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("2");
  await enter.click();
  await page.keyboard.press("Escape");
  await expect(enter).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("native fullscreen enters and ESC exits without leaving the dashboard inert", async ({ page }) => {
  await page.goto("/city?view=legacy");
  const supported = await page.evaluate(() => document.fullscreenEnabled);
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  if (supported) await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", false);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("immersive buildings open a floating summary and route to existing details", async ({ page }, testInfo) => {
  await fallback(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await page.getByRole("button", { name: "오빗 노트 건물 선택" }).click();
  const card = page.getByRole("complementary", { name: "탐험 모드 건물 정보" });
  await expect(card.getByRole("heading", { name: "오빗 노트" })).toBeVisible();
  await expect(card).toContainText("핵심 기능 구현");
  await page.screenshot({ path: testInfo.outputPath("immersive-desktop.png") });
  await card.getByRole("link", { name: "건물 상세 보기" }).click();
  await expect(page).toHaveURL(/\/assets\/orbit-note$/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", false);
});

test("missing Fullscreen API still opens and closes a viewport-filling city", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(HTMLElement.prototype, "requestFullscreen", { configurable: true, value: undefined }));
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const box = (await page.getByRole("dialog").boundingBox())!;
  const size = page.viewportSize()!;
  expect(box).toEqual({ x: 0, y: 0, width: size.width, height: size.height });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "전체 화면 탐험" })).toBeFocused();
});

test("empty immersive plot registers a persistent building in the shared city", async ({ page }) => {
  await fallback(page);
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await page.getByRole("button", { name: "개발 건설섬 빈 부지 2 등록" }).click();
  await expect(page).toHaveURL(/\/plots\/new\?plot=build-1$/);
  await expect(page.getByLabel("빈 부지 선택")).toHaveValue("build-1");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await page.getByLabel("건물 이름").fill("작은 구름 작업실");
  await page.getByRole("button", { name: "데모 건물 등록" }).click();
  await expect(page).toHaveURL(/\/assets\/demo-/);
  await page.getByLabel("데모 건설 단계").selectOption("3");
  await page.reload();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("3");
  await page.getByRole("link", { name: "스카이시티로 돌아가기" }).click();
  await page.getByRole("link",{name:"이전 2D 도시 보기",exact:true}).click();
  await page.locator('[data-world-version="stable"]').waitFor({state:"visible"});
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const building = page.getByRole("button", { name: "작은 구름 작업실 건물 선택" });
  await expect(building.locator("[data-floor]")).toHaveCount(3);
  await building.click();
  await expect(page.getByRole("complementary", { name: "탐험 모드 건물 정보" })).toContainText("3/5층");
});

test("pan, wheel, keyboard, zoom bounds and fit controls work", async ({ page }) => {
  await fallback(page); await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const area = viewport(page); const box = (await area.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 80, { steps: 6 }); await page.mouse.up();
  expect((await camera(page)).x).toBeGreaterThan(0);
  await page.mouse.wheel(0, -180);
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(1);
  const enlarge = page.getByRole("button", { name: "도시 확대", exact: true });
  while (await enlarge.isEnabled()) await enlarge.click();
  expect((await camera(page)).zoom).toBe(3);
  const shrink = page.getByRole("button", { name: "도시 축소", exact: true });
  while (await shrink.isEnabled()) await shrink.click();
  expect((await camera(page)).zoom).toBe(.65);
  await page.getByRole("button", { name: "전체 섬 맞춤 보기" }).click();
  expect(await camera(page)).toEqual({ x: 0, y: 0, zoom: 1 });
  await area.focus(); await page.keyboard.press("ArrowRight");
  expect((await camera(page)).x).toBeLessThan(0);
  await page.getByRole("button", { name: "카메라 위치 초기화" }).click();
  expect(await camera(page)).toEqual({ x: 0, y: 0, zoom: 1 });
});

test("mobile portrait and landscape keep all islands and controls within the screen", async ({ page }, testInfo) => {
  await fallback(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/city?view=legacy"); await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await page.getByRole("button", { name: "페이퍼 가든 건물 선택" }).click();
  for (const size of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    const immersive = (await page.getByRole("dialog").boundingBox())!;
    expect(immersive.x).toBe(0); expect(immersive.y).toBe(0);
    expect(immersive.width).toBe(size.width); expect(immersive.height).toBe(size.height);
    await page.getByRole("button", { name: "전체 섬 맞춤 보기" }).click();
    for (const label of ["전체 화면 종료", "도시 확대", "도시 축소", "전체 섬 맞춤 보기", "카메라 위치 초기화"]) {
      const box = (await page.getByRole("button", { name: label, exact: true }).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(size.width); expect(box.y + box.height).toBeLessThanOrEqual(size.height);
    }
    const controls = (await page.getByRole("group", { name: "도시 카메라 제어" }).boundingBox())!;
    const card = (await page.getByRole("complementary", { name: "탐험 모드 건물 정보" }).boundingBox())!;
    expect(card.y + card.height).toBeLessThanOrEqual(controls.y);
    const region = (await viewport(page).boundingBox())!;
    for (const name of ["중앙 본사섬", "수익 자산섬", "개발 건설섬", "마케팅섬"]) {
      const island = (await page.getByRole("region", { name, exact: true }).boundingBox())!;
      expect(island.x).toBeGreaterThanOrEqual(region.x - 1); expect(island.y).toBeGreaterThanOrEqual(region.y - 1);
      expect(island.x + island.width).toBeLessThanOrEqual(region.x + region.width + 1);
      expect(island.y + island.height).toBeLessThanOrEqual(region.y + region.height + 1);
    }
    await page.screenshot({ path: testInfo.outputPath(`immersive-${size.width}.png`) });
  }
  await page.getByRole("button", { name: "전체 화면 종료" }).click();
  await expect(page.getByRole("heading", { name: "나의 스카이시티" })).toBeVisible();
});

test("touch drag and pinch zoom use the same camera", async ({ page }) => {
  await fallback(page); await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/city?view=legacy"); await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 2 });
  const box = (await viewport(page).boundingBox())!;
  const x = box.x + box.width / 2; const y = box.y + box.height / 2;
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - 30, y, id: 1 }, { x: x + 30, y, id: 2 }] });
  for (const spread of [40, 50, 60]) await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - spread, y, id: 1 }, { x: x + spread, y, id: 2 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => (await camera(page)).zoom).toBeGreaterThan(1.5);
  await page.getByRole("button", { name: "카메라 위치 초기화" }).click();
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 60, y: y + 30, id: 1 }] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(async () => (await camera(page)).x).toBeGreaterThan(0);
});
