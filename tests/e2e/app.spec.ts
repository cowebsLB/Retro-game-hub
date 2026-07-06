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

test("supports direct game routes and external embed actions", async ({ page }) => {
  await page.goto("/#/game/oregon-trail-archive");
  await expect(page.getByRole("heading", { name: /oregon trail archive/i })).toBeVisible();
  await expect(page.getByTitle(/oregon trail archive embedded game/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /open in a new tab/i }).first()).toBeVisible();
});
