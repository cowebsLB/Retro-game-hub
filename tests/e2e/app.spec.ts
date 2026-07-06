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
