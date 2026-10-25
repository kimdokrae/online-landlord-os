import { test, expect } from "@playwright/test";
import { initialAssets, plots } from "../../lib/demo/data";
import { registerAsset } from "../../lib/demo/state";

test("city selection, detail navigation, stages and local persistence work together", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/city?view=legacy");
  await expect(page.getByRole("heading", { name: "나의 스카이시티" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.screenshot({ path: testInfo.outputPath("city-desktop.png"), fullPage: true });
  await page.getByRole("button", { name: "페이퍼 가든 건물 선택" }).click();
  const panel = page.getByRole("complementary", { name: "선택한 건물 정보" });
  await expect(panel.getByRole("heading", { name: "페이퍼 가든" })).toBeVisible();
  await panel.getByLabel("데모 건설 단계").selectOption("2");
  await expect(page.getByRole("button", { name: "페이퍼 가든 건물 선택" }).locator("[data-floor]")).toHaveCount(2);
  await panel.getByRole("link", { name: "건물 상세 보기" }).click();
  await expect(page).toHaveURL(/\/assets\/paper-garden$/);
  await expect(page.getByRole("heading", { name: "페이퍼 가든", exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("2");
  await page.getByLabel("데모 건설 단계").selectOption("4");
  await expect(page.locator(".detail-building [data-floor]")).toHaveCount(4);
  await page.reload();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("4");
  expect(errors).toEqual([]);
});

test("a new building keeps its ID and plot through reload and appears on city map", async ({ page }) => {
  await page.goto("/city?view=legacy");
  await page.getByRole("button", { name: "개발 건설섬 빈 부지 2 등록" }).click();
  await expect(page.getByLabel("빈 부지 선택")).toHaveValue("build-1");
  await page.getByLabel("건물 이름").fill("테스트 스튜디오");
  await page.getByLabel("사업 유형").selectOption("앱");
  await page.getByRole("button", { name: "데모 건물 등록" }).click();
  await expect(page).toHaveURL(/\/assets\/demo-/);
  const url = page.url();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("0");
  await expect(page.locator(".detail-building [data-floor]")).toHaveCount(0);
  await page.getByLabel("데모 건설 단계").selectOption("3");
  await page.reload();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("3");
  await expect(page).toHaveURL(url);
  await expect(page.getByText("build-1", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "스카이시티로 돌아가기" }).click();
  // Continue on the legacy route through client navigation, preserving session state.
  await page.getByRole("link",{name:"이전 2D 도시 보기",exact:true}).click();
  await page.locator('[data-world-version="stable"]').waitFor({state:"visible"});
  const building = page.getByRole("button", { name: "테스트 스튜디오 건물 선택" });
  await expect(building).toBeVisible();
  await expect(building.locator("[data-floor]")).toHaveCount(3);
  await building.click();
  await page.getByRole("link", { name: "건물 상세 보기" }).click();
  await expect(page).toHaveURL(url);
});

test("all menu routes, employee detail and unknown routes render", async ({ page }) => {
  const routes = [
    ["city", "스카이시티"], ["hq", "중앙 본사"], ["office", "직원 오피스"],
    ["boardroom", "전략회의실"], ["tasks", "업무센터"], ["reports", "보고센터"],
    ["finance", "금고"], ["archive", "기록보관소"], ["settings", "설정"],
  ];
  await page.goto("/");
  await expect(page).toHaveURL(/\/city$/);
  for (const [path, label] of routes) {
    await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.goto("/office");
  await page.getByRole("link", { name: "직원 상세 보기" }).first().click();
  await expect(page).toHaveURL(/\/agents\/aria$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("아리아");
  await page.goto("/assets/missing");
  await expect(page.getByRole("heading", { name: "건물을 찾을 수 없습니다" })).toBeVisible();
  await page.goto("/unknown");
  await expect(page.getByRole("heading", { name: "아직 없는 도시의 주소입니다" })).toBeVisible();
});

test("invalid stored data is handled without a crash or destructive overwrite", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("online-landlord-os:demo:v1", "broken"));
  await page.goto("/city?view=legacy");
  await expect(page.getByRole("status")).toContainText("형식이 달라");
  await expect(page.getByRole("button", { name: "오빗 노트 건물 선택" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("online-landlord-os:demo:v1"))).toBe("broken");
});

test("blocked storage keeps interactions available and explains the limitation", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("blocked", "SecurityError"); };
  });
  await page.goto("/city?view=legacy");
  await expect(page.getByRole("status")).toContainText("브라우저 저장소를 사용할 수 없습니다");
  await page.getByLabel("데모 건설 단계").selectOption("1");
  await expect(page.getByRole("button", { name: "오빗 노트 건물 선택" }).locator("[data-floor]")).toHaveCount(1);
});

test("mobile layout, keyboard access and list view work without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/city?view=legacy");
  await page.screenshot({ path: testInfo.outputPath("city-mobile.png"), fullPage: true });
  const building = page.getByRole("button", { name: "페이퍼 가든 건물 선택" });
  await building.focus();
  await page.keyboard.press("Enter");
  await expect(building).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "목록 보기" }).click();
  await expect(page.getByRole("button", { name: /페이퍼 가든 웹사이트/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("demo sends no requests to external services", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { const url = new URL(request.url()); if (!["127.0.0.1", "localhost"].includes(url.hostname)) external.push(request.url()); });
  await page.goto("/city?view=legacy");
  await page.getByLabel("데모 건설 단계").selectOption("2");
  await page.getByRole("link", { name: "건물 상세 보기" }).click();
  await expect(page.getByLabel("데모 건설 단계")).toHaveValue("2");
  expect(external).toEqual([]);
});

test("every plot stays selectable when full and registration explains capacity", async ({ page }) => {
  let assets = initialAssets;
  for (const plot of plots.filter(p => !assets.some(a => a.plotId === p.id))) assets = registerAsset(assets, { id: `full-${plot.id}`, name: `건물-${plot.id}`, type: "앱", plotId: plot.id });
  assets = assets.map(a => ({ ...a, stage: 5 }));
  await page.addInitScript(value => localStorage.setItem("online-landlord-os:demo:v1", JSON.stringify({ version: 1, assets: value })), assets);
  await page.goto("/city?view=legacy");
  for (const asset of assets) {
    const building = page.getByRole("button", { name: `${asset.name} 건물 선택` });
    await building.click();
    await expect(building).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("link", { name: "데모 건물 등록", exact: true }).click();
  await expect(page.getByRole("button", { name: "데모 건물 등록" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("모든 데모 부지가 사용 중");
});
