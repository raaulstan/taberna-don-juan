import { z } from "zod";
import { allergenCodes } from "@/features/menu/domain/catalog";

const text = z.string().trim().max(5000);
const name = z.string().trim().min(1, "Escribe un nombre.").max(180);
export const imagePath = z.string().regex(/^$|^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/);
const base = { id: z.uuid(), version: z.number().int().nonnegative(), published: z.boolean() };
export const categorySchema = z.object({ ...base, name_es: name, name_en: z.string().trim().max(180), slug: z.string().regex(/^[a-z][a-z0-9-]{0,79}$/, "Usa letras minúsculas, números y guiones."), catalog: z.enum(["food", "drink"]), parent_id: z.union([z.literal(""), z.uuid()]), order: z.number().int().min(0).max(9999) }).strict();
export const productSchema = z.object({
  ...base, category_id: z.uuid("Selecciona una categoría."), catalog: z.enum(["food", "drink"]),
  name_es: name, name_en: z.string().trim().max(180), description_es: text, description_en: text,
  price: z.string().regex(/^\d{1,5}([.,]\d{1,2})?$/, "Precio en euros, con hasta dos decimales."),
  availability: z.enum(["unknown", "available", "unavailable"]), featured: z.boolean(),
  ingredients_es: text, ingredients_en: text, allergens: z.array(z.enum(allergenCodes)).max(14),
  image_path: imagePath, additional_es: text, additional_en: text,
}).strict().superRefine((value, context) => {
  const count = (text: string) => text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
  if (value.ingredients_en && count(value.ingredients_en) !== count(value.ingredients_es)) context.addIssue({ code: "custom", path: ["ingredients_en"], message: "Mantén una línea por ingrediente, en el mismo orden y cantidad que en español." });
});
const publicUrl = (hosts: string[]) => z.union([z.literal(""), z.url().refine((value) => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && hosts.includes(url.hostname); }, "Utiliza un enlace HTTPS del perfil oficial.")]);
const copy = z.string().trim().max(1200).refine((value) => !/[{}<>]/.test(value), "Utiliza texto plano, sin etiquetas ni llaves de formato.");
export const editableTextKeys = ["title", "heroLine", "description", "storyLead", "storyDescription", "contactDescription"] as const;
const translated = z.object({ es: copy, en: copy }).strict();
export const contentPayloadSchema = z.object({
  contact: z.object({ address: z.string().trim().min(1).max(300), mobile: z.string().regex(/^\+\d{8,15}$/), landline: z.string().regex(/^$|^\+\d{8,15}$/), email: z.union([z.literal(""), z.email()]), instagram: publicUrl(["www.instagram.com", "instagram.com"]), facebook: publicUrl(["www.facebook.com", "facebook.com"]), hours_es: z.string().trim().min(1).max(500), hours_en: z.string().trim().min(1).max(500), closures: z.array(z.object({ date: z.iso.date(), label: z.string().trim().min(1).max(160) }).strict()).max(100) }).strict(),
  texts: z.object({ title: translated, heroLine: translated, description: translated, storyLead: translated, storyDescription: translated, contactDescription: translated }).strict(),
  hero_path: imagePath, story_path: imagePath, image_caption_es: z.string().max(500), image_caption_en: z.string().max(500),
}).strict().refine((value) => !(value.hero_path || value.story_path) || Boolean(value.image_caption_es.trim() && value.image_caption_en.trim()), { message: "Añade una descripción de las fotografías en ambos idiomas.", path: ["image_caption_es"] });
export const contentSchema = z.object({ ...base, payload: contentPayloadSchema }).strict();
export const staffSchema = z.object({ email: z.email().trim().max(254), display_name: z.string().trim().max(120), role: z.enum(["owner", "manager", "waiter", "kitchen"]), active: z.boolean() }).strict();
export const deleteSchema = z.object({ id: z.uuid(), version: z.number().int().positive() }).strict();
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ContentInput = z.infer<typeof contentSchema>;
export type SiteContent = z.infer<typeof contentPayloadSchema>;
export type StaffInput = z.infer<typeof staffSchema>;

export function priceToCents(value: string) {
  const [whole = "0", fraction = ""] = value.replace(",", ".").split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
