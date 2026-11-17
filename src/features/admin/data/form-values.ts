import "server-only";

import { randomUUID } from "node:crypto";
import es from "../../../../messages/es.json";
import en from "../../../../messages/en.json";
import { restaurant } from "@/features/home/data/restaurant";
import type { AdminRecordRow, Json } from "@/types/database";
import { categorySchema, contentSchema, editableTextKeys, productSchema, type CategoryInput, type ContentInput, type ProductInput } from "../validation/records";

export function recordData(record: AdminRecordRow): Record<string, Json | undefined> {
  if (!record.payload || typeof record.payload !== "object" || Array.isArray(record.payload)) throw new Error("Registro administrativo inválido.");
  return record.payload;
}
export function recordName(record: AdminRecordRow) { const value = recordData(record).name_es; return typeof value === "string" ? value : "Sin nombre"; }

export function categoryValues(record?: AdminRecordRow): CategoryInput {
  if (!record) return { id: randomUUID(), version: 0, published: false, name_es: "", name_en: "", slug: "", catalog: "food", parent_id: "", order: 0 };
  return categorySchema.parse({ ...recordData(record), id: record.id, version: record.version, published: record.published, parent_id: record.parent_id ?? "" });
}
export function productValues(record?: AdminRecordRow): ProductInput {
  if (!record) return { id: randomUUID(), version: 0, published: false, category_id: "", catalog: "food", name_es: "", name_en: "", description_es: "", description_en: "", price: "", availability: "unknown", featured: false, ingredients_es: "", ingredients_en: "", allergens: [], image_path: "", additional_es: "", additional_en: "" };
  const { price_cents, ...payload } = recordData(record);
  if (typeof price_cents !== "number") throw new Error("Precio guardado inválido.");
  return productSchema.parse({ ...payload, id: record.id, version: record.version, published: record.published, category_id: record.parent_id, price: (price_cents / 100).toFixed(2), allergens: payload.allergens ?? [] });
}
export function contentValues(record?: AdminRecordRow): ContentInput {
  if (record) return contentSchema.parse({ id: record.id, version: record.version, published: record.published, payload: record.payload });
  const texts = Object.fromEntries(editableTextKeys.map((key) => [key, { es: es.Home[key], en: en.Home[key] }])) as ContentInput["payload"]["texts"];
  return { id: randomUUID(), version: 0, published: false, payload: { contact: { address: restaurant.address, mobile: restaurant.mobile.href.replace("tel:", ""), landline: restaurant.landline.href.replace("tel:", ""), email: "", instagram: restaurant.instagram, facebook: restaurant.facebook, hours_es: "Lunes a domingo · 12:00–00:00", hours_en: "Monday to Sunday · 12:00–00:00", closures: [] }, texts, hero_path: "", story_path: "", image_caption_es: "", image_caption_en: "" } };
}
