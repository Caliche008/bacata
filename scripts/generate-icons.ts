// Generador de iconos PWA PROVISIONALES de Bacatá.
//
// Rasteriza el monograma de marca ("B" sobre verde esmeralda con anillo dorado)
// a los PNG que Android/PWA requieren, SIN añadir dependencias de rasterizado:
// usa un codificador PNG mínimo apoyado en `node:zlib` (incluido en Node). Esto
// evita sumar `sharp`/`canvas` solo para unos iconos provisionales.
//
// Produce:
//   - public/pwa-192x192.png        (icono estándar)
//   - public/pwa-512x512.png        (icono estándar grande)
//   - public/maskable-512x512.png   (maskable: ~20% de zona de seguridad)
//   - public/apple-touch-icon.png   (180x180, iOS/añadir a inicio)
//
// Los iconos son PROVISIONALES: se reemplazarán por el arte final de la mascota.
// Ejecutar: npx tsx scripts/generate-icons.ts
import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const PUBLIC_DIR = join(process.cwd(), 'public');

type RGBA = [number, number, number, number];

// Paleta de marca (brand.md).
const EMERALD: RGBA = [0x1f, 0x7a, 0x5a, 0xff];
const CREAM: RGBA = [0xfb, 0xf6, 0xec, 0xff];
const GOLD: RGBA = [0xe2, 0xa7, 0x2e, 0xff];

/** Lienzo RGBA simple en memoria. */
class Canvas {
  readonly size: number;
  readonly data: Uint8Array;

  constructor(size: number) {
    this.size = size;
    this.data = new Uint8Array(size * size * 4);
  }

  fill(color: RGBA): void {
    for (let i = 0; i < this.size * this.size; i += 1) {
      this.setIndex(i, color);
    }
  }

  private setIndex(i: number, [r, g, b, a]: RGBA): void {
    const o = i * 4;
    this.data[o] = r;
    this.data[o + 1] = g;
    this.data[o + 2] = b;
    this.data[o + 3] = a;
  }

  setPixel(x: number, y: number, color: RGBA): void {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
      return;
    }
    this.setIndex(y * this.size + x, color);
  }

  /** Rectángulo relleno (coordenadas enteras). */
  rect(x0: number, y0: number, w: number, h: number, color: RGBA): void {
    for (let y = y0; y < y0 + h; y += 1) {
      for (let x = x0; x < x0 + w; x += 1) {
        this.setPixel(x, y, color);
      }
    }
  }

  /** Anillo (círculo con grosor) centrado. */
  ring(cx: number, cy: number, radius: number, thickness: number, color: RGBA): void {
    const outer = radius;
    const inner = radius - thickness;
    for (let y = cy - outer; y <= cy + outer; y += 1) {
      for (let x = cx - outer; x <= cx + outer; x += 1) {
        const d = Math.hypot(x - cx, y - cy);
        if (d <= outer && d >= inner) {
          this.setPixel(x, y, color);
        }
      }
    }
  }
}

/** Dibuja una "B" blocky (barras + lóbulos) centrada, en color crema. */
function drawLetterB(canvas: Canvas, color: RGBA): void {
  const s = canvas.size;
  // Caja del glifo (centrada, ~44% del lienzo de alto).
  const h = Math.round(s * 0.44);
  const w = Math.round(h * 0.66);
  const x0 = Math.round((s - w) / 2);
  const y0 = Math.round((s - h) / 2);
  const stroke = Math.max(2, Math.round(w * 0.2));

  // Barra vertical izquierda.
  canvas.rect(x0, y0, stroke, h, color);
  // Barras horizontales: superior, media, inferior.
  canvas.rect(x0, y0, w, stroke, color);
  canvas.rect(x0, y0 + Math.round(h / 2) - Math.round(stroke / 2), w, stroke, color);
  canvas.rect(x0, y0 + h - stroke, w, stroke, color);
  // Barras verticales derechas (los dos lóbulos de la B).
  canvas.rect(x0 + w - stroke, y0, stroke, Math.round(h / 2), color);
  canvas.rect(x0 + w - stroke, y0 + Math.round(h / 2), stroke, Math.round(h / 2), color);
}

/** Renderiza el icono de marca a un lienzo del tamaño dado. */
function renderIcon(size: number, maskable: boolean): Canvas {
  const canvas = new Canvas(size);
  canvas.fill(EMERALD);

  const cx = Math.round(size / 2);
  const cy = Math.round(size / 2);
  // En maskable dejamos más margen (zona de seguridad ~20%).
  const ringRadius = Math.round(size * (maskable ? 0.3 : 0.36));
  const ringThickness = Math.max(2, Math.round(size * 0.03));
  canvas.ring(cx, cy, ringRadius, ringThickness, GOLD);

  drawLetterB(canvas, CREAM);
  return canvas;
}

// ---------- Codificador PNG mínimo (RGBA, sin dependencias) ----------

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new Uint8Array([...type].map((c) => c.charCodeAt(0)));
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(typeBytes), Buffer.from(data)]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(canvas: Canvas): Buffer {
  const { size, data } = canvas;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // profundidad de bits
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10); // compresión
  ihdr.writeUInt8(0, 11); // filtro
  ihdr.writeUInt8(0, 12); // entrelazado

  // Filas con byte de filtro 0 por línea.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    raw.set(data.subarray(y * stride, y * stride + stride), y * (stride + 1) + 1);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

async function writeIcon(name: string, size: number, maskable: boolean): Promise<void> {
  const png = encodePng(renderIcon(size, maskable));
  await writeFile(join(PUBLIC_DIR, name), png);
  console.log(`OK ${name} (${size}x${size}${maskable ? ', maskable' : ''}) — ${png.length} bytes`);
}

async function main(): Promise<void> {
  await writeIcon('pwa-192x192.png', 192, false);
  await writeIcon('pwa-512x512.png', 512, false);
  await writeIcon('maskable-512x512.png', 512, true);
  await writeIcon('apple-touch-icon.png', 180, false);
  console.log('Iconos PWA provisionales generados en public/.');
}

main().catch((error: unknown) => {
  console.error('Error generando iconos:', error);
  process.exit(1);
});
