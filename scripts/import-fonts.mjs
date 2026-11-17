import { access, writeFile } from "node:fs/promises";

// Fuentes OFL descargadas una sola vez, servidas localmente por next/font.
// El build nunca depende de Google Fonts o GitHub.
const destination = new URL("../public/fonts/", import.meta.url);
await access(destination);
const assets = [
  ["cormorant-garamond-latin.woff2", "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2"],
  ["cormorant-garamond-italic-latin.woff2", "https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2"],
  ["manrope-latin.woff2", "https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2"],
  ["Cormorant-Garamond-OFL.txt", "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/OFL.txt"],
  ["Manrope-OFL.txt", "https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt"],
];
for (const [filename, url] of assets) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar ${filename}: ${response.status}`);
  await writeFile(new URL(filename, destination), Buffer.from(await response.arrayBuffer()));
  console.info(`Importado: ${filename}`);
}
