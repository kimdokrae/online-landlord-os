import { test, expect } from "@playwright/test";

test("one connected terrain loads locally while buildings remain independent and interactive", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/city?view=legacy");
  const area = page.getByRole("region", { name: "도시 탐색 영역" });
  const terrain = area.locator('img[src="/skycity/garden-terrain.webp"]');
  await expect(terrain).toHaveCount(1);
  expect(await terrain.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 1448)).toBe(true);
  expect(requests.some(url => url.includes("skycity-final-concept.png"))).toBe(false);
  await page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).click();
  await expect(page.getByRole("complementary", { name: "선택한 건물 정보" }).getByRole("heading", { name: "스튜디오 본사" })).toBeVisible();
  await page.getByLabel("데모 건설 단계").selectOption("0");
  await expect(page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).locator("[data-floor]")).toHaveCount(0);
  await page.getByLabel("데모 건설 단계").selectOption("5");
  await expect(page.getByRole("button", { name: "스튜디오 본사 건물 선택" }).locator("[data-floor]")).toHaveCount(5);
  const preview = page.getByRole("complementary", { name: "선택한 건물 정보" });
  await expect(preview.locator('img[src="/skycity/garden-terrain.webp"]')).toBeVisible();
  expect(requests.every(url => ["127.0.0.1", "localhost"].includes(new URL(url).hostname))).toBe(true);
});
