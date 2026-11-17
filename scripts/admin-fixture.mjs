// Solo runner E2E: Auth/Redis/Storage HTTP locales y PostgreSQL embebido.
// No se importa desde src, no abre conexiones remotas ni habilita bypass en la app.
import { createServer } from "node:https";
import { spawn, execFileSync } from "node:child_process";
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const root = process.cwd();
await mkdir(join(root, ".test-runtime"), { recursive: true });
const temporary = await mkdtemp(join(root, ".test-runtime", "admin-"));
const cert = join(temporary, "certificate.pem");
const key = join(temporary, "key.pem");
const openssl = process.platform === "win32" ? "C:\\Program Files\\Git\\usr\\bin\\openssl.exe" : "openssl";
execFileSync(openssl, ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", key, "-out", cert, "-subj", "/CN=localhost", "-days", "1", "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost"], { stdio: "ignore" });
const db = new PGlite();
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
for (const name of ["20261116000100_staff_members.sql", "20261117000200_administration.sql"]) await db.exec(await readFile(join(root, "supabase/migrations", name), "utf8"));
const accounts = [
  { id: "10000000-0000-4000-8000-000000000001", email: "owner@example.test", role: "owner", name: "Owner test" },
  { id: "10000000-0000-4000-8000-000000000002", email: "manager@example.test", role: "manager", name: "Manager test" },
  { id: "10000000-0000-4000-8000-000000000003", email: "waiter@example.test", role: "waiter", name: "Waiter test" },
  { id: "10000000-0000-4000-8000-000000000004", email: "outsider@example.test", role: null, name: "Outsider test" },
];
for (const account of accounts) {
  await db.query("insert into auth.users values($1,$2)", [account.id, account.email]);
  if (account.role) await db.query("insert into public.staff_members(user_id,role,display_name) values($1,$2,$3)", [account.id, account.role, account.name]);
}
const jwtSecret = randomBytes(32);
const redisToken = randomUUID();
const revoked = new Set();
const counters = new Map();
const images = new Map();
const backend = "https://127.0.0.1:3344";
const password = "Fixture-password-2026!";
function token(account) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: account.id, aud: "authenticated", role: "authenticated", email: account.email, iss: `${backend}/auth/v1`, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+3600, jti: randomUUID() })).toString("base64url");
  return `${header}.${payload}.${createHmac("sha256", jwtSecret).update(`${header}.${payload}`).digest("base64url")}`;
}
function authenticate(request) {
  const value = request.headers.authorization?.replace(/^Bearer /i, "") ?? "";
  const [header, payload, signature] = value.split(".");
  if (!header || !payload || !signature || revoked.has(value)) return null;
  const expected = createHmac("sha256", jwtSecret).update(`${header}.${payload}`).digest();
  const actual = Buffer.from(signature, "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
  return claims.exp > Date.now()/1000 ? accounts.find((account) => account.id === claims.sub) : null;
}
function user(account) { return { id: account.id, aud: "authenticated", role: "authenticated", email: account.email, app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {}, identities: [], created_at: "2026-01-01T00:00:00Z", email_confirmed_at: "2026-01-01T00:00:00Z" }; }
function respond(response, status, data, extra = {}) { response.writeHead(status, { "Content-Type": "application/json", ...extra }); response.end(data === undefined ? undefined : JSON.stringify(data)); }
let queue = Promise.resolve();
async function database(account, callback) {
  const previous = queue;
  let release;
  queue = new Promise((resolve) => { release = resolve; });
  await previous;
  try {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub','${account?.id ?? ""}',false); set role ${account ? "authenticated" : "anon"};`);
    return await callback();
  } finally { release(); }
}
const server = createServer({ key: await readFile(key), cert: await readFile(cert) }, async (request, response) => {
  const url = new URL(request.url ?? "/", backend);
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  let data = {};
  if (request.headers["content-type"]?.includes("application/json") && body.length) data = JSON.parse(body.toString());
  const account = authenticate(request);
  try {
    if (url.pathname === "/redis") {
      if (request.headers.authorization !== `Bearer ${redisToken}`) return respond(response, 401, {});
      const value = (counters.get(data[3]) ?? 0) + 1; counters.set(data[3], value);
      return respond(response, 200, { result: value });
    }
    if (url.pathname === "/auth/v1/token") {
      const match = accounts.find((item) => item.email === data.email);
      if (!match || data.password !== (match.password ?? password)) return respond(response, 400, { error: "invalid_grant", error_description: "Invalid fixture credentials" });
      return respond(response, 200, { access_token: token(match), refresh_token: randomUUID(), expires_in: 3600, token_type: "bearer", user: user(match) });
    }
    if (url.pathname === "/auth/v1/user") {
      if (account && request.method === "PUT" && typeof data.password === "string") account.password = data.password;
      return account ? respond(response, 200, user(account)) : respond(response, 401, { code: "bad_jwt", msg: "Invalid fixture session" });
    }
    if (url.pathname === "/auth/v1/logout") { revoked.add(request.headers.authorization?.replace(/^Bearer /i, "")); return respond(response, 204); }
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const name = url.pathname.split("/").at(-1);
      const definitions = {
        admin_save_record: ["select public.admin_save_record($1::uuid,$2,$3::uuid,$4::jsonb,$5,$6)", [data.p_id,data.p_kind,data.p_parent_id,JSON.stringify(data.p_payload),data.p_published,data.p_version]],
        admin_delete_record: ["select public.admin_delete_record($1::uuid,$2)", [data.p_id,data.p_version]],
        admin_set_staff: ["select public.admin_set_staff($1,$2,$3,$4)", [data.p_email,data.p_name,data.p_role,data.p_active]],
        admin_list_staff: ["select * from public.admin_list_staff()", []],
        admin_log_upload: ["select public.admin_log_upload($1,$2,$3)", [data.p_path,data.p_size,data.p_mime]],
      };
      const definition = definitions[name];
      if (!definition) return respond(response, 404, {});
      const result = await database(account, () => db.query(definition[0], definition[1]));
      return respond(response, 200, name === "admin_list_staff" ? result.rows : result.rows[0]?.[name] ?? null);
    }
    if (url.pathname.startsWith("/rest/v1/")) {
      const table = url.pathname.split("/").at(-1);
      if (!["staff_members","admin_records","admin_audit"].includes(table)) return respond(response, 404, {});
      const allowed = new Set(["id","user_id","role","active","display_name","created_at","kind","parent_id","payload","published","version","updated_at","actor_id","entity","record_id","action"]);
      const fields = (url.searchParams.get("select") ?? "*").split(",").map((field) => field.trim());
      if (fields.some((field) => !allowed.has(field))) return respond(response, 400, { message: "Unsupported fixture projection" });
      const values = []; const where = [];
      for (const [column,value] of url.searchParams) if (allowed.has(column) && value.startsWith("eq.")) { values.push(value.slice(3)); where.push(`${column}=$${values.length}`); }
      const order = url.searchParams.get("order")?.split(".");
      const sorting = order && allowed.has(order[0]) ? ` order by ${order[0]} ${order[1] === "desc" ? "desc" : "asc"}` : "";
      const result = await database(account, () => db.query(`select ${fields.join(",")} from public.${table}${where.length ? ` where ${where.join(" and ")}` : ""}${sorting}`, values));
      const count = result.rows.length;
      const rows = result.rows.slice(0, Math.min(Number(url.searchParams.get("limit") ?? 1000), 1000));
      return respond(response, 200, request.method === "HEAD" ? undefined : rows, { "Content-Range": `${count ? `0-${count-1}` : "*"}/${count}` });
    }
    if (url.pathname.startsWith("/storage/v1/object/restaurant-media/") && request.method === "POST") {
      const path = decodeURIComponent(url.pathname.slice("/storage/v1/object/restaurant-media/".length));
      await database(account, () => db.query("insert into storage.objects(bucket_id,name) values('restaurant-media',$1)", [path]));
      images.set(path, body);
      return respond(response, 200, { Key: `restaurant-media/${path}` });
    }
    if (url.pathname === "/storage/v1/object/restaurant-media" && request.method === "DELETE") {
      for (const path of data.prefixes ?? []) { await database(account, () => db.query("delete from storage.objects where bucket_id='restaurant-media' and name=$1", [path])); images.delete(path); }
      return respond(response, 200, []);
    }
    return respond(response, 404, { message: "Not implemented by test fixture" });
  } catch (error) { return respond(response, error.code === "42501" ? 403 : 400, { code: error.code ?? "P0001", message: error.message, details: null, hint: null }); }
});
await new Promise((resolve) => server.listen(3344, "127.0.0.1", resolve));
const env = { ...process.env, NODE_EXTRA_CA_CERTS: cert, NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3310", NEXT_PUBLIC_ADMIN_URL: "", NEXT_PUBLIC_SUPABASE_URL: backend, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_admin_fixture_only", PUBLIC_DATA_SOURCE: "local", UPSTASH_REDIS_REST_URL: `${backend}/redis`, UPSTASH_REDIS_REST_TOKEN: redisToken, RATE_LIMIT_SECRET: randomBytes(32).toString("hex") };
execFileSync(process.execPath, ["scripts/generate-icons.mjs"], { cwd: root, env, stdio: "inherit" });
const builder = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { cwd: root, env, stdio: "inherit" });
const exitCode = await new Promise((resolve) => builder.on("exit", resolve));
if (exitCode !== 0) throw new Error("Admin fixture build failed");
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3310"], { cwd: root, env, stdio: "inherit" });
async function close() { app.kill(); server.close(); await db.close(); await rm(temporary, { recursive: true, force: true }); process.exit(0); }
process.on("SIGTERM", () => void close()); process.on("SIGINT", () => void close());
