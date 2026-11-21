import { describe, expect, it, vi } from "vitest";

import { getCatalog, getLocalizedCatalog } from "@/features/menu/data/get-catalog";
import { demoDrinks } from "@/features/menu/data/demo-drinks";
import { catalogSchema, type MenuRepository } from "@/features/menu/domain/catalog";
import { filterProducts, formatPrice, localize } from "@/features/menu/domain/queries";
import { localMenuRepository } from "@/services/menu/local-menu-repository";
import { locales } from "@/i18n/config";
import { foodTranslations, translatedProductLocales } from "@/features/menu/data/product-translations";

describe("catálogo gastronómico y procedencia", () => {
  it("valida las 92 referencias y separa tapas de carta sin confundir precios", async () => {
    const catalog = await getCatalog("food");
    expect(catalog.products).toHaveLength(92);
    const cod = filterProducts(catalog, "bacalao al pil pil", "all", "es");
    expect(cod.map((product) => product.priceCents).sort((a, b) => a! - b!)).toEqual([600, 1900]);
    expect(new Set(cod.map((product) => product.categoryId)).size).toBe(2);
  });

  it("no interpreta la falta de información como ausencia de alérgenos o stock", async () => {
    const catalog = await getCatalog("food");
    const vegetable = catalog.products.find((product) => product.name.es === "Paella Vegetal");
    expect(vegetable).toMatchObject({ allergens: null, ingredients: null, availability: "unknown", image: null });
    expect(catalog.products.every((product) => product.origin === "official" && product.availability === "unknown")).toBe(true);
  });

  it("no añade bebidas de demostración a los datos reales", async () => {
    const catalog = await getCatalog("drink");
    expect(catalog.products.length).toBeGreaterThan(0);
    expect(catalog.products.every((product) => product.origin === "provided" && !product.id.startsWith("demo-"))).toBe(true);
    expect(catalogSchema.parse(demoDrinks).products.every((product) => product.origin === "demo" && product.priceCents === null)).toBe(true);
    expect(catalogSchema.safeParse({ ...await getCatalog("drink"), products: demoDrinks.products, categories: demoDrinks.categories }).success).toBe(false);
  });

  it("valida las 134 bebidas de las seis imágenes, sus precios y los duplicados de origen", async () => {
    const catalog = await getCatalog("drink");
    expect(catalog.products).toHaveLength(134);
    expect(catalog.categories.map((category) => [category.id, catalog.products.filter((product) => product.categoryId === category.id).length])).toEqual([
      ["drinks-beer", 24], ["drinks-soft", 14], ["drinks-coffee-tea", 20],
      ["drinks-gin", 23], ["drinks-whisky", 19], ["drinks-liqueurs", 34],
    ]);
    const priceOf = (name: string) => catalog.products.find((product) => product.name.es === name)?.priceCents;
    expect(priceOf("Caña")).toBe(260);
    expect(priceOf("Aquarius Naranja / Limón")).toBe(280);
    expect(priceOf("Café bombón")).toBe(270);
    expect(priceOf("Hendrick’s")).toBe(1200);
    expect(priceOf("Johnnie Walker Blue")).toBe(7500);
    expect(priceOf("Johnnie Walker Premier")).toBe(10000);
    expect(priceOf("Martini rojo")).toBe(600);
    expect(priceOf("Martini blanco")).toBe(500);
    expect(catalog.products.filter((product) => product.name.es === "Pernod")).toHaveLength(1);
    expect(catalog.products.filter((product) => product.name.es === "Grand Marnier Amarillo")).toHaveLength(1);
    expect(catalogSchema.safeParse({ ...catalog, products: [{ ...catalog.products[0], priceCents: null }] }).success).toBe(false);
  });

  it("conserva formatos y opciones agrupadas sin inferir datos ausentes en las imágenes", async () => {
    const catalog = await getCatalog("drink");
    expect(catalog.products.find((product) => product.name.es === "Jarra")?.priceCents).toBe(1000);
    expect(catalog.products.find((product) => product.name.es === "Jarra cerveza")?.priceCents).toBe(1100);
    expect(filterProducts(catalog, "coca cola", "drinks-soft", "es")).toHaveLength(1);
    expect(catalog.products.every((product) => product.description === null && product.image === null && product.ingredients === null && product.allergens === null && product.availability === "unknown" && product.sourceUrl === null)).toBe(true);
  });

  it("permite usar un proveedor de pruebas sin modificar el catálogo local", async () => {
    const load = vi.fn().mockResolvedValue(demoDrinks);
    const repository: MenuRepository = { getCatalog: load };
    expect(await getCatalog("drink", repository)).toBe(demoDrinks);
    expect(load).toHaveBeenCalledWith("drink");
  });

  it("rechaza identificadores duplicados, categorías huérfanas y especialidades inexistentes", async () => {
    const catalog = await getCatalog("food");
    expect(catalogSchema.safeParse({ ...catalog, products: [...catalog.products, catalog.products[0]] }).success).toBe(false);
    expect(catalogSchema.safeParse({ ...catalog, categories: catalog.categories.slice(1) }).success).toBe(false);
    expect(catalogSchema.safeParse({ ...catalog, featuredIds: ["missing"] }).success).toBe(false);
  });

  it("rechaza fuentes ejecutables y precios inválidos", async () => {
    const catalog = await localMenuRepository.getCatalog("food");
    expect(catalogSchema.safeParse({ ...catalog, products: [{ ...catalog.products[0], sourceUrl: "javascript:alert(1)" }] }).success).toBe(false);
    expect(catalogSchema.safeParse({ ...catalog, products: [{ ...catalog.products[0], priceCents: -1 }] }).success).toBe(false);
  });
});

describe("búsqueda y categorías configurables", () => {
  it("combina términos y elimina diferencias de acentos y mayúsculas", async () => {
    const catalog = await getCatalog("food");
    expect(filterProducts(catalog, "  PUCHÉRO  ", "all", "es")).toHaveLength(2);
    expect(filterProducts(catalog, "arroz negro", "rice", "es")).toHaveLength(1);
    expect(filterProducts(catalog, "arroz negro", "meat", "es")).toHaveLength(0);
  });

  it("incluye subcategorías al filtrar por una categoría raíz", async () => {
    const catalog = await getCatalog("food");
    expect(filterProducts(catalog, "", "seafood", "es")).toHaveLength(16);
    expect(filterProducts(catalog, "", "fish-menu", "es")).toHaveLength(7);
    expect(filterProducts(catalog, "", "unknown-category", "es")).toHaveLength(92);
  });

  it("busca bebidas sin descripción y combina términos sin acentos con su categoría", async () => {
    const catalog = await getCatalog("drink");
    expect(filterProducts(catalog, "  CAFE BOMBON  ", "drinks-coffee-tea", "es").map((product) => product.priceCents)).toEqual([270]);
    expect(filterProducts(catalog, "cafe bombon", "drinks-gin", "es")).toEqual([]);
    expect(filterProducts(catalog, "walker blue", "drinks-whisky", "en").map((product) => product.priceCents)).toEqual([7500]);
  });

  it("usa los textos traducidos cuando existen y conserva el original cuando no", () => {
    expect(filterProducts(demoDrinks, "alcohol-free", "demo-drinks", "en")).toHaveLength(1);
    expect(filterProducts(demoDrinks, "ejemplo vino", "demo-wine", "es")).toHaveLength(1);
  });

  it("formatea céntimos sin redondear importes publicados incorrectamente", () => {
    expect(formatPrice(1390, "es")).toMatch(/13,90/);
    expect(formatPrice(350, "en")).toBe("€3.50");
  });
});

describe("traducciones reales del catálogo", () => {
  it("cubre las 92 referencias en los cinco idiomas sin entradas huérfanas ni descripciones en español", async () => {
    const food = await getCatalog("food");
    const ids = food.products.map((product) => product.id).sort();
    for (const locale of translatedProductLocales) {
      expect(Object.keys(foodTranslations[locale]).sort()).toEqual(ids);
      for (const product of food.products) {
        expect(product.name[locale]?.trim().length).toBeGreaterThan(0);
        expect(product.description?.[locale]?.trim().length).toBeGreaterThan(0);
        expect(product.description?.[locale]).not.toBe(product.description?.es);
      }
    }
  });

  it("busca por el nombre traducido y el original, y mantiene formatos, marcas y precios", async () => {
    const food = await getCatalog("food");
    for (const [locale, query] of [["en", "cod pil"], ["fr", "morue pil"], ["ro", "cod pil"], ["it", "baccala pil"], ["de", "kabeljau pil"]] as const) {
      expect(filterProducts(food, query, "all", locale).map((product) => product.priceCents).sort((a, b) => a! - b!)).toEqual([600, 1900]);
      expect(filterProducts(food, "bacalao al pil pil", "all", locale)).toHaveLength(2);
    }
    const drinks = await getCatalog("drink");
    for (const [locale, query] of [["en", "pineapple"], ["fr", "ananas"], ["ro", "ananas"], ["it", "ananas"], ["de", "ananassaft"]] as const) {
      expect(filterProducts(drinks, query, "all", locale).map((product) => product.priceCents)).toEqual([270]);
      expect(filterProducts(drinks, "hendrick", "all", locale).map((product) => localize(product.name, locale))).toEqual(["Hendrick’s"]);
    }
  });

  it("envía solo el idioma elegido y el original sin alterar IDs ni datos del producto", async () => {
    for (const kind of ["food", "drink"] as const) {
      const original = await getCatalog(kind);
      for (const locale of locales) {
        const catalog = await getLocalizedCatalog(kind, locale);
        expect(catalog.products.map(({ id, categoryId, priceCents, allergens, availability }) => ({ id, categoryId, priceCents, allergens, availability }))).toEqual(original.products.map(({ id, categoryId, priceCents, allergens, availability }) => ({ id, categoryId, priceCents, allergens, availability })));
        for (const product of catalog.products) {
          expect(Object.keys(product.name).sort()).toEqual(locale === "es" ? ["es"] : ["es", locale].sort());
          if (product.description) expect(Object.keys(product.description).sort()).toEqual(locale === "es" ? ["es"] : ["es", locale].sort());
        }
      }
    }
  });
});
