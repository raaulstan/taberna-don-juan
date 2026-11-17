import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("combina búsqueda sin acentos, categoría, sección y estado vacío", async ({ page }) => {
  await page.goto("/es/carta");
  const results = page.getByRole("status");
  const search = page.getByRole("searchbox", { name: "Buscar en la carta" });
  await expect(results).toHaveText("92 productos encontrados");
  await search.fill("PUCHÉRO");
  await expect(results).toHaveText("2 productos encontrados");
  await page.getByRole("button", { name: "Tapas y entrantes", exact: true }).click();
  await page.getByLabel("Sección", { exact: true }).selectOption("tapas-small");
  await expect(results).toHaveText("1 producto encontrado");
  await expect(page.getByRole("button", { name: "Croquetas de Puchero", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Limpiar búsqueda" }).click();
  await expect(results).toHaveText("23 productos encontrados");
  await search.fill("producto que no existe");
  await expect(results).toHaveText("0 productos encontrados");
  await page.getByRole("button", { name: "Restablecer filtros" }).click();
  await expect(results).toHaveText("92 productos encontrados");
  await expect(search).toBeFocused();
});

test("la ficha conserva información desconocida, atrapa foco y lo devuelve al producto", async ({ page }) => {
  await page.goto("/es/carta#categoria-seafood");
  await expect(page.getByRole("status")).toHaveText("16 productos encontrados");
  const trigger = page.getByRole("button", { name: "Pulpo a la Brasa", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Pulpo a la Brasa", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Pulpo a la Brasa", exact: true })).toBeFocused();
  await expect(dialog).toContainText("21,50");
  await expect(dialog).toContainText("Moluscos");
  await expect(dialog).toContainText("Lácteos");
  await expect(dialog.getByRole("heading", { name: "Ingredientes", exact: true })).toHaveCount(0);
  await expect(dialog.getByText("Consultar disponibilidad", { exact: true })).toHaveCount(0);
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Cerrar ficha" }).click();
  await expect(trigger).toBeFocused();
});

test("abre productos enlazados desde la home y reutiliza el carrusel con indicadores", async ({ page }) => {
  await page.goto("/es/carta#producto-tapas-small-croquetas-de-puchero");
  await expect(page.getByRole("dialog", { name: "Croquetas de Puchero", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByText("Descubrir la selección de la casa", { exact: false }).click();
  const carousel = page.getByRole("region", { name: "Selección de platos", exact: true });
  await carousel.getByRole("button", { name: /^3: Pulpo a la Brasa/ }).click();
  await expect(carousel.locator('[aria-live="polite"]')).toContainText("3 / 3");
  await carousel.getByRole("group", { name: "3 / 3: Pulpo a la Brasa", exact: true }).getByRole("button", { name: "Ver ficha" }).click();
  await expect(page.getByRole("dialog", { name: "Pulpo a la Brasa", exact: true })).toBeVisible();
});

test("bebidas publica las seis categorías con sus precios y filtros sin productos ficticios", async ({ page }) => {
  await page.goto("/es/bebidas");
  await expect(page.getByRole("status")).toHaveText("134 productos encontrados");
  await expect(page.locator(".menu-products > li")).toHaveCount(134);
  await expect(page.locator(".menu-category-scroll button")).toHaveCount(7);
  await expect(page.getByText(/No hay bebidas publicadas/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Ejemplo de vino", exact: true })).toHaveCount(0);
  await expect(page.getByText("Mostrar demostración de búsqueda, filtros y fichas", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Consultar por teléfono", exact: true })).toHaveAttribute("href", "tel:+34615279494");
  await page.getByRole("button", { name: "Ginebras", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("23 productos encontrados");
  const search = page.getByRole("searchbox", { name: "Buscar en la carta" });
  await search.fill("hendrick");
  await expect(page.getByRole("status")).toHaveText("1 producto encontrado");
  const trigger = page.getByRole("button", { name: "Hendrick’s", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Hendrick’s", exact: true });
  await expect(dialog).toContainText("12,00");
  await expect(dialog.getByRole("heading", { name: "Descripción", exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("heading", { name: "Ingredientes", exact: true })).toHaveCount(0);
  await expect(dialog.getByText("Alérgenos: información pendiente", { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole("link", { name: "Consultar fuente oficial" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Restablecer filtros" }).click();
  await page.getByRole("button", { name: "Licores", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("34 productos encontrados");
  await expect(page.getByRole("button", { name: "Pernod", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Grand Marnier Amarillo", exact: true })).toHaveCount(1);
});

test("bebidas conserva la ruta en inglés y permite buscar sin acentos en ambas vistas", async ({ page }) => {
  await page.goto("/es/bebidas");
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/bebidas$/);
  await expect(page).toHaveTitle("Drinks | Taberna Don Juan");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://127.0.0.1:3100/en/bebidas");
  await page.getByRole("button", { name: "Coffee and tea", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("20 products found");
  await page.getByRole("searchbox", { name: "Search the menu" }).fill("CAFE BOMBON");
  await expect(page.getByRole("status")).toHaveText("1 product found");
  await page.getByRole("button", { name: "Visual view", exact: true }).click();
  await expect(page.locator('.menu-products[data-view="visual"] > li')).toHaveCount(1);
  await expect(page.locator(".menu-entry-price")).toHaveText("€2.70");
  await page.getByRole("button", { name: "Compact view", exact: true }).click();
  await expect(page.locator(".menu-entry-media")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Café bombón", exact: true })).toBeVisible();
});

test("la carta mantiene el idioma de ruta y metadatos propios", async ({ page, request }) => {
  await page.goto("/es/carta");
  await page.locator("[data-language-switcher] > summary").click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/carta$/);
  await expect(page).toHaveTitle("Our menu | Taberna Don Juan");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://127.0.0.1:3100/en/carta");
  await expect(page.getByRole("searchbox", { name: "Search the menu" })).toBeVisible();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/es/carta</loc>");
  expect(sitemap).toContain("/en/bebidas</loc>");
  expect(sitemap).not.toContain("/reservas");
});

test("los productos siguen siendo legibles sin JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/es/carta");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nuestra carta");
    await expect(page.getByRole("button", { name: "Croquetas de Puchero", exact: true })).toBeVisible();
    await expect(page.locator(".menu-products > li")).toHaveCount(92);
    // El motor getByText de Playwright omite los nodos noscript por diseño.
    await expect(page.locator("main noscript")).toBeVisible();
    expect(await page.locator("main noscript").textContent()).toContain("La carta se puede leer sin JavaScript.");
    await page.goto("http://127.0.0.1:3100/es/bebidas");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bebidas");
    await expect(page.locator(".menu-products > li")).toHaveCount(134);
    await expect(page.getByRole("button", { name: "Caña", exact: true })).toBeVisible();
    await expect(page.locator(".menu-entry").filter({ has: page.getByRole("button", { name: "Johnnie Walker Premier", exact: true }) }).locator(".menu-entry-price")).toContainText("100,00");
  } finally { await context.close(); }
});

for (const path of ["/es/carta", "/en/carta", "/es/bebidas", "/en/bebidas"]) {
  test(`accesibilidad y responsive de catálogo: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });
}
