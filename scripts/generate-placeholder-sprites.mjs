// Genera sprites pixel art placeholder (PNG) en public/assets/sprites/.
// Uso: node scripts/generate-placeholder-sprites.mjs
// Los sprites son propios del proyecto (sin licencias de terceros). Reemplázalos por el arte final
// manteniendo el mismo nombre de archivo y tamaño.
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const OUT_DIR = new URL('../public/assets/sprites/', import.meta.url);

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

// --- Baldosa isométrica de piso (32×16) ---
function isoFloorTile(width = 32, height = 16) {
  const fill = hex('#c89b6d');
  const light = hex('#d9b183');
  const edge = hex('#8a6440');
  const pixels = [];
  const halfW = width / 2;
  const halfH = height / 2;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x + 0.5 - halfW) / halfW;
      const dy = Math.abs(y + 0.5 - halfH) / halfH;
      const distance = dx + dy;
      if (distance > 1) pixels.push(TRANSPARENT);
      else if (distance > 0.88) pixels.push(edge);
      else pixels.push((x + y) % 8 < 4 ? fill : light);
    }
  }
  return { width, height, pixels };
}

// --- Pared isométrica (16×40): encaja sobre un borde de baldosa (16 px de ancho, 8 px de caída) ---
// 'left'  = arista superior baja hacia la derecha (pared del fondo derecho).
// 'right' = arista superior baja hacia la izquierda (pared del fondo izquierdo).
function isoWallTile(side, width = 16, height = 40) {
  const face = hex(side === 'left' ? '#7a4f35' : '#6a432c');
  const plank = hex(side === 'left' ? '#8d5d3f' : '#7a4f35');
  const edge = hex('#3b2618');
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
      else pixels.push(x % 8 === 0 ? edge : x % 8 < 4 ? face : plank);
    }
  }
  return { width, height, pixels };
}

mkdirSync(OUT_DIR, { recursive: true });
const sprites = {
  'floor-tile': isoFloorTile(),
  'wall-left': isoWallTile('left'),
  'wall-right': isoWallTile('right'),
  ...Object.fromEntries(
    Object.entries(SERVICES).map(([id, rows]) => [`service-${id}`, fromCharMap(rows)]),
  ),
};
for (const [name, { width, height, pixels }] of Object.entries(sprites)) {
  writeFileSync(new URL(`${name}.png`, OUT_DIR), encodePng(width, height, pixels));
  console.log(`✓ ${name}.png (${width}×${height})`);
}
