import spriteSizes from './sprite-sizes.json';

/**
 * Sprites en public/assets/sprites/<key>.png y su tamaño en píxeles (a la resolución interna del
 * juego). `sprite-sizes.json` es la fuente de verdad para la escena, los scripts de arte
 * (scripts/convert-art.py, scripts/generate-placeholder-sprites.mjs) y el test de contrato.
 */
export const SPRITE_SIZES = spriteSizes;

export type SpriteKey = keyof typeof SPRITE_SIZES;

export const SPRITE_KEYS = Object.keys(SPRITE_SIZES) as SpriteKey[];
