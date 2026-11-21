import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("redirige la raíz y permite cambiar de idioma con metadatos correctos", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/es$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveTitle("Taberna Don Juan");
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://127.0.0.1:3100/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Taberna Don Juan");
  await expect(page.locator('a[href^="https://tabernadonjuan.com"], a[href^="https://www.tabernadonjuan.com"]')).toHaveCount(0);
});

test("el contenido público y la navegación funcionan sin JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Taberna Don Juan");
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await context.close();
});

test("los accesos al panel y al login se han eliminado", async ({ page, request }) => {
  for (const path of ["/admin", "/acceso"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(new URL(response.url()).pathname).toBe(path);
  }
  await page.goto("/es");
  await expect(page.locator('a[href*="/admin"], a[href*="/acceso"]')).toHaveCount(0);
});

for (const path of ["/es", "/en"]) {
  test(`accesibilidad automatizada y ancho móvil: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("el salto de teclado alcanza el contenido principal", async ({ page }) => {
  await page.goto("/es");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("publica sitemap, robots, JSON-LD y preparación PWA", async ({ page, request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("/es</loc>");
  expect(xml).toContain("/en</loc>");
  expect(xml).not.toContain("/admin");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /api/");
  const manifest = await request.get("/manifest.webmanifest");
  expect(await manifest.json()).toMatchObject({ name: "Taberna Don Juan", start_url: "/es" });
  for (const icon of ["/favicon.ico", "/icon.svg", "/icons/favicon-brand.png", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"]) {
    expect((await request.get(icon)).ok()).toBe(true);
  }
  await page.goto("/es");
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(json ?? "{}")).toMatchObject({ "@type": "Restaurant", name: "Taberna Don Juan" });
});

test("devuelve 404 para idiomas no admitidos", async ({ request }) => {
  const response = await request.get("/pt");
  expect(response.status()).toBe(404);
});
