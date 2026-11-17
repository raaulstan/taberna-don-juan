import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("el selector de seis idiomas admite teclado, Escape y conserva ruta y categoría", async ({ page }) => {
  await page.goto("/es/bebidas#categoria-drinks-gin");
  const details = page.locator("[data-language-switcher]");
  const summary = details.locator("summary");
  await summary.focus();
  await page.keyboard.press("ArrowDown");
  await expect(details.getByRole("link", { name: "Español", exact: true })).toBeFocused();
  await expect(details.getByRole("link")).toHaveCount(6);
  await page.keyboard.press("End");
  await expect(details.getByRole("link", { name: "Deutsch", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(details).not.toHaveAttribute("open");
  await expect(summary).toBeFocused();
  await summary.click();
  expect((await new AxeBuilder({ page }).include("header").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  await details.getByRole("link", { name: "Français", exact: true }).click();
  await expect(page).toHaveURL(/\/fr\/bebidas#categoria-drinks-gin$/);
  await expect(page.getByRole("status")).toHaveText("23 produits trouvés");
  await expect(page.getByRole("button", { name: "Gins", exact: true })).toHaveAttribute("aria-pressed", "true");
  await summary.click();
  await page.mouse.click(8, 600);
  await expect(details).not.toHaveAttribute("open");
});

const translations = [
  { locale: "fr", title: "Boissons", tagline: "Des saveurs familières. Des instants à savourer.", menu: "La carte", privacy: "Informations sur la confidentialité" },
  { locale: "ro", title: "Băuturi", tagline: "Arome familiare. Momente de savurat.", menu: "Meniul nostru", privacy: "Informații privind confidențialitatea" },
  { locale: "it", title: "Bevande", tagline: "I sapori di sempre. Momenti da assaporare.", menu: "Il menù", privacy: "Informazioni sulla privacy" },
  { locale: "de", title: "Getränke", tagline: "Vertraute Aromen. Momente zum Genießen.", menu: "Unsere Speisekarte", privacy: "Informationen zum Datenschutz" },
] as const;

for (const language of translations) {
  test(`páginas traducidas, metadata, responsive y enlaces actuales: ${language.locale}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${language.locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", language.locale);
    await expect(page.locator(".hero-tagline")).toHaveText(language.tagline);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(7);
    for (const width of [320, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.goto(`/${language.locale}/carta`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(language.menu);
    await expect(page.locator(".menu-products > li")).toHaveCount(92);
    await page.getByRole("button", { name: "Croquetas de Puchero", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator('a[href*="tabernadonjuan.com"]')).toHaveCount(0);
    await page.keyboard.press("Escape");
    await page.goto(`/${language.locale}/bebidas`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(language.title);
    await expect(page.locator(".menu-products > li")).toHaveCount(134);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `http://127.0.0.1:3100/${language.locale}/bebidas`);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.setViewportSize({ width: 320, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.goto(`/${language.locale}/legal/privacidad`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(language.privacy);
  });
}

test("el selector funciona sin JavaScript y los seis idiomas figuran en sitemap", async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/es/bebidas");
    await page.locator("[data-language-switcher] > summary").click();
    await page.getByRole("link", { name: "Română", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Băuturi");
    await expect(page.locator(".menu-products > li")).toHaveCount(134);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const locale of ["es", "en", "fr", "ro", "it", "de"]) expect(sitemap).toContain(`/${locale}/bebidas</loc>`);
  } finally { await context.close(); }
});

test("el navbar anima el fondo en ambos sentidos sin cambiar el tamaño del logo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/es");
  const header = page.locator("header.public-header");
  const logo = header.locator(".brand-adaptive");
  const before = await logo.boundingBox();
  expect(await header.evaluate((element) => getComputedStyle(element).transitionProperty)).toContain("background-color");
  expect(await header.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeGreaterThan(0);
  await page.locator("#especialidades").scrollIntoViewIfNeeded();
  await expect(header).toHaveCSS("background-color", "rgb(251, 248, 242)");
  expect(await logo.boundingBox()).toEqual(before);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  expect(await logo.boundingBox()).toEqual(before);
});
