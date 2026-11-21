import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());

const errors = [];
function origin(name) {
  const value = process.env[name];
  if (!value) { errors.push(`${name}: falta configurar`); return; }
  try { const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash || ["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error(); }
  catch { errors.push(`${name}: debe ser un origen HTTPS de producción, sin rutas ni credenciales`); }
}
origin("NEXT_PUBLIC_SITE_URL");
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
else console.info("Origen HTTPS de producción válido.");
