import "server-only";

import { notFound } from "next/navigation";
import { z } from "zod";
import { requirePermission } from "@/features/auth/data/staff";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminRecordRow } from "@/types/database";

const columns = "id, kind, parent_id, payload, published, version, updated_at";
export async function listRecords(kind: AdminRecordRow["kind"]) {
  await requirePermission(kind === "content" ? "content" : "catalog");
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("admin_records").select(columns).eq("kind", kind).order("updated_at", { ascending: false }).limit(500);
  if (error) throw new Error("No se ha podido leer la gestión. Comprueba las migraciones y la conexión con Supabase.");
  return data;
}

export async function getRecord(id: string, kind: AdminRecordRow["kind"]) {
  await requirePermission(kind === "content" ? "content" : "catalog");
  if (!z.uuid().safeParse(id).success) notFound();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("admin_records").select(columns).eq("id", id).eq("kind", kind).maybeSingle();
  if (error) throw new Error("No se ha podido leer el registro.");
  if (!data) notFound();
  return data;
}

export async function listStaff() {
  await requirePermission("staff");
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("admin_list_staff");
  if (error) throw new Error("No se ha podido consultar el equipo.");
  return data;
}

export async function listAudit() {
  await requirePermission("audit");
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("admin_audit").select("id, actor_id, entity, record_id, action, created_at").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("No se ha podido consultar la auditoría.");
  return data;
}

export async function getDashboardCounts() {
  await requirePermission("catalog");
  const client = await createServerSupabaseClient();
  const results = await Promise.all([
    client.from("admin_records").select("id", { count: "exact", head: true }).eq("kind", "product"),
    client.from("admin_records").select("id", { count: "exact", head: true }).eq("kind", "product").eq("published", true),
    client.from("admin_records").select("id", { count: "exact", head: true }).eq("kind", "category"),
  ]);
  if (results.some((result) => result.error || result.count === null)) throw new Error("No se han podido consultar los indicadores reales.");
  return { products: results[0]!.count!, published: results[1]!.count!, categories: results[2]!.count! };
}
