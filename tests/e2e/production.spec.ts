import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("contacto y metadata social están disponibles sin rastreadores", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("link", { name: "Obtener indicaciones", exact: true })).toHaveAttribute("href", /https:\/\/www.google.com\/maps\/dir\/\?api=1&destination=/);
  await expect(page.locator("footer address")).toContainText("Sánchez Pastor");
  await expect(page.locator("footer")).toContainText(`© ${new Date().getFullYear()}`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  expect(await page.locator('script[src*="googletagmanager"], script[src*="facebook.net"], iframe').count()).toBe(0);
  await expect(page.locator('footer a[href*="/legal/"]')).toHaveCount(0);
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Taberna Don Juan");
});

test("las antiguas rutas administrativas ya no existen", async ({ request }) => {
  for (const path of ["/admin/carta", "/admin/categorias", "/admin/contenido", "/admin/empleados", "/admin/auditoria", "/admin/cuenta", "/admin/estadisticas"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(new URL(response.url()).pathname).toBe(path);
  }
});

test("la web pública no instala la PWA privada ni crea sesiones", async ({ page, request, context }) => {
  for (const path of ["/admin/manifest.webmanifest", "/admin/sw.js", "/admin/offline.html"]) expect((await request.get(path)).status()).toBe(404);
  await page.goto("/es");
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
  expect(await context.cookies()).toEqual([]);
});

test("health no expone variables ni detalles de proveedores", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(response.headers()["cache-control"]).toBe("no-store");
});

test("la identidad utiliza el logotipo original sin filtros de color ni deformación", async ({ page, request }) => {
  await page.goto("/es");
  const logo = page.locator('header img[alt="Taberna Don Juan"]');
  await expect(logo).toHaveCount(1);
  await expect(logo).toHaveAttribute("src", /logo-oficial/);
  expect(await logo.evaluate((image) => getComputedStyle(image).filter)).toBe("none");
  await expect.poll(() => logo.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  const metadata = await (await request.get("/images/logo-oficial.meta.json")).json() as { width: number; height: number };
  const ratio = await logo.evaluate((image) => { const rect = image.getBoundingClientRect(); return rect.width / rect.height; });
  expect(ratio).toBeCloseTo(metadata.width / metadata.height, 2);
  await expect(page.locator('footer img[alt="Taberna Don Juan"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.ico?v=brand-2");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const response = await request.get(og!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
  const transparent = await request.get("/images/logo-oficial-transparente.png");
  const { data, info } = await sharp(await transparent.body()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  expect(info.width / info.height).toBeCloseTo(metadata.width / metadata.height, 3);
  expect([data[3], data[(info.width - 1) * 4 + 3], data[(info.width * (info.height - 1)) * 4 + 3], data[data.length - 1]]).toEqual([0, 0, 0, 0]);
  const visiblePixels = data.filter((_, index) => index % 4 === 3 && data[index]! > 0).length;
  expect(visiblePixels).toBeGreaterThan(100);
  expect(visiblePixels / (info.width * info.height)).toBeLessThan(0.6);
});
