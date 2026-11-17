import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("navbar desktop transparente sobre el hero y sólido con tinta oscura al bajar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es");
  const header = page.locator("header.public-header");
  const menuLink = header.getByRole("link", { name: "Nuestra carta", exact: true });
  await expect(header).toHaveAttribute("data-home", "true");
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "1");
  await expect(header.locator(".brand-logo-dark")).toHaveCSS("opacity", "0");
  await expect(menuLink).toHaveCSS("color", "rgb(244, 228, 200)");
  expect(await header.evaluate((element) => element.getBoundingClientRect().bottom > document.querySelector(".home-hero")!.getBoundingClientRect().top)).toBe(true);

  await page.locator("#especialidades").scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect(header).toHaveCSS("background-color", "rgb(251, 248, 242)");
  await expect(header.locator(".brand-logo-dark")).toHaveCSS("opacity", "1");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "0");
  await expect(menuLink).toHaveCSS("color", "rgb(59, 33, 21)");
  expect(await header.evaluate((element) => Math.abs(element.getBoundingClientRect().top) < 1)).toBe(true);
  expect((await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-scrolled", "false");
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "1");
});

test("las páginas claras mantienen contraste y el menú móvil conserva su fondo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es/carta");
  const header = page.locator("header.public-header");
  await expect(header).toHaveAttribute("data-home", "false");
  await expect(header.locator(".brand-logo-dark")).toHaveCSS("opacity", "1");
  await expect(header.getByRole("link", { name: "Inicio", exact: true })).toHaveCSS("color", "rgb(59, 33, 21)");

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/es");
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "1");
  await header.locator("[data-mobile-menu] > summary").click();
  await expect(header.locator("[data-mobile-panel]")).toHaveAttribute("data-state", "open");
  await expect(header.locator("[data-mobile-panel]")).toHaveCSS("background-color", "rgb(59, 33, 21)");
  await expect(header.locator("[data-mobile-menu]").getByRole("link", { name: "Nuestra carta", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(header.locator("[data-mobile-menu]")).not.toHaveAttribute("open");
});

test("navbar móvil transparente, blanco al bajar y transparente al volver, con menú legible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/es");
  const header = page.locator("header.public-header");
  const logo = header.locator(".brand-adaptive");
  const before = await logo.boundingBox();
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "1");
  await page.locator("#especialidades").scrollIntoViewIfNeeded();
  await expect(header).toHaveCSS("background-color", "rgb(251, 248, 242)");
  await expect(header.locator(".brand-logo-dark")).toHaveCSS("opacity", "1");
  expect(await logo.boundingBox()).toEqual(before);
  await header.locator("[data-mobile-menu] > summary").click();
  const panel = header.locator("[data-mobile-panel]");
  await expect(panel).toHaveAttribute("data-state", "open");
  await expect(panel).toHaveCSS("opacity", "1");
  await expect(panel.getByRole("link", { name: "Contacto", exact: true })).toHaveCSS("color", "rgb(244, 228, 200)");
  expect((await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(header.locator("[data-mobile-menu]")).not.toHaveAttribute("open");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(header.locator(".brand-logo-light")).toHaveCSS("opacity", "1");
});

test("sin JavaScript el navbar conserva una superficie sólida legible", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/es");
    await page.locator("#carta").scrollIntoViewIfNeeded();
    const header = page.locator("header.public-header");
    await expect(header).toHaveCSS("background-color", "rgb(251, 248, 242)");
    await expect(header.getByRole("link", { name: "Nuestra carta", exact: true })).toHaveCSS("color", "rgb(59, 33, 21)");
    await expect(header.locator(".brand-logo-dark")).toHaveCSS("opacity", "1");
  } finally { await context.close(); }
});
