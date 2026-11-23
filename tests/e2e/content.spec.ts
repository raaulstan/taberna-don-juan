import { expect, test } from "@playwright/test";

test("los documentos y enlaces legales se han retirado de los seis idiomas", async ({ page, request }) => {
  for (const locale of ["es", "en", "fr", "ro", "it", "de"]) {
    for (const slug of ["privacidad", "cookies", "aviso-legal"]) expect((await request.get(`/${locale}/legal/${slug}`)).status()).toBe(404);
  }
  await page.goto("/es");
  await expect(page.locator('a[href*="/legal/"]')).toHaveCount(0);
  await expect(page.locator("footer").getByRole("heading", { name: "Información legal", exact: true })).toHaveCount(0);
  await expect(page.locator("footer > .site-container > *")).toHaveCount(3);
});

test("las tarjetas limitan la lectura y la ficha muestra la descripción ampliada", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/es/carta");
  await page.getByRole("searchbox").fill("puchero");
  const card = page.locator(".menu-entry").filter({ has: page.getByRole("button", { name: "Croquetas de Puchero", exact: true }) });
  const description = card.locator(".menu-entry-description");
  expect(await description.evaluate((element) => getComputedStyle(element).webkitLineClamp)).toBe("2");
  await expect(description).toContainText("Un bocado de cocina de siempre");
  await card.getByRole("button", { name: "Croquetas de Puchero", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Croquetas de Puchero", exact: true });
  await expect(dialog).toContainText("Un bocado de cocina de siempre para empezar a disfrutar de la mesa.");
  await expect(dialog.getByRole("heading", { name: "Ingredientes", exact: true })).toHaveCount(0);
});
