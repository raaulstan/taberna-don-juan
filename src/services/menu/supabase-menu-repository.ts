import "server-only";

import { getPublishedRecords, publicImageUrl } from "@/services/public/content";
import { categoryValues, productValues } from "@/features/admin/data/form-values";
import { catalogSchema, type MenuRepository } from "@/features/menu/domain/catalog";
import { priceToCents } from "@/features/admin/validation/records";

function ingredientList(spanish: string, english: string) {
  const lines = (value: string) => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const es = lines(spanish); const en = lines(english);
  return es.length ? es.map((line, index) => ({ es: line, ...(en[index] ? { en: en[index] } : {}) })) : null;
}

export const supabaseMenuRepository: MenuRepository = {
  async getCatalog(kind) {
    const records = await getPublishedRecords();
    const categories = records.filter((record) => record.published && record.kind === "category").map((record) => ({ record, value: categoryValues(record) })).filter(({ value }) => value.catalog === kind);
    const categoryIds = new Map(categories.map(({ record, value }) => [record.id, value.slug]));
    const products = records.filter((record) => record.published && record.kind === "product" && categoryIds.has(record.parent_id ?? "")).map((record) => ({ record, value: productValues(record) })).filter(({ value }) => value.catalog === kind);
    const updated = records.map((record) => record.updated_at).sort().at(-1) ?? new Date().toISOString();
    return catalogSchema.parse({ kind, origin: "managed", checkedAt: updated.slice(0, 10), categories: categories.map(({ record, value }) => ({ id: value.slug, kind, label: { es: value.name_es, ...(value.name_en ? { en: value.name_en } : {}) }, parentId: record.parent_id ? categoryIds.get(record.parent_id) ?? null : null, order: value.order })), products: products.map(({ record, value }) => ({
      id: record.id, kind, categoryId: categoryIds.get(record.parent_id!)!, name: { es: value.name_es, ...(value.name_en ? { en: value.name_en } : {}) }, description: { es: value.description_es || "Descripción pendiente de publicar.", ...(value.description_en ? { en: value.description_en } : !value.description_es ? { en: "Description pending publication." } : {}) }, priceCents: priceToCents(value.price), currency: "EUR", origin: "managed", sourceUrl: null,
      image: value.image_path ? { src: publicImageUrl(value.image_path), alt: { es: value.name_es, ...(value.name_en ? { en: value.name_en } : {}) } } : null,
      ingredients: ingredientList(value.ingredients_es, value.ingredients_en),
      allergens: value.allergens.length ? value.allergens : null, availability: value.availability, additionalInformation: value.additional_es ? { es: value.additional_es, ...(value.additional_en ? { en: value.additional_en } : {}) } : null,
    })), featuredIds: products.filter(({ value }) => value.featured).map(({ record }) => record.id).slice(0, 8) });
  },
};
