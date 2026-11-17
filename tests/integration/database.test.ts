import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { contentValues } from "@/features/admin/data/form-values";

// PostgreSQL real embebido; solo Auth/Storage externos tienen esquemas de prueba.
// Nunca se ejecuta contra un proyecto remoto ni contiene datos reales.
const db = new PGlite();
const owner = "10000000-0000-4000-8000-000000000001";
const manager = "10000000-0000-4000-8000-000000000002";
const waiter = "10000000-0000-4000-8000-000000000003";
const outsider = "10000000-0000-4000-8000-000000000004";
const category = "20000000-0000-4000-8000-000000000001";
const product = "30000000-0000-4000-8000-000000000001";

async function asUser(id: string | null, role = "authenticated") {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${id ?? ""}', false); set role ${role};`);
}
const categoryPayload = { name_es: "Categoría de prueba", name_en: "Test category", catalog: "food", slug: "test-category", order: 0 };
const productPayload = { name_es: "Producto de prueba", name_en: "Test product", catalog: "food", description_es: "Solo pruebas", description_en: "Tests only", price_cents: 350, availability: "unknown", allergens: null, ingredients_es: "", ingredients_en: "", featured: false, image_path: "", additional_es: "", additional_en: "" };
function save(id: string, kind: string, parent: string | null, payload: object, published: boolean, version: number | null) {
  return db.query("select public.admin_save_record($1::uuid,$2,$3::uuid,$4::jsonb,$5,$6)", [id, kind, parent, JSON.stringify(payload), published, version]);
}

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create table auth.users(id uuid primary key,email text unique);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create schema storage;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable as $$select string_to_array(regexp_replace(name,'/[^/]*$',''),'/')$$;
    grant usage on schema public,auth,storage to anon,authenticated;
    grant select,insert,delete on storage.objects to authenticated;
  `);
  for (const file of ["20261116000100_staff_members.sql", "20261117000200_administration.sql"]) {
    await db.exec(await readFile(new URL(`../../supabase/migrations/${file}`, import.meta.url), "utf8"));
  }
  await db.query("insert into auth.users values ($1,'owner@example.test'),($2,'manager@example.test'),($3,'waiter@example.test'),($4,'outsider@example.test')", [owner, manager, waiter, outsider]);
  await db.query("insert into public.staff_members(user_id,role,display_name) values($1,'owner','Owner test'),($2,'manager','Manager test'),($3,'waiter','Waiter test')", [owner, manager, waiter]);
}, 30000);
afterAll(async () => { await db.close(); });

describe("migraciones, CRUD, RLS y auditoría", () => {
  it("crea categorías/productos y audita el cambio en la misma base", async () => {
    await asUser(owner);
    await save(category, "category", null, categoryPayload, true, 0);
    await save(product, "product", category, productPayload, false, 0);
    const records = await db.query("select id from public.admin_records");
    expect(records.rows).toHaveLength(2);
    const events = await db.query<{ actor_id: string; action: string }>("select actor_id,action from public.admin_audit where record_id=$1", [product]);
    expect(events.rows).toEqual([{ actor_id: owner, action: "INSERT" }]);
  });

  it("el público solo ve publicaciones y no puede leer auditoría ni escribir", async () => {
    await asUser(null, "anon");
    expect((await db.query("select id from public.admin_records")).rows).toEqual([{ id: category }]);
    await expect(db.query("select * from public.admin_audit")).rejects.toMatchObject({ code: "42501" });
    await expect(save(product, "product", category, productPayload, true, 1)).rejects.toMatchObject({ code: "42501" });
  });

  it("guarda el documento CMS validado sin rechazar datos válidos", async () => {
    await asUser(owner);
    const values = contentValues();
    values.payload.contact.email = "restaurant@example.test";
    values.payload.contact.closures = [{ date: "2026-12-25", label: "Cierre de prueba" }];
    await save(values.id, "content", null, values.payload, false, 0);
  });

  it("una cuenta sin membresía y un camarero no pueden gestionar", async () => {
    for (const id of [outsider, waiter]) {
      await asUser(id);
      await expect(save(product, "product", category, productPayload, true, 1)).rejects.toMatchObject({ code: "42501" });
      expect((await db.query("select id from public.admin_records where id=$1", [product])).rows).toHaveLength(0);
    }
  });

  it("el encargado edita carta pero no roles ni historial privado", async () => {
    await asUser(manager);
    await save(product, "product", category, { ...productPayload, price_cents: 425 }, true, 1);
    await expect(db.query("select public.admin_set_staff('outsider@example.test','X','owner',true)")).rejects.toMatchObject({ code: "42501" });
    expect((await db.query("select id from public.admin_audit")).rows).toEqual([]);
    await expect(db.query("update public.admin_records set published=false where id=$1", [product])).rejects.toMatchObject({ code: "42501" });
  });

  it("detecta versiones obsoletas e impide saltarse la comprobación con null", async () => {
    await asUser(owner);
    const attempts = await Promise.allSettled([save(product, "product", category, productPayload, true, 2), save(product, "product", category, productPayload, true, 2)]);
    expect(attempts.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = attempts.find((result) => result.status === "rejected");
    expect(rejected?.status === "rejected" && rejected.reason.code).toBe("40001");
    await expect(save(product, "product", category, productPayload, true, null)).rejects.toMatchObject({ code: "23514" });
  });

  it("rechaza precios, alérgenos y jerarquías inválidos incluso por RPC directo", async () => {
    await asUser(owner);
    await expect(save(product, "product", category, { ...productPayload, price_cents: -1 }, true, 3)).rejects.toMatchObject({ code: "23514" });
    await expect(save(product, "product", category, { ...productPayload, allergens: ["invented"] }, true, 3)).rejects.toMatchObject({ code: "23514" });
    await expect(save(category, "category", category, categoryPayload, true, 1)).rejects.toMatchObject({ code: "23514" });
    await expect(save(category, "category", null, { ...categoryPayload, catalog: null }, true, 1)).rejects.toMatchObject({ code: "23514" });
  });

  it("oculta productos cuando se despublica su categoría y protege referencias al borrar", async () => {
    await asUser(owner);
    await save(category, "category", null, categoryPayload, false, 1);
    await expect(db.query("select public.admin_delete_record($1,2)", [category])).rejects.toMatchObject({ code: "23001" });
    await asUser(null, "anon");
    expect((await db.query("select id from public.admin_records")).rows).toEqual([]);
  });

  it("desactiva permisos sin depender de claims editables y protege al último propietario", async () => {
    await asUser(owner);
    await db.query("select public.admin_set_staff('manager@example.test','Manager test','manager',false)");
    await expect(db.query("select public.admin_set_staff('owner@example.test','Owner test','waiter',false)")).rejects.toMatchObject({ message: "last_owner" });
    await asUser(manager);
    await expect(save(product, "product", category, productPayload, true, 3)).rejects.toMatchObject({ code: "42501" });
  });

  it("Storage solo acepta escritura operativa en la carpeta del actor", async () => {
    await asUser(waiter);
    await expect(db.query("insert into storage.objects(bucket_id,name) values('restaurant-media',$1)", [`${waiter}/test.webp`])).rejects.toMatchObject({ code: "42501" });
    await asUser(owner);
    await expect(db.query("insert into storage.objects(bucket_id,name) values('restaurant-media',$1)", [`${outsider}/test.webp`])).rejects.toMatchObject({ code: "42501" });
    const path = `${owner}/test.webp`;
    await db.query("insert into storage.objects(bucket_id,name) values('restaurant-media',$1)", [path]);
    await db.query("select public.admin_log_upload($1,100,'image/webp')", [path]);
    expect((await db.query("select action from public.admin_audit where record_id=$1", [path])).rows).toEqual([{ action: "UPLOAD" }]);
  });

  it("borra el producto, conserva su historial e impide falsificar auditoría", async () => {
    await asUser(owner);
    await db.query("select public.admin_delete_record($1,3)", [product]);
    expect((await db.query("select id from public.admin_records where id=$1", [product])).rows).toEqual([]);
    expect((await db.query("select action from public.admin_audit where record_id=$1 order by created_at", [product])).rows.map((row) => (row as { action: string }).action)).toContain("DELETE");
    await expect(db.query("insert into public.admin_audit(entity,record_id,action) values('fake','fake','INSERT')")).rejects.toMatchObject({ code: "42501" });
  });
});
