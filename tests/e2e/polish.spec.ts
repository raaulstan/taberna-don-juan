import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const widths = [320, 375, 430, 768, 1024, 1440, 1920];

test("el menú anima ambos sentidos, tolera invertir el cierre y se restablece al cambiar de breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/es");
  const summary = page.locator("[data-mobile-menu] > summary");
  const details = page.locator("[data-mobile-menu]");
  const panel = page.locator("[data-mobile-panel]");
  await summary.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await panel.evaluate((element) => {
    new MutationObserver(() => {
      if ((element as HTMLElement).dataset.state === "closing") document.body.dataset.menuClosingInert = String((element as HTMLElement).inert);
    }).observe(element, { attributes: true, attributeFilter: ["data-state"] });
  });
  await summary.click();
  await expect(details).not.toHaveAttribute("open");
  await expect(page.locator("body")).toHaveAttribute("data-menu-closing-inert", "true");
  expect(await panel.evaluate((element) => (element as HTMLElement).inert)).toBe(false);
  await summary.click();
  await expect(panel).toHaveAttribute("data-state", "open");
  await summary.evaluate((element) => {
    (element as HTMLElement).click();
    (element as HTMLElement).click();
  });
  await expect(panel).toHaveAttribute("data-state", "open");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(details).not.toHaveAttribute("open");
  await page.setViewportSize({ width: 375, height: 900 });
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(panel).toHaveAttribute("data-state", "open");
  await page.keyboard.press("Escape");
  await expect(details).not.toHaveAttribute("open");
  await expect(summary).toBeFocused();
});

test("la salida del diálogo termina antes del desmontaje y devuelve el foco", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/es/carta#categoria-seafood");
  const trigger = page.getByRole("button", { name: "Pulpo a la Brasa", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Pulpo a la Brasa", exact: true });
  await expect(dialog).toBeVisible();
  await page.evaluate(() => {
    document.addEventListener("animationstart", (event) => {
      if (event.animationName === "dialog-content-out") document.body.dataset.dialogExit = "started";
    });
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.locator("body")).toHaveAttribute("data-dialog-exit", "started");
  await expect(trigger).toBeFocused();
  expect(await page.locator("body").evaluate((body) => getComputedStyle(body).pointerEvents)).not.toBe("none");
  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cerrar ficha" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("movimiento reducido desactiva animaciones prolongadas y conserva controles y cierre", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/es");
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running" && Number(animation.effect?.getTiming().duration ?? 0) > 1).length)).toBe(0);
  await page.locator("[data-mobile-menu] > summary").click();
  await expect(page.locator("[data-mobile-panel]")).toHaveAttribute("data-state", "open");
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-mobile-menu]")).not.toHaveAttribute("open");
  await page.goto("/es/carta#producto-sea-menu-pulpo-a-la-brasa");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => parseFloat(getComputedStyle(element).animationDuration))).toBeLessThanOrEqual(0.001);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("searchbox")).toBeFocused();
});

test("la home inglesa y las fichas caben en los siete tamaños sin saltos de ancho", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en");
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto("/es/carta#producto-sea-menu-pulpo-a-la-brasa");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    expect(await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= 8 && rect.right <= window.innerWidth - 8 && rect.top >= 0 && rect.bottom <= window.innerHeight;
    })).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("el menú sigue siendo un disclosure nativo sin JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 700 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/es");
    await page.locator("[data-mobile-menu] > summary").click();
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("open", "");
    await page.locator("[data-mobile-menu]").getByRole("link", { name: "Nuestra carta", exact: true }).click();
    await expect(page).toHaveURL(/\/es\/carta$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Nuestra carta");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  } finally { await context.close(); }
});

test("los controles deshabilitados no se elevan ni cambian la diapositiva", async ({ page }) => {
  await page.goto("/es");
  const previous = page.getByRole("button", { name: "Plato anterior" });
  await expect(previous).toBeDisabled();
  await previous.hover();
  expect(await previous.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  await expect(page.locator('[aria-live="polite"]')).toContainText("1 / 3");
});
