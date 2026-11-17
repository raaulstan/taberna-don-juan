import { expect, test } from "@playwright/test";
import sharp from "sharp";

test("contacto, enlaces legales y metadata social están disponibles sin rastreadores", async ({ page }) => {
  await page.goto("/es");
  await expect(page.getByRole("link", { name: "Obtener indicaciones", exact: true })).toHaveAttribute("href", /https:\/\/www.google.com\/maps\/dir\/\?api=1&destination=/);
  await expect(page.locator("footer address")).toContainText("Sánchez Pastor");
  await expect(page.locator("footer")).toContainText(`© ${new Date().getFullYear()}`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  expect(await page.locator('script[src*="googletagmanager"], script[src*="facebook.net"], iframe').count()).toBe(0);
  await page.locator("footer").getByRole("link", { name: "Privacidad", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Información de privacidad");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy information");
});

test("el panel sigue cerrado sin configuración, con headers privados en todas sus rutas", async ({ page, request }) => {
  for (const path of ["/admin/carta", "/admin/contenido", "/admin/empleados", "/admin/auditoria"]) {
    const response = await request.get(path);
    expect(response.url()).toContain("/acceso?motivo=configuracion");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
  }
  await page.goto("/acceso");
  await expect(page.getByText("No hay acceso de demostración.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar al panel" })).toHaveCount(0);
});

test("manifest privado, shell offline y caché no personal de la PWA", async ({ page, request, context }) => {
  const manifest = await request.get("/admin/manifest.webmanifest");
  expect(await manifest.json()).toMatchObject({ start_url: "/admin", scope: "/admin", display: "standalone", icons: expect.arrayContaining([expect.objectContaining({ purpose: "maskable" })]) });
  await page.goto("/es");
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin" });
    const worker = registration.installing ?? registration.waiting ?? registration.active;
    if (worker && worker.state !== "activated") await new Promise<void>((resolve, reject) => worker.addEventListener("statechange", () => { if (worker.state === "activated") resolve(); if (worker.state === "redundant") reject(new Error("service worker installation failed")); }));
  });
  const cached = await page.evaluate(async () => { const keys = await caches.keys(); return (await Promise.all(keys.map(async (key) => (await (await caches.open(key)).keys()).map((request) => new URL(request.url).pathname)))).flat(); });
  expect(cached.sort()).toEqual(["/admin/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"].sort());
  await context.setOffline(true);
  const offline = await page.goto("/admin");
  expect(offline?.status()).toBe(503);
  await expect(page.getByRole("heading", { name: "Necesitas conexión" })).toBeVisible();
  await expect(page.locator("input, form, table")).toHaveCount(0);
  await expect.poll(() => page.locator('img[alt="Taberna Don Juan"]').evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.controller?.postMessage({ type: "LOGOUT" }));
  await expect.poll(() => page.evaluate(async () => (await caches.keys()).filter((key) => key.startsWith("tdj-admin-shell-")).length)).toBe(0);
  await context.setOffline(false);
  await page.goto("/es");
  expect(await page.evaluate(() => navigator.serviceWorker.controller)).toBeNull();
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
