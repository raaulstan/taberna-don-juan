import { expect, test, type Page } from "@playwright/test";
import sharp from "sharp";
import AxeBuilder from "@axe-core/playwright";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && /hydration|minified react error/i.test(message.text())) errors.push(message.text()); });
});
test.afterEach(({ page }) => { expect(browserErrors.get(page)).toEqual([]); });

// Credenciales exclusivas del proveedor HTTPS de pruebas, no cuentas reales.
async function login(page: Page, email: string, password = "Fixture-password-2026!") {
  await page.goto("/acceso");
  await page.getByLabel("Correo del equipo").filter({ visible: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).filter({ visible: true }).fill(password);
  await page.getByRole("button", { name: "Entrar al panel" }).click();
}

test("Auth rechaza cuentas sin rol y permite un camarero sin privilegios de gestión", async ({ page }) => {
  await login(page, "outsider@example.test");
  await expect(page.getByRole("alert").filter({ hasText: "Credenciales no válidas o acceso no autorizado" })).toBeVisible();
  await login(page, "waiter@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByText("No hay módulos operativos habilitados", { exact: false }).filter({ visible: true })).toBeVisible();
  await page.goto("/admin/carta");
  await expect(page).toHaveURL(/\/admin\?aviso=permisos$/);
  await expect(page.getByRole("link", { name: "Productos y bebidas", exact: true })).toHaveCount(0);
});

test("propietario crea, edita, sube una fotografía y borra con auditoría y restricciones", async ({ page }) => {
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  const sessionCookies = (await page.context().cookies()).filter((cookie) => cookie.name.includes("auth-token"));
  expect(sessionCookies.length).toBeGreaterThan(0);
  expect(sessionCookies.every((cookie) => cookie.httpOnly && cookie.secure && cookie.sameSite === "Lax")).toBe(true);
  expect(await page.evaluate(() => document.cookie)).not.toContain("auth-token");
  await page.goto("/admin/categorias/nuevo");
  await page.getByLabel("Nombre en español", { exact: true }).filter({ visible: true }).fill("Categoría E2E");
  await page.getByLabel("Identificador público", { exact: true }).filter({ visible: true }).fill("e2e-category");
  await page.getByRole("button", { name: "Guardar categoría" }).click();
  await expect(page.getByRole("status")).toContainText("Categoría guardada");
  await page.goto("/admin/carta/nuevo");
  await page.getByLabel("Nombre en español", { exact: true }).filter({ visible: true }).fill("Producto E2E");
  await page.getByRole("combobox", { name: "Categoría", exact: true }).selectOption({ label: "Gastronomía · Categoría E2E" });
  await page.getByLabel("Precio (€)", { exact: true }).filter({ visible: true }).fill("13,90");
  const photo = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#D5A65E" } }).png().toBuffer();
  await page.getByLabel("Subir fotografía pública", { exact: true }).filter({ visible: true }).setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: photo });
  await expect(page.getByLabel("Ruta de fotografía asociada", { exact: true }).filter({ visible: true })).toHaveValue(/\.webp$/);
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("status")).toContainText("Producto guardado");
  await expect(page).toHaveURL(/\/admin\/carta\/[0-9a-f-]+$/);
  await page.getByLabel("Precio (€)", { exact: true }).filter({ visible: true }).fill("15,25");
  await page.getByRole("button", { name: "Guardar producto" }).click();
  await expect(page.getByRole("status")).toContainText("Producto guardado");
  await page.goto("/admin/categorias");
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("hay otros registros");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.goto("/admin/carta");
  await expect(page.getByText("15,25", { exact: false }).filter({ visible: true })).toBeVisible();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar eliminación" }).click();
  await expect(page.getByText("No hay productos guardados.", { exact: false }).filter({ visible: true })).toBeVisible();
  await page.goto("/admin/auditoria");
  await expect(page.getByText("DELETE · admin_records", { exact: true }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByText("UPLOAD · media", { exact: true }).filter({ visible: true })).toHaveCount(1);
});

test("el panel y sus formularios caben en tablet y móvil y deshabilitan escritura offline", async ({ page, context }) => {
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/admin/manifest.webmanifest");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  const cdp = await context.newCDPSession(page);
  expect((await cdp.send("Page.getAppManifest")).errors).toEqual([]);
  expect((await cdp.send("Page.getInstallabilityErrors")).installabilityErrors).toEqual([]);
  await cdp.detach();
  await page.goto("/admin/carta/nuevo");
  for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await context.setOffline(true);
  await expect(page.getByRole("button", { name: "Guardar producto", exact: true })).toBeDisabled();
  await expect(page.getByRole("alert").filter({ hasText: "Necesitas conexión" })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/acceso$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/acceso(\?motivo=sesion)?$/);
  await expect(page.getByRole("heading", { name: "Resumen", exact: true })).toHaveCount(0);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/acceso\?motivo=sesion$/);
});

test("solo el propietario administra accesos; desactivar impide el siguiente login", async ({ page, browser }) => {
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/empleados");
  const waiter = page.getByRole("listitem").filter({ hasText: "Waiter test" });
  await waiter.getByRole("checkbox", { name: "Acceso activo", exact: true }).uncheck();
  await waiter.getByRole("button", { name: "Revisar cambios de acceso" }).click();
  await expect(page.getByRole("dialog")).toContainText("Acceso desactivado");
  await page.getByRole("button", { name: "Confirmar cambio", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Acceso del empleado actualizado");
  await expect(page.getByText("Waiter test · Camarero · Desactivado", { exact: true }).filter({ visible: true })).toBeVisible();
  const context = await browser.newContext();
  try {
    const blocked = await context.newPage();
    await login(blocked, "waiter@example.test");
    await expect(blocked.getByRole("alert").filter({ hasText: "Credenciales no válidas o acceso no autorizado" })).toBeVisible();
    await blocked.goto("http://127.0.0.1:3310/admin");
    await expect(blocked).toHaveURL(/\/acceso\?motivo=sesion$/);
  } finally { await context.close(); }
});

test("el CMS guarda contacto y cierres, conserva el snapshot público y tiene formularios accesibles", async ({ page }) => {
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/contenido");
  await page.getByRole("textbox", { name: "Correo confirmado, si existe", exact: true }).fill("restaurant@example.test");
  await page.getByRole("textbox", { name: /Cierres especiales/ }).fill("2026-12-25 | Cierre de prueba E2E");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("button", { name: "Guardar contenido", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Contenido guardado");
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Correo confirmado, si existe", exact: true })).toHaveValue("restaurant@example.test");
  await expect(page.getByRole("textbox", { name: /Cierres especiales/ })).toHaveValue("2026-12-25 | Cierre de prueba E2E");
  await page.goto("/es");
  await expect(page.locator('#contacto a[href="mailto:restaurant@example.test"]')).toHaveCount(0);
});

test("el empleado cambia su contraseña mediante Auth y puede volver a entrar", async ({ page }) => {
  await login(page, "manager@example.test");
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto("/admin/cuenta");
  await page.getByLabel("Contraseña actual", { exact: true }).filter({ visible: true }).fill("Fixture-password-2026!");
  await page.getByLabel("Nueva contraseña", { exact: true }).filter({ visible: true }).fill("Changed-fixture-password-2026!");
  await page.getByLabel("Repite la nueva contraseña", { exact: true }).filter({ visible: true }).fill("Changed-fixture-password-2026!");
  await page.getByRole("button", { name: "Cambiar contraseña", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Contraseña actualizada en Supabase Auth");
  await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click();
  await expect(page).toHaveURL(/\/acceso$/);
  await login(page, "manager@example.test", "Changed-fixture-password-2026!");
  await expect(page).toHaveURL(/\/admin$/);
});
