import { access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { prepareTransparentLogo } from "./transparent-logo.mjs";

const source = new URL("../public/icon.svg", import.meta.url);
const destination = new URL("../public/icons/", import.meta.url);
await access(destination);
const faviconSource = new URL("../public/images/brand.webp", import.meta.url);
await sharp(fileURLToPath(faviconSource)).resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("favicon-brand.png", destination)));
// ICO multirresolución y ruta raíz para navegadores que buscan /favicon.ico.
const faviconSizes = [16, 32, 48];
const faviconImages = await Promise.all(faviconSizes.map((size) => sharp(fileURLToPath(faviconSource)).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toBuffer()));
const faviconHeader = Buffer.alloc(6 + faviconSizes.length * 16);
faviconHeader.writeUInt16LE(1, 2);
faviconHeader.writeUInt16LE(faviconSizes.length, 4);
let faviconOffset = faviconHeader.length;
for (const [index, size] of faviconSizes.entries()) {
  const entry = 6 + index * 16;
  faviconHeader[entry] = faviconHeader[entry + 1] = size;
  faviconHeader.writeUInt16LE(1, entry + 4);
  faviconHeader.writeUInt16LE(32, entry + 6);
  faviconHeader.writeUInt32LE(faviconImages[index].length, entry + 8);
  faviconHeader.writeUInt32LE(faviconOffset, entry + 12);
  faviconOffset += faviconImages[index].length;
}
await writeFile(new URL("../public/favicon.ico", import.meta.url), Buffer.concat([faviconHeader, ...faviconImages]));

const originalLogo = new URL("../public/images/logo-oficial.png", import.meta.url);
let official = false;
let transparent;
try { await access(originalLogo); official = true; } catch { /* Pendiente de aportar el archivo original. */ }
if (official) {
  transparent = await prepareTransparentLogo(fileURLToPath(originalLogo));
  const output = new URL("../public/images/logo-oficial.webp", import.meta.url);
  const metadata = await sharp(transparent.dark).webp({ lossless: true }).toFile(fileURLToPath(output));
  await sharp(transparent.light).webp({ lossless: true }).toFile(fileURLToPath(new URL("../public/images/logo-oficial-claro.webp", import.meta.url)));
  await sharp(transparent.dark).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("../public/images/logo-oficial-transparente.png", import.meta.url)));
  await sharp(transparent.light).resize({ width: 440, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("../public/images/logo-social.png", import.meta.url)));
  await writeFile(new URL("../public/images/logo-oficial.meta.json", import.meta.url), JSON.stringify({ width: metadata.width, height: metadata.height }));
}

await Promise.all(
  [
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["apple-touch-icon.png", 180],
    ["maskable-512.png", 512],
  ].map(async ([name, size]) => {
    if (!official) return sharp(fileURLToPath(source)).resize(size, size).png().toFile(fileURLToPath(new URL(name, destination)));
    const mark = await sharp(transparent.dark).resize({ width: Math.round(size * 0.64), height: Math.round(size * 0.64), fit: "inside" }).png().toBuffer();
    return sharp({ create: { width: size, height: size, channels: 4, background: "#F4E4C8" } }).composite([{ input: mark, gravity: "centre" }]).png().toFile(fileURLToPath(new URL(name, destination)));
  }),
);
