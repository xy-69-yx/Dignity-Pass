import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("pages have no detected WCAG A/AA violations", async ({ page }) => {
  for (const route of [
    "/",
    "/campaign",
    "/issue",
    "/redeem",
    "/activity",
    "/settings",
    "/how-it-works",
    "/privacy",
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations, route).toEqual([]);
  }
});
test("landing has real navigation and responsive layout", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Support should",
  );
  await expect(
    page.getByRole("link", { name: "Open campaign", exact: true }),
  ).toHaveAttribute("href", "/campaign");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/landing-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("campaign reads real public state and exposes authorization limitation", async ({
  page,
}) => {
  await page.goto("/campaign");
  await expect(
    page.getByText("Agency authorization needs attention."),
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByText("Confirmed commitments", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".contract-address code")).toHaveText(
    "5570671a6de0afd29a9252b15ade1645000e220d12fb9c74dfa0c46f9a3d7480",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/campaign-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("failed indexer reads never produce sample counts", async ({ page }) => {
  await page.route("**/api/campaign", (route) =>
    route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "Indexer unavailable for test" }),
    }),
  );
  await page.goto("/campaign");
  await expect(
    page.getByRole("alert").filter({ hasText: "Indexer unavailable for test" }),
  ).toContainText("Indexer unavailable for test");
  await expect(page.locator(".metrics")).toHaveCount(0);
});
test("redeem rejects invalid pass and never uploads secret input", async ({
  page,
}) => {
  const bodies: string[] = [];
  page.on("request", (request) => {
    const body = request.postData();
    if (body) bodies.push(body);
  });
  await page.goto("/redeem");
  await page
    .getByLabel("Or paste pass JSON")
    .fill("private-input-invalid-json");
  await page.getByRole("button", { name: "Check pass on Midnight" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "original Dignity Pass JSON file" }),
  ).toBeVisible({ timeout: 30000 });
  expect(
    bodies.some((body) => body.includes("private-input-invalid-json")),
  ).toBe(false);
  await expect(
    page.getByRole("button", { name: "Redeem on Midnight" }),
  ).toHaveCount(0);
});
test("missing wallet yields explicit error", async ({ page }) => {
  await page.goto("/issue");
  await expect(
    page.getByRole("button", { name: "Prepare private pass" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Connect 1AM" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "1AM wallet not detected" }),
  ).toBeVisible({ timeout: 12000 });
});
test("all workspace and guide pages render with no horizontal overflow", async ({
  page,
}) => {
  for (const route of [
    "/issue",
    "/redeem",
    "/activity",
    "/settings",
    "/how-it-works",
    "/privacy",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
  }
});
test("credentials generated locally are downloadable but not presented as authorized", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Generate locally" }).click();
  await expect(
    page.getByRole("button", { name: "Download private credentials" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download private credentials" })
    .click();
  expect((await downloadPromise).suggestedFilename()).toBe(
    "dignity-pass-agency-private.json",
  );
  await expect(
    page.getByText("They cannot authorize or change the current contract.", {
      exact: false,
    }),
  ).toBeVisible();
});
