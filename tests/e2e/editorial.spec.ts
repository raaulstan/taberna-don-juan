import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("el hero conserva el contacto verificado y lo comparte con contacto y footer", async ({ page }) => {
  await page.goto("/es");
  const quick = page.getByRole("group", { name: "Contacto rápido del restaurante" });
  await expect(quick.locator('a[href="tel:+34615279494"]')).toContainText("+34 615 279 494");
  await expect(quick).toContainText("C. Sánchez Pastor, 10");
  await expect(quick.getByRole("link").nth(1)).toHaveAttribute("href", /google.com\/maps\/search/);
  await expect(page.locator('#contacto a[href="tel:+34615279494"]')).toHaveCount(1);
  await expect(page.locator('footer a[href="tel:+34615279494"]')).toHaveCount(1);
  await expect(page.getByText("+34 648 02 59 68", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Calle Calderón de la Barca, 2", { exact: true })).toHaveCount(0);
  await expect(page.locator(".category-card").filter({ hasText: /Fotografía pendiente|Imagen de ambientación/ })).toHaveCount(0);
  await expect(page.locator('.specialty-media img[src*="tapas.webp"]')).toHaveCount(0);
});

test("los dos modos conservan los 92 productos, precio, filtros y accesibilidad", async ({ page }) => {
  await page.goto("/es/carta");
  const compact = page.getByRole("button", { name: "Vista compacta", exact: true });
  const visual = page.getByRole("button", { name: "Vista visual", exact: true });
  await expect(compact).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".menu-products > li")).toHaveCount(92);
  await expect(page.locator(".menu-entry-media")).toHaveCount(0);
  const names = await page.locator(".menu-entry h3").allTextContents();
  await visual.click();
  await expect(visual).toHaveAttribute("aria-pressed", "true");
  expect(await page.locator(".menu-entry h3").allTextContents()).toEqual(names);
  await expect(page.locator(".menu-products > li")).toHaveCount(92);
  await page.getByRole("searchbox").fill("PUCHÉRO");
  await expect(page.getByRole("status")).toHaveText("2 productos encontrados");
  await compact.click();
  await expect(page.getByRole("searchbox")).toHaveValue("PUCHÉRO");
  await page.getByRole("button", { name: "Croquetas de Puchero", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Croquetas de Puchero", exact: true });
  await expect(dialog).toContainText("3,50");
  await expect(dialog.locator(".product-picture")).toHaveCount(1);
  await expect(dialog.getByRole("img", { name: "Espacio para fotografía", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
  await visual.click();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
});

test("ambos modos y el contacto rápido se adaptan a los siete anchos", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto("/en/carta");
  for (const name of ["Compact view", "Visual view"]) {
    await page.getByRole("button", { name, exact: true }).click();
    for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await expect(page.locator(".menu-products > li")).toHaveCount(92);
  }
});

test("la presentación conserva espacios de foto sin imágenes ni notas provisionales", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator(".media-placeholder")).toHaveCount(6);
  await expect(page.locator(".home-hero .media-placeholder, .hero-media-slot")).toHaveCount(0);
  await expect(page.locator(".hero-photo-label")).toHaveText("Espacio para fotografía");
  await expect(page.locator(".home-hero img, .category-card img, .story-photo img")).toHaveCount(0);
  await expect(page.locator(".hero-side-note, .media-note, .hero-media-caption")).toHaveCount(0);
  await expect(page.locator("#contacto").getByRole("heading", { name: "Horario", exact: true })).toBeVisible();
  const provisional = /Ambientación visual temporal|Sobre nuestras imágenes|Recurso ambiental temporal|Precios publicados en la web oficial|textos pendientes de facilitar por la propiedad/;
  expect(await page.locator("body").innerText()).not.toMatch(provisional);
  for (const path of ["/es/carta", "/es/bebidas"]) {
    await page.goto(path);
    await expect(page.locator(".menu-source")).toHaveCount(0);
    expect(await page.locator("main").innerText()).not.toMatch(/Datos transcritos|La fuente no publica|Se conservan los nombres y descripciones/);
  }
});

test("móvil y fijo mantienen filas separadas en todos los tamaños", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  const mobile = page.locator('.contact-phone-list a[href="tel:+34615279494"]');
  const landline = page.locator('.contact-phone-list a[href="tel:+34952654872"]');
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const first = await mobile.boundingBox();
    const second = await landline.boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
    expect(second!.x + second!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
