import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

const errors = [];
function origin(name, required = true) {
  const value = process.env[name];
  if (!value) { if (required) errors.push(`${name}: falta configurar`); return; }
  try { const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash || ["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error(); }
  catch { errors.push(`${name}: debe ser un origen HTTPS de producción, sin rutas ni credenciales`); }
}
origin("NEXT_PUBLIC_SITE_URL"); origin("NEXT_PUBLIC_SUPABASE_URL"); origin("NEXT_PUBLIC_ADMIN_URL", false); origin("UPSTASH_REDIS_REST_URL");
if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "")) errors.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: falta una publishable key válida");
if (!process.env.UPSTASH_REDIS_REST_TOKEN) errors.push("UPSTASH_REDIS_REST_TOKEN: falta configurar");
if ((process.env.RATE_LIMIT_SECRET?.length ?? 0) < 32) errors.push("RATE_LIMIT_SECRET: requiere al menos 32 caracteres aleatorios");
if (!["local", "supabase"].includes(process.env.PUBLIC_DATA_SOURCE ?? "local")) errors.push("PUBLIC_DATA_SOURCE: utiliza local o supabase");
if (Boolean(process.env.RESEND_API_KEY) !== Boolean(process.env.RESEND_FROM_EMAIL)) errors.push("Resend: configura clave y remitente conjuntamente o deja ambos vacíos");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.info("Formato de variables de producción válido. Esto no verifica DNS, migraciones, accesos, dominio remitente ni conectividad remota.");
