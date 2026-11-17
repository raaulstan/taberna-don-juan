import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const directory = join(process.cwd(), "lighthouse-report");
const allowed = ["/es", "/es/carta", "/es/bebidas", "/acceso"];
const mobile = process.argv.includes("--mobile");
const requested = process.argv.slice(2).filter((argument) => argument !== "--mobile");
const paths = requested.length ? requested : allowed;
if (paths.some((path) => !allowed.includes(path))) throw new Error("Ruta de auditoría no configurada.");
await mkdir(directory, { recursive: true });
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3200"], { stdio: "ignore", env: { ...process.env, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3200" } });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { if ((await fetch("http://127.0.0.1:3200/es")).ok) { ready = true; break; } } catch { /* Esperar al servidor local. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("El build no está disponible. Ejecuta npm run build antes de la auditoría.");
  browser = await chromium.launch({ headless: true, args: ["--remote-debugging-port=9229"] });
  for (const path of paths) {
    const result = await lighthouse(`http://127.0.0.1:3200${path}`, { port: 9229, logLevel: "error", output: ["html", "json"], onlyCategories: ["performance", "accessibility", "best-practices", "seo"], formFactor: mobile ? "mobile" : "desktop", screenEmulation: { mobile, width: mobile ? 390 : 1440, height: mobile ? 844 : 900, deviceScaleFactor: mobile ? 1.75 : 1, disabled: false }, throttlingMethod: mobile ? "simulate" : "provided" });
    if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message ?? "Lighthouse no produjo resultado.");
    const name = `${path.replaceAll("/", "-").slice(1)}${mobile ? "-mobile" : ""}`;
    await writeFile(join(directory, `${name}.html`), result.report[0]);
    await writeFile(join(directory, `${name}.json`), result.report[1]);
    console.info(JSON.stringify({ path, device: mobile ? "mobile" : "desktop", categories: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)])), lcpMs: result.lhr.audits["largest-contentful-paint"]?.numericValue, cls: result.lhr.audits["cumulative-layout-shift"]?.numericValue }));
  }
} finally { if (browser) await browser.close(); server.kill(); }
