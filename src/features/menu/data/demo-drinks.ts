import type { MenuCatalog } from "../domain/catalog";

// Exclusivamente demostración de interfaz; jamás se mezcla con la carta real.
export const demoDrinks: MenuCatalog = {
  kind: "drink",
  origin: "demo",
  checkedAt: "2026-11-17",
  categories: [
    { id: "demo-drinks", kind: "drink", label: { es: "Bebidas · demo", en: "Drinks · demo" }, parentId: null, order: 0 },
    { id: "demo-wine", kind: "drink", label: { es: "Vinos · demo", en: "Wine · demo" }, parentId: "demo-drinks", order: 1 },
    { id: "demo-beer", kind: "drink", label: { es: "Cervezas · demo", en: "Beer · demo" }, parentId: "demo-drinks", order: 2 },
    { id: "demo-soft", kind: "drink", label: { es: "Sin alcohol · demo", en: "Alcohol-free · demo" }, parentId: "demo-drinks", order: 3 },
  ],
  products: [
    { id: "demo-wine-example", categoryId: "demo-wine", name: { es: "Ejemplo de vino", en: "Wine example" }, availability: "unknown" as const },
    { id: "demo-beer-example", categoryId: "demo-beer", name: { es: "Ejemplo de cerveza", en: "Beer example" }, availability: "available" as const },
    { id: "demo-soft-example", categoryId: "demo-soft", name: { es: "Ejemplo sin alcohol", en: "Alcohol-free example" }, availability: "unavailable" as const },
  ].map((example) => ({
    ...example,
    kind: "drink" as const,
    description: { es: "Registro de demostración para probar búsqueda, filtros y fichas. No es un producto a la venta.", en: "Demonstration record for search, filters and details. This is not a product for sale." },
    priceCents: null,
    currency: "EUR" as const,
    image: null,
    ingredients: null,
    allergens: null,
    additionalInformation: { es: "Los estados de disponibilidad de esta sección también son de demostración.", en: "Availability states in this section are also examples." },
    origin: "demo" as const,
    sourceUrl: null,
  })),
  featuredIds: [],
};
