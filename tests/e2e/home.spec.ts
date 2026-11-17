import { expect, test } from "@playwright/test";

test("la navegación sticky alcanza sus secciones y marca la activa", async ({ page, isMobile }) => {
  await page.goto("/es");
  if (isMobile) await page.locator("[data-mobile-menu] > summary").click();
  await page.getByRole("navigation", { name: "Navegación principal", exact: true }).filter({ visible: true }).getByRole("link", { name: "Nuestra historia" }).click();
  await expect(page).toHaveURL(/#historia$/);
  await expect(page.locator("header")).toHaveAttribute("data-scrolled", "true");
  if (isMobile) await page.locator("[data-mobile-menu] > summary").click();
  await expect(page.locator('header a[aria-current="location"]').filter({ visible: true })).toHaveText("Nuestra historia");
  expect(await page.locator("header").evaluate((header) => Math.abs(header.getBoundingClientRect().top) < 1)).toBe(true);
});

test("el menú adaptable admite teclado, Escape y cierra al navegar", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/es");
  const summary = page.locator("[data-mobile-menu] > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  await expect(page.locator("[data-mobile-menu] nav a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-mobile-menu]")).not.toHaveAttribute("open");
  await expect(summary).toBeFocused();
  await summary.click();
  await page.locator("[data-mobile-menu]").getByRole("link", { name: "Contacto", exact: true }).click();
  await expect(page).toHaveURL(/#contacto$/);
  await expect(page.locator("[data-mobile-menu]")).not.toHaveAttribute("open");
});

test("el carrusel sincroniza plato, precio y controles con flechas y teclado", async ({ page }) => {
  await page.goto("/es");
  const carousel = page.getByRole("region", { name: "Selección de platos" });
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel.getByRole("button", { name: "Plato anterior" })).toBeDisabled();
  await carousel.getByRole("button", { name: "Plato siguiente" }).click();
  await expect(carousel.locator('[aria-live="polite"]')).toContainText("2 / 3");
  const rice = carousel.getByRole("group", { name: /2 \/ 3: Arroz señoret/ });
  await expect(rice.getByRole("heading")).toHaveText("Arroz señoret");
  await expect(rice).toContainText("23,00");
  await carousel.locator(".specialties-track").focus();
  await page.keyboard.press("End");
  await expect(carousel.locator('[aria-live="polite"]')).toContainText("3 / 3");
  await expect(carousel.getByRole("button", { name: "Plato siguiente" })).toBeDisabled();
  await expect(carousel.getByRole("group", { name: /3 \/ 3/ })).toContainText("21,50");
  await page.keyboard.press("Home");
  await expect(carousel.locator('[aria-live="polite"]')).toContainText("1 / 3");
});

test("los gestos táctiles desplazan el carrusel", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Gesto táctil de Chromium móvil");
  await page.goto("/es");
  const track = page.locator(".specialties-track");
  await track.scrollIntoViewIfNeeded();
  const box = await track.boundingBox();
  expect(box).not.toBeNull();
  const session = await page.context().newCDPSession(page);
  const x = (box?.x ?? 0) + (box?.width ?? 0) * 0.85;
  const y = (box?.y ?? 0) + 100;
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 8; step++) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - step * 35, y }] });
    await page.waitForTimeout(25);
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator('[aria-live="polite"]')).toContainText("2 / 3");
  await session.detach();
});

test("la home funciona con movimiento reducido y no desborda entre 320 y 1920 px", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/es");
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Plato siguiente" }).click();
  await expect(page.locator('[aria-live="polite"]')).toContainText("2 / 3");
});

test("carga imágenes locales y muestra el contacto contrastado sin enlaces ficticios", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/es");
  const heroAction = page.getByRole("link", { name: "Descubrir nuestra carta", exact: true });
  expect(await heroAction.evaluate((element) => {
    const style = getComputedStyle(element);
    return style.color !== style.backgroundColor;
  })).toBe(true);
  await page.locator("#contacto").scrollIntoViewIfNeeded();
  await expect(page.locator("#contacto")).toContainText("C. Sánchez Pastor, 10");
  await expect(page.locator('#contacto a[href="tel:+34615279494"]')).toBeVisible();
  await expect(page.locator('#contacto a[href="tel:+34952654872"]')).toBeVisible();
  await expect(page.locator('footer a[href*="instagram.com/tabernadonjuan24malagacentro"]')).toHaveCount(1);
  await expect(page.locator('a[href="/reservas"], a[href="#reservas"]')).toHaveCount(0);
  for (const image of await page.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("la ruta de reservas sigue vacía, noindex y excluida del sitemap", async ({ page, request }) => {
  const response = await page.goto("/reservas");
  expect(response?.status()).toBe(200);
  expect((await page.locator("body").innerText()).trim()).toBe("");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/reservas");
});
