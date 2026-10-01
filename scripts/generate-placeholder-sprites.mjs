// Genera sprites pixel art placeholder (PNG) en public/assets/sprites/.
// Uso: node scripts/generate-placeholder-sprites.mjs
// Los sprites son propios del proyecto (sin licencias de terceros). Reemplázalos por el arte final
// manteniendo el mismo nombre de archivo y tamaño.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT_DIR = new URL('../public/assets/sprites/', import.meta.url);
const SIZES_FILE = new URL('../src/scene/sprite-sizes.json', import.meta.url);
const MANIFEST_FILE = new URL('../art/manifest.json', import.meta.url);

// --- Codificador PNG mínimo (RGBA 8 bits) ---
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(width, height, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bits por canal
  header[9] = 6; // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filtro: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixels[y * width + x];
      raw.set([r, g, b, a], y * (width * 4 + 1) + 1 + x * 4);
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Paleta ---
const hex = (value) => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
  255,
];
const TRANSPARENT = [0, 0, 0, 0];
const PALETTE = {
  '.': TRANSPARENT,
  k: hex('#1b1626'), // contorno
  w: hex('#f4efe6'), // blanco cálido
  g: hex('#8b8fa3'), // gris
  d: hex('#4a4e63'), // gris oscuro
  o: hex('#ff9900'), // naranja AWS
  y: hex('#ffd166'), // amarillo
  p: hex('#8e5bd6'), // morado
  b: hex('#3e8ed0'), // azul
  c: hex('#7fd1e8'), // cian
  n: hex('#2fb37a'), // verde
  r: hex('#e0524f'), // rojo
};

function fromCharMap(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const pixels = rows.flatMap((row) => [...row].map((char) => PALETTE[char] ?? TRANSPARENT));
  return { width, height, pixels };
}

// --- Objetos de servicio (16×16) ---
const SERVICES = {
  ec2: [
    '................',
    '..kkkkkkkkkkkk..',
    '..kddddddddddk..',
    '..kdoooooooodk..',
    '..kdkkkkkkkkdk..',
    '..kdgnggggggdk..',
    '..kdddddddddk...',
    '..kdoooooooodk..',
    '..kdkkkkkkkkdk..',
    '..kdgngggrggdk..',
    '..kddddddddddk..',
    '..kdoooooooodk..',
    '..kdkkkkkkkkdk..',
    '..kddddddddddk..',
    '..kkkkkkkkkkkk..',
    '...kk......kk...',
  ],
  lambda: [
    '................',
    '...kkkkkkkkkk...',
    '..kooooooooook..',
    '..kokkkooooook..',
    '..kooookooooook.',
    '..koooookoooook.',
    '..kooooookooook.',
    '..koooookkooook.',
    '..kooookookoook.',
    '..koookooookook.',
    '..kookoooooookk.',
    '..kokooooooookk.',
    '..kooooooooook..',
    '...kkkkkkkkkk...',
    '................',
    '................',
  ],
  ecs: [
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kbbbbbbbbbbbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbbbbbbbbbbbbk.',
    '.kkkkkkkkkkkkkk.',
    '.kbbbbbbbbbbbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbcbcbcbcbcbbk.',
    '.kbbbbbbbbbbbbk.',
    '.kkkkkkkkkkkkkk.',
    '................',
  ],
  eks: [
    '................',
    '.......kk.......',
    '......kbbk......',
    '..kk.kbwwbk.kk..',
    '..kbkkbwwbkkbk..',
    '...kbbbbbbbbk...',
    '...kbbwkkwbbk...',
    '.kkbbbkwwkbbbkk.',
    '.kwwbbkwwkbbwwk.',
    '.kkbbbkwwkbbbkk.',
    '...kbbwkkwbbk...',
    '...kbbbbbbbbk...',
    '..kbkkbwwbkkbk..',
    '..kk.kbwwbk.kk..',
    '......kbbk......',
    '.......kk.......',
  ],
  fargate: [
    '................',
    '.....kkkkk......',
    '....kwwwwwk.....',
    '..kkwwwwwwwkk...',
    '.kwwwwwwwwwwwk..',
    '.kkkkkkkkkkkkk..',
    '................',
    '..kkkkkkkkkkkk..',
    '..kooooooooook..',
    '..koyoyoyoyook..',
    '..koyoyoyoyook..',
    '..koyoyoyoyook..',
    '..kooooooooook..',
    '..kkkkkkkkkkkk..',
    '................',
    '................',
  ],
  autoscaling: [
    '................',
    '.......kk.......',
    '......knnk......',
    '.....knnnnk.....',
    '....kkknnkkk....',
    '......knnk......',
    '..kkkkkkkkkkkk..',
    '..kddddddddddk..',
    '..kddddddddddk..',
    '..kkkkkkkkkkkk..',
    '......krrk......',
    '....kkkrrkkk....',
    '.....krrrrk.....',
    '......krrk......',
    '.......kk.......',
    '................',
  ],
  elb: [
    '................',
    '.......kk.......',
    '......kppk......',
    '......kppk......',
    '.......kk.......',
    '......kppk......',
    '.....kp..pk.....',
    '....kp....pk....',
    '...kp......pk...',
    '..kp........pk..',
    '.kkkk..kk..kkkk.',
    '.kcck.kcck.kcck.',
    '.kcck.kcck.kcck.',
    '.kkkk.kkkk.kkkk.',
    '................',
    '................',
  ],
};

// --- Utilidades de dibujo procedural ---
function createCanvas(width, height) {
  return { width, height, pixels: Array.from({ length: width * height }, () => TRANSPARENT) };
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  canvas.pixels[y * canvas.width + x] = color;
}

function insidePolygon(px, py, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function fillPolygon(canvas, points, color) {
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (insidePolygon(x + 0.5, y + 0.5, points)) setPixel(canvas, x, y, color);
    }
  }
}

/** Caja isométrica: rombo superior centrado en (cx, cy) con caras izquierda y derecha de altura h. */
function drawIsoBox(canvas, { cx, cy, halfW, h, top, left, right }) {
  const halfH = halfW / 2;
  fillPolygon(canvas, [[cx - halfW, cy], [cx, cy + halfH], [cx, cy + halfH + h], [cx - halfW, cy + h]], left);
  fillPolygon(canvas, [[cx, cy + halfH], [cx + halfW, cy], [cx + halfW, cy + h], [cx, cy + halfH + h]], right);
  fillPolygon(canvas, [[cx, cy - halfH], [cx + halfW, cy], [cx, cy + halfH], [cx - halfW, cy]], top);
}

// --- Baldosa isométrica de piso de laboratorio (32×16) ---
function isoFloorTile(width = 32, height = 16) {
  const fill = hex('#aab4c3');
  const light = hex('#b9c2cf');
  const edge = hex('#7d889a');
  const pixels = [];
  const halfW = width / 2;
  const halfH = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x + 0.5 - halfW) / halfW;
      const dy = Math.abs(y + 0.5 - halfH) / halfH;
      const distance = dx + dy;
      if (distance > 1) pixels.push(TRANSPARENT);
      else if (distance > 0.9) pixels.push(edge);
      else pixels.push(y < halfH ? light : fill);
    }
  }
  return { width, height, pixels };
}

// --- Pared isométrica de laboratorio (16×40): encaja sobre un borde de baldosa ---
// 'left'  = arista superior baja hacia la derecha (pared del fondo derecho).
// 'right' = arista superior baja hacia la izquierda (pared del fondo izquierdo).
function isoWallTile(side, width = 16, height = 40) {
  const face = hex(side === 'left' ? '#d9dee6' : '#c6ccd6');
  const panel = hex(side === 'left' ? '#cdd3dc' : '#b8bfca');
  const baseboard = hex('#5b6577');
  const edge = hex('#4a5263');
  const slope = 0.5;
  const drop = width * slope;
  const pixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = side === 'left' ? x * slope : (width - 1 - x) * slope;
      const top = offset;
      const bottom = height - drop + offset;
      if (y < top || y > bottom) pixels.push(TRANSPARENT);
      else if (y - top < 1 || bottom - y < 1) pixels.push(edge);
      else if (bottom - y < 5) pixels.push(baseboard);
      else pixels.push(x % 16 === 0 ? edge : y - top < 14 ? face : panel);
    }
  }
  return { width, height, pixels };
}

// --- Estación de trabajo (32×32): escritorio + monitor + teclado ---
function workstation() {
  const canvas = createCanvas(32, 32);
  // Escritorio
  drawIsoBox(canvas, {
    cx: 16, cy: 17, halfW: 14, h: 7,
    top: hex('#e6e9ee'), left: hex('#8b95a7'), right: hex('#6f7a8d'),
  });
  // Teclado
  drawIsoBox(canvas, {
    cx: 12, cy: 20, halfW: 4, h: 1,
    top: hex('#3a4150'), left: hex('#2a2f3a'), right: hex('#2a2f3a'),
  });
  // Monitor: la cara izquierda es la pantalla (mira hacia el frente)
  drawIsoBox(canvas, {
    cx: 18, cy: 4, halfW: 7, h: 11,
    top: hex('#2a2f3a'), left: hex('#7fd1e8'), right: hex('#1f2430'),
  });
  // Marco de la pantalla y brillo
  for (let i = 0; i < 7; i++) {
    setPixel(canvas, 11 + i, 4 + Math.floor(i / 2), hex('#1f2430'));
    setPixel(canvas, 11 + i, 15 + Math.floor(i / 2), hex('#1f2430'));
  }
  for (let y = 5; y < 15; y++) setPixel(canvas, 11, y, hex('#1f2430'));
  setPixel(canvas, 13, 7, hex('#f4efe6'));
  setPixel(canvas, 14, 8, hex('#f4efe6'));
  // Base del monitor
  setPixel(canvas, 18, 16, hex('#2a2f3a'));
  setPixel(canvas, 18, 17, hex('#2a2f3a'));
  return canvas;
}

/** Amplía un sprite por un factor entero (vecino más cercano: no deforma los píxeles). */
function upscale({ width, height, pixels }, factor) {
  const out = [];
  for (let y = 0; y < height * factor; y++) {
    for (let x = 0; x < width * factor; x++) {
      out.push(pixels[Math.floor(y / factor) * width + Math.floor(x / factor)]);
    }
  }
  return { width: width * factor, height: height * factor, pixels: out };
}

const targetSizes = JSON.parse(readFileSync(SIZES_FILE, 'utf8'));
// Los sprites que vienen del arte del autor (spec 004) no se sobrescriben con placeholders.
const authorArt = existsSync(MANIFEST_FILE)
  ? new Set(JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')).pieces.map((piece) => piece.sprite))
  : new Set();

mkdirSync(OUT_DIR, { recursive: true });
const sprites = {
  'floor-tile': isoFloorTile(),
  'wall-left': isoWallTile('left'),
  'wall-right': isoWallTile('right'),
  workstation: workstation(),
  ...Object.fromEntries(
    Object.entries(SERVICES).map(([id, rows]) => [`service-${id}`, fromCharMap(rows)]),
  ),
};
for (const [name, sprite] of Object.entries(sprites)) {
  if (authorArt.has(name)) {
    console.log(`- ${name}.png (arte del autor, se omite)`);
    continue;
  }
  const target = targetSizes[name];
  const factor = target.width / sprite.width;
  if (!Number.isInteger(factor) || sprite.height * factor !== target.height) {
    throw new Error(`${name}: ${sprite.width}x${sprite.height} no escala a ${target.width}x${target.height}`);
  }
  const { width, height, pixels } = upscale(sprite, factor);
  writeFileSync(new URL(`${name}.png`, OUT_DIR), encodePng(width, height, pixels));
  console.log(`✓ ${name}.png (${width}×${height})`);
}
