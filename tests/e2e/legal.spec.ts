import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("los documentos explican la web y señalan los datos reales todavía pendientes", async ({ page, context }) => {
  for (const [slug, title] of [["privacidad", "Política de privacidad"], ["cookies", "Política de cookies"], ["aviso-legal", "Aviso legal"]] as const) {
    await page.goto(`/es/legal/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("heading", { name: "Información pendiente de completar", exact: true })).toBeVisible();
    await expect(page.locator(".legal-identity dd[data-pending=true]")).toHaveCount(5);
    await expect(page.locator(".legal-document")).toContainText("C. Sánchez Pastor, 10");
    await expect(page.locator(".legal-document")).not.toContainText("webtabernadonjuan@gmail.com");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(await context.cookies()).toEqual([]);
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
