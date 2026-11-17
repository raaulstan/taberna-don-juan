import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`el carrusel hidrata sin diferencias y mantiene sus controles: ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat|server rendered|didn't match|Minified React error #(418|425)/i.test(message.text())) errors.push(message.text());
    });
    for (const path of ["/es", "/en", "/es/carta"]) {
      await page.goto(path);
      if (path.endsWith("/carta")) await page.locator(".menu-specialties > summary").click();
      const carousel = page.locator(".specialty-editorial");
      await carousel.scrollIntoViewIfNeeded();
      const controls = carousel.locator("button[aria-label]").filter({ has: page.locator("svg") });
      const next = controls.last();
      await expect(next).toHaveAttribute("tabindex", "0");
      await next.click();
      await expect(carousel.locator('[aria-live="polite"]')).toContainText("2 / 3");
      await carousel.locator(".specialties-track").focus();
      await page.keyboard.press("Home");
      await expect(carousel.locator('[aria-live="polite"]')).toContainText("1 / 3");
    }
    expect(errors).toEqual([]);
  });
}
