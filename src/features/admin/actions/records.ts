"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/features/auth/data/staff";
import { actionFailure as resultFailure, type ActionResult } from "@/features/admin/domain/result";
import { logOperationalFailure } from "@/services/operational-log";
import { categorySchema, contentSchema, deleteSchema, productSchema, staffSchema, priceToCents } from "@/features/admin/validation/records";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import { enforceMediaRateLimit } from "@/services/security/login-rate-limit";

function actionFailure(code?: string, message?: string): ActionResult {
  const expected = ["40001", "23505", "23503", "23001", "23514", "22008", "22P02", "42501"];
  if (!expected.includes(code ?? "") && !["last_owner", "auth_user_missing", "write_rate_limit"].includes(message ?? "")) logOperationalFailure("admin_write_failed", code);
  return resultFailure(code, message);
}

function invalidate() {
  revalidatePath("/admin", "layout");
  revalidateTag("public-catalog", "max");
  revalidateTag("public-content", "max");
}

export async function saveCategory(input: unknown): Promise<ActionResult> {
  await requirePermission("catalog");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los datos de la categoría." };
  const { id, version, published, parent_id, ...payload } = parsed.data;
  try {
    const client = await createServerSupabaseClient();
    const { error } = await client.rpc("admin_save_record", { p_id: id, p_kind: "category", p_parent_id: parent_id || null, p_payload: payload, p_published: published, p_version: version });
    if (error) return actionFailure(error.code, error.message);
    invalidate();
    return { ok: true, id, message: "Categoría guardada." };
  } catch { return actionFailure(); }
}

export async function saveProduct(input: unknown): Promise<ActionResult> {
  await requirePermission("catalog");
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los datos y el precio del producto." };
  const { id, version, published, category_id, price, allergens, ...rest } = parsed.data;
  const payload = { ...rest, price_cents: priceToCents(price), allergens: allergens.length ? allergens : null };
  try {
    const client = await createServerSupabaseClient();
    const { error } = await client.rpc("admin_save_record", { p_id: id, p_kind: "product", p_parent_id: category_id, p_payload: payload, p_published: published, p_version: version });
    if (error) return actionFailure(error.code, error.message);
    invalidate();
    return { ok: true, id, message: "Producto guardado." };
  } catch { return actionFailure(); }
}

export async function saveContent(input: unknown): Promise<ActionResult> {
  await requirePermission("content");
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa los textos, enlaces, fotografías y horarios." };
  try {
    const client = await createServerSupabaseClient();
    const value = parsed.data;
    const { error } = await client.rpc("admin_save_record", { p_id: value.id, p_kind: "content", p_parent_id: null, p_payload: value.payload as Json, p_published: value.published, p_version: value.version });
    if (error) return actionFailure(error.code, error.message);
    invalidate();
    return { ok: true, id: value.id, message: "Contenido guardado." };
  } catch { return actionFailure(); }
}

export async function deleteRecord(input: unknown): Promise<ActionResult> {
  await requirePermission("catalog");
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Registro inválido." };
  try {
    const client = await createServerSupabaseClient();
    // Esta acción de carta no permite borrar el documento CMS.
    const { data, error: readError } = await client.from("admin_records").select("kind").eq("id", parsed.data.id).maybeSingle();
    if (readError || !data || data.kind === "content") return { ok: false, message: "El registro no se puede eliminar desde la carta." };
    const { error } = await client.rpc("admin_delete_record", { p_id: parsed.data.id, p_version: parsed.data.version });
    if (error) return actionFailure(error.code, error.message);
    invalidate();
    return { ok: true, message: "Registro eliminado." };
  } catch { return actionFailure(); }
}

export async function saveStaff(input: unknown): Promise<ActionResult> {
  await requirePermission("staff");
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Revisa el correo, nombre y rol." };
  try {
    const client = await createServerSupabaseClient();
    const { error } = await client.rpc("admin_set_staff", { p_email: parsed.data.email, p_name: parsed.data.display_name, p_role: parsed.data.role, p_active: parsed.data.active });
    if (error) return actionFailure(error.code, error.message);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Acceso del empleado actualizado." };
  } catch { return actionFailure(); }
}

export async function uploadPhoto(form: FormData): Promise<ActionResult> {
  const staff = await requirePermission("catalog");
  const file = form.get("file");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
  if (!(file instanceof File) || file.size < 1 || file.size > 5_242_880 || !extensions[file.type]) return { ok: false, message: "Selecciona una imagen JPG, PNG, WebP o AVIF de hasta 5 MB." };
  try {
    // Decodificar y recodificar evita confiar en el MIME/archivo que envía el navegador.
    await enforceMediaRateLimit(staff.userId);
    const input = Buffer.from(await file.arrayBuffer());
    const raster = (input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff)
      || input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      || (input.toString("ascii", 0, 4) === "RIFF" && input.toString("ascii", 8, 12) === "WEBP")
      || (input.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(input.toString("ascii", 8, 64)));
    if (!raster) return { ok: false, message: "El archivo no contiene una fotografía raster admitida." };
    const sharp = (await import("sharp")).default;
    const image = sharp(input, { limitInputPixels: 40_000_000 });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp", "avif", "heif"].includes(metadata.format)) return { ok: false, message: "El contenido del archivo no es una fotografía admitida." };
    const output = await image.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    if (output.byteLength > 5_242_880) return { ok: false, message: "La imagen procesada supera el tamaño permitido." };
    const client = await createServerSupabaseClient();
    const path = `${staff.userId}/${randomUUID()}.webp`;
    const { error } = await client.storage.from("restaurant-media").upload(path, output, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
    if (error) return actionFailure(undefined, error.message);
    const { error: auditError } = await client.rpc("admin_log_upload", { p_path: path, p_size: output.byteLength, p_mime: "image/webp" });
    if (auditError) {
      await client.storage.from("restaurant-media").remove([path]);
      return actionFailure(auditError.code, auditError.message);
    }
    return { ok: true, path, message: "Fotografía pública subida y registrada. Guarda el formulario para asociarla." };
  } catch { return { ok: false, message: "No se ha podido procesar la fotografía." }; }
}
