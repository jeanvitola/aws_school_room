import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SPRITE_KEYS, SPRITE_SIZES } from '../../src/scene/sprites';

const SPRITES_DIR = new URL('../../public/assets/sprites/', import.meta.url);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const COLOR_TYPE_RGBA = 6;

function readPngHeader(file: URL) {
  const bytes = readFileSync(file);
  return {
    isPng: bytes.subarray(0, 8).equals(PNG_SIGNATURE),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
}

describe('sprite contract (spec 004, FR-007)', () => {
  it.each(SPRITE_KEYS)('%s exists, has transparency and its declared size', (key) => {
    const file = new URL(`${key}.png`, SPRITES_DIR);
    expect(existsSync(file)).toBe(true);

    const header = readPngHeader(file);
    expect(header.isPng).toBe(true);
    expect(header.colorType).toBe(COLOR_TYPE_RGBA);
    expect({ width: header.width, height: header.height }).toEqual(SPRITE_SIZES[key]);
  });
});
