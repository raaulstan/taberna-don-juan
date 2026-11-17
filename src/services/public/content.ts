import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/config/env";
import { contentPayloadSchema, imagePath } from "@/features/admin/validation/records";
import { restaurant } from "@/features/home/data/restaurant";
import type { Database } from "@/types/database";

export function managedPublicData() {
  const source = process.env.PUBLIC_DATA_SOURCE ?? "local";
  if (source !== "local" && source !== "supabase") throw new Error("PUBLIC_DATA_SOURCE debe ser local o supabase.");
  return source === "supabase";
}

export function publicImageUrl(path: string) {
  if (!path || !imagePath.safeParse(path).success) throw new Error("Ruta pública de imagen no válida.");
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase público no está configurado.");
  return `${config.url.replace(/\/$/, "")}/storage/v1/object/public/restaurant-media/${path}`;
}

// Solo cliente anónimo, nunca cookies ni clientes de sesión dentro de esta caché.
const publishedRecords = unstable_cache(async () => {
  const config = getSupabaseConfig();
  if (!config) throw new Error("El proveedor público requiere Supabase configurado.");
  const client = createClient<Database>(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(10000) }) } });
  const { data, error } = await client.from("admin_records").select("id, kind, parent_id, payload, published, version, updated_at").eq("published", true).limit(501);
  if (error || !data) throw new Error("No se ha podido leer el contenido público.");
  if (data.length > 500) throw new Error("El catálogo público supera el límite configurado; es necesario paginar el proveedor.");
  return data.filter((record) => record.published);
}, ["published-restaurant-v1"], { tags: ["public-content", "public-catalog"], revalidate: 300 });

export const getPublishedRecords = cache(async () => managedPublicData() ? publishedRecords() : []);
export const getPublishedSite = cache(async () => {
  const records = await getPublishedRecords();
  const content = records.find((record) => record.kind === "content");
  if (!content) return null;
  const parsed = contentPayloadSchema.safeParse(content.payload);
  if (!parsed.success) throw new Error("El contenido publicado no es válido.");
  return parsed.data;
});

export const getPublicRestaurant = cache(async () => {
  const content = await getPublishedSite();
  const contact = content?.contact;
  const mobile = contact?.mobile ?? restaurant.mobile.href.replace("tel:", "");
  const landline = contact?.landline ?? restaurant.landline.href.replace("tel:", "");
  const address = contact?.address ?? restaurant.address;
  return {
    ...restaurant, address, street: contact ? address : restaurant.street, postcode: contact ? "" : restaurant.postcode,
    mobile: { display: mobile, href: `tel:${mobile}` }, landline: { display: landline, href: landline ? `tel:${landline}` : "" },
    email: contact?.email ?? "", instagram: contact?.instagram ?? restaurant.instagram, facebook: contact?.facebook ?? restaurant.facebook,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Taberna Don Juan, ${address}`)}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
    hours: {
      es: contact?.hours_es ?? "Lunes a domingo · 12:00–00:00", en: contact?.hours_en ?? "Monday to Sunday · 12:00–00:00",
      fr: contact?.hours_es ?? "Du lundi au dimanche · 12:00–00:00", ro: contact?.hours_es ?? "Luni–duminică · 12:00–00:00",
      it: contact?.hours_es ?? "Da lunedì a domenica · 12:00–00:00", de: contact?.hours_es ?? "Montag bis Sonntag · 12:00–00:00",
    },
    closures: contact?.closures ?? [],
  };
});
