import sharp from "sharp";

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// Matting del papel del original raster: conserva trazos/rosa y elimina también
// los huecos interiores de las letras. No se redibuja ni se modifica el original.
export async function prepareTransparentLogo(input) {
  const { data, info } = await sharp(input).resize({ width: 800, withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const pixels = width * height;
  const samples = [[], [], []];
  let transparentBorder = false;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (x > width * 0.06 && x < width * 0.94 && y > height * 0.06 && y < height * 0.94) continue;
    const offset = (y * width + x) * 4;
    if (data[offset + 3] < 32) { transparentBorder = true; continue; }
    if (luminance(data[offset], data[offset + 1], data[offset + 2]) > 185) for (let channel = 0; channel < 3; channel++) samples[channel].push(data[offset + channel]);
  }
  const paper = samples.map((values, channel) => { values.sort((a, b) => a - b); return values[Math.floor(values.length / 2)] ?? [244, 235, 218][channel]; });
  const cutoff = Math.max(200, luminance(...paper) - 18);
  const alpha = new Uint8Array(pixels);
  const core = new Uint8Array(pixels);
  const red = new Uint8Array(pixels);
  for (let index = 0; index < pixels; index++) {
    const offset = index * 4;
    const [r, g, b, originalAlpha] = data.subarray(offset, offset + 4);
    const light = luminance(r, g, b);
    const isRed = r - g > 20 && r - b > 25 && r > 100;
    const strongRed = isRed && r - g > 55 && g < 150;
    red[index] = Number(isRed);
    core[index] = Number(light < 140 || strongRed);
    const coverage = transparentBorder ? 1 : core[index] ? 1 : isRed ? clamp((paper[1] - g) / (paper[1] - 65)) : clamp((cutoff - light) / (cutoff - 140));
    alpha[index] = Math.round(coverage * originalAlpha);
  }

  // Descarta textura/granulado aislado que no pertenece a un trazo con tinta.
  if (!transparentBorder) {
    const visited = new Uint8Array(pixels);
    const queue = new Int32Array(pixels);
    for (let start = 0; start < pixels; start++) {
      if (visited[start] || !alpha[start]) continue;
      let head = 0; let tail = 1; let hasInk = false;
      queue[0] = start; visited[start] = 1;
      while (head < tail) {
        const index = queue[head++];
        hasInk ||= Boolean(core[index]);
        const x = index % width; const y = Math.floor(index / width);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx; const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (!visited[next] && alpha[next]) { visited[next] = 1; queue[tail++] = next; }
        }
      }
      if (!hasInk || tail < 3) for (let cursor = 0; cursor < tail; cursor++) alpha[queue[cursor]] = 0;
    }
  }

  const dark = Buffer.alloc(pixels * 4);
  const light = Buffer.alloc(pixels * 4);
  const cream = [244, 228, 200];
  for (let index = 0; index < pixels; index++) {
    const offset = index * 4;
    const coverage = alpha[index] / 255;
    dark[offset + 3] = light[offset + 3] = alpha[index];
    if (!coverage) continue;
    for (let channel = 0; channel < 3; channel++) {
      const original = data[offset + channel];
      const foreground = transparentBorder || coverage === 1 ? original : Math.round(clamp((original - (1 - coverage) * paper[channel]) / coverage, 0, 255));
      dark[offset + channel] = foreground;
      light[offset + channel] = red[index] ? foreground : cream[channel];
    }
  }
  const encode = (buffer) => sharp(buffer, { raw: { width, height, channels: 4 } }).png().toBuffer();
  const border = { top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } };
  const darkImage = await sharp(await encode(dark)).trim({ threshold: 0 }).extend(border).png().toBuffer({ resolveWithObject: true });
  const lightImage = await sharp(await encode(light)).trim({ threshold: 0 }).extend(border).png().toBuffer();
  return { dark: darkImage.data, light: lightImage, width: darkImage.info.width, height: darkImage.info.height };
}
