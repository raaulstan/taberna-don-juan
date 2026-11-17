import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Importación explícita y reproducible. No se ejecuta durante build ni en producción.
// Procedencia y límites editoriales: docs/content-sources.md.
const destination = new URL("../public/images/", import.meta.url);
await access(destination);
const bucket = "https://buckettabernadonjuan8791.s3.us-east-1.amazonaws.com/";
const assets = [
  ["brand.webp", "Banners/IconLogo.svg", 120],
  ["tavern-atmosphere.webp", "Categorias/CabeceraNosotros.webp", 700],
  ["table-atmosphere.webp", "Categorias/CabeceraContacto.webp", 700],
  ["tapas.webp", "Categorias/Tapas.webp", 960],
  ["rice.webp", "Categorias/Arroces.webp", 960],
  ["seafood.webp", "Categorias/De+la+mar.webp", 960],
  ["desserts.webp", "Categorias/CabeceraPostres.webp", 700],
];

for (const [filename, path, width] of assets) {
  const response = await fetch(bucket + path);
  if (!response.ok) throw new Error(`No se puede importar ${path}: HTTP ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(fileURLToPath(new URL(filename, destination)));
  console.info(`Importado: ${filename}`);
}
