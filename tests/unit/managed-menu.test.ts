import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminRecordRow } from "@/types/database";

const published = vi.hoisted(() => vi.fn());
vi.mock("@/services/public/content", () => ({ getPublishedRecords: published, publicImageUrl: (path: string) => `https://project.example.test/storage/v1/object/public/restaurant-media/${path}` }));
import { supabaseMenuRepository } from "@/services/menu/supabase-menu-repository";

const category: AdminRecordRow = { id: "20000000-0000-4000-8000-000000000001", kind: "category", parent_id: null, published: true, version: 1, updated_at: "2026-11-17T12:00:00Z", payload: { catalog: "food", name_es: "Categoría de prueba", name_en: "Test category", slug: "test", order: 0 } };
const product: AdminRecordRow = { id: "30000000-0000-4000-8000-000000000001", kind: "product", parent_id: category.id, published: true, version: 1, updated_at: "2026-11-17T12:00:00Z", payload: { catalog: "food", name_es: "Producto de prueba", name_en: "Test product", description_es: "", description_en: "", price_cents: 1390, availability: "unknown", featured: true, ingredients_es: "", ingredients_en: "", allergens: null, image_path: "", additional_es: "", additional_en: "" } };
beforeEach(() => published.mockResolvedValue([category, product]));

describe("adaptador público del CMS", () => {
  it("mapea identificadores, precios y especialidades sin fabricar composición", async () => {
    const catalog = await supabaseMenuRepository.getCatalog("food");
    expect(catalog.origin).toBe("managed");
    expect(catalog.categories[0]?.id).toBe("test");
    expect(catalog.products[0]).toMatchObject({ id: product.id, categoryId: "test", priceCents: 1390, ingredients: null, allergens: null, availability: "unknown", image: null, sourceUrl: null });
    expect(catalog.products[0]?.description?.es).toContain("pendiente");
    expect(catalog.featuredIds).toEqual([product.id]);
  });
  it("no mezcla borradores ni productos huérfanos con datos publicados", async () => {
    published.mockResolvedValue([category, { ...product, published: false }, { ...product, id: "orphan-test", parent_id: "unknown" }]);
    expect((await supabaseMenuRepository.getCatalog("food")).products).toEqual([]);
  });
  it("separa bebidas de gastronomía sin añadir la demostración local", async () => {
    expect((await supabaseMenuRepository.getCatalog("drink")).products).toEqual([]);
  });
  it("conserva traducciones de ingredientes por línea y rechaza datos corruptos", async () => {
    const payload = product.payload as Record<string, string | number | boolean | null>;
    published.mockResolvedValue([category, { ...product, payload: { ...payload, ingredients_es: "Ingrediente de prueba A\n\nIngrediente de prueba B", ingredients_en: "Test ingredient A\nTest ingredient B" } }]);
    expect((await supabaseMenuRepository.getCatalog("food")).products[0]?.ingredients).toEqual([{ es: "Ingrediente de prueba A", en: "Test ingredient A" }, { es: "Ingrediente de prueba B", en: "Test ingredient B" }]);
    published.mockResolvedValue([category, { ...product, payload: { ...payload, price_cents: -1 } }]);
    await expect(supabaseMenuRepository.getCatalog("food")).rejects.toThrow();
  });
});
