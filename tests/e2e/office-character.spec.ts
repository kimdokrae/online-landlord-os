import { test, expect } from "@playwright/test";
import { employeeThemes } from "../../lib/employees/themes";

test("city character walks the garden, can be selected while moving, and changes all department colors", async ({ page }, testInfo) => {
  await page.goto("/city?view=legacy");
  const actor = page.getByRole("button", { name: "아리아 직원 선택", exact: true });
  await expect(actor).toHaveCount(1);
  await expect(actor).toHaveAttribute("data-motion", "WALKING");
  expect(await actor.locator('[data-part="figure"]').evaluate(el => getComputedStyle(el).animationName)).toContain("step");
  const initialY = Number(await actor.getAttribute("data-y"));
  await expect.poll(async () => Number(await actor.getAttribute("data-y"))).toBeLessThan(initialY);
  await page.getByRole("region", { name: "도시 탐색 영역" }).scrollIntoViewIfNeeded();
  const box = (await actor.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const card = page.getByRole("region", { name: "직원 상세 카드" });
  await expect(card).toBeVisible();
  await expect(card).toContainText("실제 AI 업무·모델은 연결되지 않았습니다");
  await card.getByRole("button", { name: "산책 일시정지" }).click();
  await expect(actor).toHaveAttribute("data-motion", "IDLE");
  expect(await actor.locator('[data-part="figure"]').evaluate(el => getComputedStyle(el).animationName)).toContain("breathe");
  for (const [id, theme] of Object.entries(employeeThemes)) {
    await card.getByLabel("직원 부서").selectOption(id);
    await expect(actor.locator("svg")).toHaveAttribute("data-department", id);
    expect(await actor.locator("svg").evaluate(el => getComputedStyle(el).getPropertyValue("--employee-body").trim())).toBe(theme.body);
  }
  await page.screenshot({ path: testInfo.outputPath("city-employee.png"), fullPage: true });
});

test("garden route arrives at the headquarters entrance and becomes idle", async ({ page }) => {
  await page.goto("/city?view=legacy");
  const actor = page.getByRole("button", { name: "아리아 직원 선택", exact: true });
  await expect(actor).toHaveAttribute("data-motion", "WALKING");
  await expect(actor).toHaveAttribute("data-motion", "IDLE", { timeout: 15000 });
  await expect(actor).toHaveAttribute("data-x", "481");
  await expect(actor).toHaveAttribute("data-y", "240");
});

test("employee shares the world transform through zoom and immersive mode", async ({ page }) => {
  await page.addInitScript(() => { HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("fallback")); });
  await page.goto("/city?view=legacy");
  const actor = page.getByRole("button", { name: "아리아 직원 선택", exact: true });
  await page.getByRole("region", { name: "도시 탐색 영역" }).scrollIntoViewIfNeeded();
  const box = (await actor.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.getByRole("button", { name: "산책 일시정지" }).click();
  const point = { x: Number(await actor.getAttribute("data-x")), y: Number(await actor.getAttribute("data-y")) };
  await page.getByRole("button", { name: "직원 카드 닫기" }).click();
  await page.getByRole("button", { name: "도시 확대", exact: true }).click();
  await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  const geometry = await actor.evaluate(element => {
    const actorBox = element.getBoundingClientRect(); const world = element.parentElement!; const worldBox = world.getBoundingClientRect();
    return { centerX: actorBox.x + actorBox.width / 2, bottom: actorBox.y + actorBox.height, worldX: worldBox.x, worldY: worldBox.y, scale: worldBox.width / 1000 };
  });
  expect(geometry.centerX).toBeCloseTo(geometry.worldX + point.x * geometry.scale, 0);
  expect(geometry.bottom).toBeCloseTo(geometry.worldY + point.y * geometry.scale, 0);
  await actor.click();
  await expect(page.getByRole("region", { name: "직원 상세 카드" })).toBeVisible();
  await page.getByRole("dialog").getByLabel("직원 부서").selectOption("marketing");
  await expect(actor.locator("svg")).toHaveAttribute("data-department", "marketing");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(actor).toHaveAttribute("data-x", String(point.x));
});

test("demo work statuses switch motions without invoking actual jobs", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (!['127.0.0.1', 'localhost'].includes(new URL(request.url()).hostname)) external.push(request.url()); });
  await page.goto("/city?view=legacy");
  const actor = page.getByRole("button", { name: "아리아 직원 선택", exact: true });
  await page.getByRole("region", { name: "도시 탐색 영역" }).scrollIntoViewIfNeeded();
  const box = (await actor.boundingBox())!; await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  for (const [signal, activity] of [["RUNNING", "WORKING"], ["MEETING", "MEETING"], ["COMPLETED", "REPORTING"], ["AWAITING_APPROVAL", "WAITING_APPROVAL"], ["FAILED", "ERROR"]]) {
    await page.getByLabel("데모 업무 상태").selectOption(signal);
    await expect(actor).toHaveAttribute("data-motion", activity);
    await expect(page.getByRole("region", { name: "직원 상세 카드" })).toContainText(`${signal} · DEMO`);
  }
  expect(external).toEqual([]);
});

test("headquarters menu enters an office, walks to the desk, meets and reports, then returns to city", async ({ page }, testInfo) => {
  test.setTimeout(45000);
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).click();
  await expect(page.getByRole("link", { name: "운영 현황 보기" })).toHaveAttribute("href", "/assets/studio-hq");
  await page.getByLabel("데모 건설 단계").selectOption("3");
  await page.getByRole("link", { name: "건물 내부 입장" }).click();
  await expect(page).toHaveURL(/\/assets\/studio-hq\/office$/);
  const actor = page.getByRole("button", { name: "아리아 실내 직원 선택" });
  await expect(actor).toHaveAttribute("data-motion", "WALKING");
  await expect(actor).toHaveAttribute("data-motion", "WORKING", { timeout: 10000 });
  await expect(actor).toHaveAttribute("data-x", "5"); await expect(actor).toHaveAttribute("data-y", "6");
  await actor.click();
  await page.getByLabel("직원 부서").selectOption("development");
  await expect(page.getByRole("region", { name: "직원 상세 카드" })).toContainText("아리아");
  await page.screenshot({ path: testInfo.outputPath("office-interior.png"), fullPage: true });
  await page.getByRole("button", { name: "회의 테이블", exact: true }).click();
  await expect(actor).toHaveAttribute("data-motion", "MEETING", { timeout: 10000 });
  await expect(actor).toHaveAttribute("data-x", "17");
  await page.getByRole("button", { name: "대표실 입구", exact: true }).click();
  await expect(actor).toHaveAttribute("data-motion", "REPORTING", { timeout: 10000 });
  await page.getByRole("link", { name: "도시로 돌아가기" }).click();
  await expect(page).toHaveURL(/\/city$/);
  await page.getByRole("link",{name:"이전 2D 도시 보기",exact:true}).click();
  await page.locator('[data-world-version="stable"]').waitFor({state:"visible"});
  await page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).click();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("3");
  await expect(page.getByRole("button", { name: "아리아 직원 선택", exact: true }).locator("svg")).toHaveAttribute("data-department", "development");
});

test("office rejects furniture and walls and reroutes safely when a destination changes", async ({ page }) => {
  await page.goto("/assets/studio-hq/office");
  const actor = page.getByRole("button", { name: "아리아 실내 직원 선택" });
  await expect(actor).toHaveAttribute("data-motion", "WORKING", { timeout: 10000 });
  const scene = page.getByRole("region", { name: "본사 실내 오피스" }).locator('div').first();
  const box = (await scene.boundingBox())!;
  const clickTile = async (x: number, y: number) => page.mouse.click(box.x + (x + .5) / 24 * box.width, box.y + (y + .5) / 18 * box.height);
  await clickTile(4, 4);
  await expect(page.getByRole("status")).toContainText("벽이나 가구");
  await expect(actor).toHaveAttribute("data-x", "5");
  await clickTile(10, 4);
  await expect(page.getByRole("status")).toContainText("벽이나 가구");
  await page.evaluate(() => {
    const actor = document.querySelector('[data-scene-employee="office"]')!;
    (window as unknown as { crossedBlocked: boolean }).crossedBlocked = false;
    new MutationObserver(() => { if (actor.getAttribute("data-walkable") === "false") (window as unknown as { crossedBlocked: boolean }).crossedBlocked = true; }).observe(actor, { attributes: true });
  });
  await page.getByRole("button", { name: "개발 구역", exact: true }).click();
  await expect(actor).toHaveAttribute("data-motion", "WALKING");
  await page.getByRole("button", { name: "회의 테이블", exact: true }).click();
  await expect(actor).toHaveAttribute("data-motion", "MEETING", { timeout: 10000 });
  expect(await page.evaluate(() => (window as unknown as { crossedBlocked: boolean }).crossedBlocked)).toBe(false);
});

test("immersive headquarters entry releases fullscreen and mobile office fits its page", async ({ page }) => {
  await page.addInitScript(() => { HTMLElement.prototype.requestFullscreen = () => Promise.reject(new Error("fallback")); });
  await page.goto("/city?view=legacy"); await page.getByRole("button", { name: "전체 화면 탐험" }).click();
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", true);
  await page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).click();
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", true);
  await page.getByRole("dialog").getByRole("link", { name: "건물 내부 입장" }).click();
  await expect(page).toHaveURL(/\/assets\/studio-hq\/office$/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  await expect(page.locator(".sidebar")).toHaveJSProperty("inert", false);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
