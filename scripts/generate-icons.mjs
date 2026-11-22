// Genera los íconos PNG de la PWA sin dependencias (solo node:zlib).
// Dibuja un cuadrado redondeado con degradado morado→rosa y una palomita blanca.
// Uso: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../public/icons/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const C1 = [0x7c, 0x3a, 0xed];
const C2 = [0xec, 0x48, 0x99];

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Distancia de un punto a un segmento
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Distancia con signo a un rectángulo redondeado (negativa = dentro)
function roundRectDist(x, y, size, r) {
  const h = size / 2;
  const qx = Math.abs(x - h) - (h - r);
  const qy = Math.abs(y - h) - (h - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function drawIcon(size, { maskable = false } = {}) {
  const s = size / 512; // coordenadas de diseño en 512x512
  const radius = maskable ? 0 : 112 * s;
  // En maskable la palomita se encoge para quedar dentro de la zona segura
  const k = maskable ? 0.8 : 1;
  const c = 256 * s;
  const pt = (x, y) => [c + (x * s - c) * k, c + (y * s - c) * k];
  const [ax, ay] = pt(150, 265), [bx, by] = pt(220, 335), [cx, cy] = pt(362, 185);
  const stroke = 24 * s * k;

  const px = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = x + 0.5, fy = y + 0.5;
      const bgA = maskable ? 1 : clamp01(0.5 - roundRectDist(fx, fy, size, radius));
      const t = clamp01((fx + fy) / (2 * size));
      let col = C1.map((v, i) => v + (C2[i] - v) * t);

      const d = Math.min(segDist(fx, fy, ax, ay, bx, by), segDist(fx, fy, bx, by, cx, cy));
      const checkA = clamp01(stroke + 0.5 - d);
      col = col.map((v) => v + (255 - v) * checkA);

      const i = (y * size + x) * 4;
      px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = Math.round(bgA * 255);
    }
  }
  return encodePNG(size, size, px);
}

// ---- Codificador PNG mínimo (RGBA 8 bits) ----
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8 bits, RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const icons = {
  'icon-192.png': drawIcon(192),
  'icon-512.png': drawIcon(512),
  'icon-maskable-512.png': drawIcon(512, { maskable: true }),
};
for (const [name, png] of Object.entries(icons)) {
  writeFileSync(new URL(name, OUT), png);
  console.log(`✔ public/icons/${name}`);
}
