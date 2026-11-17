import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function dimensions() {
  const path = join(process.cwd(), "public/images/logo-oficial.meta.json");
  if (!existsSync(path) || !existsSync(join(process.cwd(), "public/images/logo-oficial.webp"))) return null;
  const value: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (value && typeof value === "object" && "width" in value && "height" in value && typeof value.width === "number" && typeof value.height === "number" && value.width > 0 && value.height > 0) return { width: value.width, height: value.height };
  throw new Error("Metadatos del logotipo no válidos. Ejecuta npm run assets:icons.");
}
export const officialLogo = dimensions();
export const hasOfficialLogo = Boolean(officialLogo);
export function officialLogoDataUrl() {
  const path = join(process.cwd(), "public/images/logo-social.png");
  return officialLogo && existsSync(path) ? `data:image/png;base64,${readFileSync(path).toString("base64")}` : null;
}
