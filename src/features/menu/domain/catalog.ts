import { z } from "zod";

// "shellfish" conserva el rótulo amplio «Mariscos» de la fuente; no se infiere
// una clasificación más específica ni una declaración reglamentaria completa.
export const allergenCodes = ["gluten", "shellfish", "eggs", "fish", "peanuts", "soy", "milk", "nuts", "celery", "mustard", "sesame", "sulphites", "lupin", "molluscs"] as const;
export type AllergenCode = (typeof allergenCodes)[number];
const textSchema = z.object({ es: z.string().min(1), en: z.string().min(1).optional(), fr: z.string().min(1).optional(), ro: z.string().min(1).optional(), it: z.string().min(1).optional(), de: z.string().min(1).optional() });
const kindSchema = z.enum(["food", "drink"]);
const originSchema = z.enum(["official", "provided", "demo", "managed"]);

export const productSchema = z.object({
  id: z.string().min(1),
  kind: kindSchema,
  categoryId: z.string().min(1),
  name: textSchema,
  description: textSchema.nullable(),
  priceCents: z.number().int().nonnegative().nullable(),
  currency: z.literal("EUR"),
  image: z.object({ src: z.string().refine((value) => {
    if (value.startsWith("/images/") && !value.includes("..")) return true;
    try { const url = new URL(value); const configured = process.env.NEXT_PUBLIC_SUPABASE_URL; return Boolean(configured && url.origin === new URL(configured).origin && url.protocol === "https:" && url.pathname.startsWith("/storage/v1/object/public/restaurant-media/")); } catch { return false; }
  }, "Imagen fuera del origen permitido."), alt: textSchema }).nullable(),
  ingredients: z.array(textSchema).nullable(),
  allergens: z.array(z.enum(allergenCodes)).min(1).nullable(),
  availability: z.enum(["available", "unavailable", "unknown"]),
  additionalInformation: textSchema.nullable(),
  origin: originSchema,
  sourceUrl: z.url().refine((value) => new URL(value).protocol === "https:", "La fuente debe utilizar HTTPS.").nullable(),
});

export const categorySchema = z.object({
  id: z.string().min(1),
  kind: kindSchema,
  label: textSchema,
  parentId: z.string().nullable(),
  order: z.number().int().nonnegative(),
});

export const catalogSchema = z.object({
  kind: kindSchema,
  origin: originSchema,
  checkedAt: z.iso.date(),
  categories: z.array(categorySchema),
  products: z.array(productSchema),
  featuredIds: z.array(z.string()),
}).superRefine((catalog, context) => {
  const categories = new Map(catalog.categories.map((category) => [category.id, category]));
  const products = new Map(catalog.products.map((product) => [product.id, product]));
  function invalid(message: string) { context.addIssue({ code: "custom", message }); }
  if (categories.size !== catalog.categories.length || products.size !== catalog.products.length) invalid("Identificadores duplicados.");
  for (const category of catalog.categories) {
    if (category.kind !== catalog.kind) invalid("Categoría de otro catálogo.");
    if (category.parentId !== null) {
      const parent = categories.get(category.parentId);
      if (!parent || parent.parentId !== null || parent.id === category.id) invalid("La subcategoría debe pertenecer a una categoría raíz.");
    }
  }
  for (const product of catalog.products) {
    if (!categories.has(product.categoryId) || product.kind !== catalog.kind || product.origin !== catalog.origin) invalid("Producto fuera de su catálogo o procedencia.");
    if (product.origin === "official" && (!product.sourceUrl || product.priceCents === null)) invalid("Falta fuente o precio publicado.");
    if (product.origin === "provided" && product.priceCents === null) invalid("Falta el precio de la carta facilitada.");
  }
  if (catalog.featuredIds.some((id) => !products.has(id))) invalid("Especialidad inexistente.");
});

export type MenuProduct = z.infer<typeof productSchema>;
export type MenuCategory = z.infer<typeof categorySchema>;
export type MenuCatalog = z.infer<typeof catalogSchema>;
export type MenuKind = MenuCatalog["kind"];
export type LocalizedText = MenuProduct["name"];

export interface MenuRepository {
  getCatalog(kind: MenuKind): Promise<MenuCatalog>;
}
