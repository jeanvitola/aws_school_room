import spriteSizes from './sprite-sizes.json';

export interface SpriteSpec {
  /** Ancho de un cuadro, en píxeles de la resolución interna del juego. */
  width: number;
  height: number;
  /** Cuadros de animación en una tira horizontal (por defecto 1: imagen fija). */
  frames?: number;
  /** Cuadros por segundo de la animación. */
  frameRate?: number;
}

/**
 * Sprites en public/assets/sprites/<key>.png. `sprite-sizes.json` es la fuente de verdad para la
 * escena, los scripts de arte (scripts/convert-art.py, scripts/generate-placeholder-sprites.mjs)
 * y el test de contrato. Un sprite animado es una tira horizontal de `frames` cuadros.
 */
export const SPRITE_SIZES: Record<keyof typeof spriteSizes, SpriteSpec> = spriteSizes;

export type SpriteKey = keyof typeof spriteSizes;

export const SPRITE_KEYS = Object.keys(SPRITE_SIZES) as SpriteKey[];

export function frameCount(key: SpriteKey): number {
  return SPRITE_SIZES[key].frames ?? 1;
}
