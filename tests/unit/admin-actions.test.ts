import { beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ permission: vi.fn(), rpc: vi.fn(), maybeSingle: vi.fn(), client: vi.fn() }));
vi.mock("@/features/auth/data/staff", () => ({ requirePermission: mock.permission }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient: mock.client }));

import { saveCategory, saveProduct, saveStaff, deleteRecord } from "@/features/admin/actions/records";
import { categorySchema, productSchema, priceToCents } from "@/features/admin/validation/records";
import { hasPermission } from "@/features/auth/domain/roles";

const id = "20000000-0000-4000-8000-000000000001";
const category = { id, version: 0, published: false, name_es: "Categoría de prueba", name_en: "Test category", slug: "test", catalog: "food", parent_id: "", order: 0 };
const product = { id, version: 0, published: false, category_id: id, catalog: "food", name_es: "Producto de prueba", name_en: "Test product", description_es: "Solo pruebas", description_en: "Tests only", price: "13,90", availability: "unknown", featured: false, ingredients_es: "", ingredients_en: "", allergens: [], image_path: "", additional_es: "", additional_en: "" };
beforeEach(() => {
  mock.permission.mockResolvedValue({ userId: "test-user", role: "owner" });
  mock.rpc.mockResolvedValue({ data: id, error: null });
  mock.maybeSingle.mockResolvedValue({ data: { kind: "category" }, error: null });
  mock.client.mockResolvedValue({ rpc: mock.rpc, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: mock.maybeSingle }) }) }) });
});

describe("acciones administrativas", () => {
  it("comprueba permisos antes de validar y escribir", async () => {
    mock.permission.mockRejectedValue(new Error("denied"));
    await expect(saveCategory(category)).rejects.toThrow("denied");
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("rechaza datos inválidos sin invocar SQL", async () => {
    expect((await saveCategory({ ...category, slug: "../escape" })).ok).toBe(false);
    expect((await saveProduct({ ...product, price: "NaN" })).ok).toBe(false);
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("guarda categoría con versión y publicación explícitas", async () => {
    expect((await saveCategory(category)).ok).toBe(true);
    expect(mock.permission).toHaveBeenCalledWith("catalog");
    expect(mock.rpc).toHaveBeenCalledWith("admin_save_record", expect.objectContaining({ p_id: id, p_kind: "category", p_version: 0, p_parent_id: null, p_published: false }));
  });
  it("preserva importes en céntimos y no inventa alérgenos", async () => {
    expect((await saveProduct(product)).ok).toBe(true);
    expect(mock.rpc).toHaveBeenCalledWith("admin_save_record", expect.objectContaining({ p_payload: expect.objectContaining({ price_cents: 1390, allergens: null, availability: "unknown" }) }));
    expect(priceToCents("1,01")).toBe(101);
    expect(priceToCents("0.10")).toBe(10);
  });
  it("no devuelve éxito cuando la base informa de un conflicto", async () => {
    mock.rpc.mockResolvedValue({ error: { code: "40001", message: "private database details" } });
    const result = await saveProduct(product);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Recarga");
    expect(result.message).not.toContain("private database");
  });
  it("protege el documento CMS frente al borrado desde la carta", async () => {
    mock.maybeSingle.mockResolvedValue({ data: { kind: "content" }, error: null });
    expect((await deleteRecord({ id, version: 1 })).ok).toBe(false);
    expect(mock.rpc).not.toHaveBeenCalled();
  });
  it("reserva los cambios de empleados al propietario y comunica el último propietario", async () => {
    mock.rpc.mockResolvedValue({ error: { code: "P0001", message: "last_owner" } });
    expect((await saveStaff({ email: "owner@example.test", display_name: "Test", role: "waiter", active: false })).message).toContain("propietario activo");
    expect(mock.permission).toHaveBeenCalledWith("staff");
  });
  it("no asigna permisos operativos a roles futuros ni al rol legado", () => {
    for (const role of ["waiter", "kitchen", "employee"] as const) expect(hasPermission(role, "catalog")).toBe(false);
    expect(hasPermission("manager", "catalog")).toBe(true);
    expect(hasPermission("manager", "staff")).toBe(false);
    expect(hasPermission("owner", "audit")).toBe(true);
  });
  it("los esquemas no aceptan campos adicionales, precios negativos o imágenes externas", () => {
    expect(categorySchema.safeParse({ ...category, service_role: "test" }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, image_path: "https://example.test/photo.jpg" }).success).toBe(false);
    expect(productSchema.safeParse({ ...product, price: "-10" }).success).toBe(false);
  });
});
