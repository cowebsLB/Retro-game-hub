import { expect, test } from "@playwright/test";

test("loads the catalog, filters, and opens the local game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /playable retro picks/i })).toBeVisible();
  await page.getByPlaceholder("Search by title, era, tag, or player mode").fill("meteor");
  await expect(page.getByRole("link", { name: /play neon meteor run/i })).toBeVisible();
  await page.getByRole("link", { name: /play neon meteor run/i }).click();
  await expect(page.locator("h1", { hasText: "Neon Meteor Run" })).toBeVisible();
  await expect(page.getByLabel("Local game arena")).toBeVisible();
});

test("supports direct custom game routes", async ({ page }) => {
  await page.goto("/#/game/memory-vault-84");
  await expect(page.getByRole("heading", { name: /memory vault 84/i })).toBeVisible();
  await expect(page.getByLabel(/memory vault 84 puzzle grid/i)).toBeVisible();
  await page.getByRole("button", { name: /^Hidden vault card 1$/i }).click();
  await expect(page.getByLabel(/glyph/i)).toBeVisible();
});

test("supports the pixel breach direct route", async ({ page }) => {
  await page.goto("/#/game/pixel-breach");
  await expect(page.getByRole("heading", { name: /pixel breach/i })).toBeVisible();
  await expect(page.getByLabel(/pixel breach game arena/i)).toBeVisible();
  await expect(page.getByText(/combat systems/i)).toBeVisible();
});

test("supports gesture-first mobile controls without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/#/game/neon-meteor-run");
  await expect(page.getByText(/drag the ship in the playfield/i)).toBeVisible();
  const meteorCanvas = page.getByLabel(/neon meteor run local game arena/i);
  const meteorBounds = await meteorCanvas.boundingBox();
  expect(meteorBounds).not.toBeNull();
  await page.mouse.move(meteorBounds!.x + meteorBounds!.width * 0.5, meteorBounds!.y + meteorBounds!.height * 0.75);
  await page.mouse.down();
  await page.mouse.move(meteorBounds!.x + meteorBounds!.width * 0.25, meteorBounds!.y + meteorBounds!.height * 0.55, { steps: 4 });
  await page.mouse.up();
  await testInfo.attach("neon-meteor-mobile", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  await page.goto("/#/game/skyline-sprint-gx");
  await expect(page.getByText(/swipe or tap lanes/i)).toBeVisible();
  const skylineCanvas = page.getByLabel(/skyline sprint gx playfield/i);
  const skylineBounds = await skylineCanvas.boundingBox();
  expect(skylineBounds).not.toBeNull();
  await skylineCanvas.dispatchEvent("pointerdown", {
    bubbles: true,
    buttons: 1,
    clientX: skylineBounds!.x + skylineBounds!.width * 0.5,
    clientY: skylineBounds!.y + skylineBounds!.height * 0.7,
    pointerId: 7,
    pointerType: "touch",
  });
  await skylineCanvas.dispatchEvent("pointerup", {
    bubbles: true,
    buttons: 0,
    clientX: skylineBounds!.x + skylineBounds!.width * 0.25,
    clientY: skylineBounds!.y + skylineBounds!.height * 0.7,
    pointerId: 7,
    pointerType: "touch",
  });
  await expect(page.getByText("Lane 1/3")).toBeVisible();
  await testInfo.attach("skyline-sprint-mobile", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  await page.goto("/#/game/pixel-breach");
  await expect(page.getByText(/press and drag to move \+ auto-fire/i)).toBeVisible();
  const breachCanvas = page.getByLabel(/pixel breach game arena/i);
  const breachBounds = await breachCanvas.boundingBox();
  expect(breachBounds).not.toBeNull();
  await page.mouse.move(breachBounds!.x + breachBounds!.width * 0.5, breachBounds!.y + breachBounds!.height * 0.85);
  await page.mouse.down();
  await page.mouse.move(breachBounds!.x + breachBounds!.width * 0.8, breachBounds!.y + breachBounds!.height * 0.85, { steps: 4 });
  await page.waitForTimeout(200);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await testInfo.attach("pixel-breach-mobile", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
});
