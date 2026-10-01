// Geometría isométrica de las salas. Sin dependencias de Phaser para poder probarla.

/**
 * Píxeles del juego por "píxel de arte" de referencia. Con 2 la resolución interna se duplica
 * (spec 004): la sala se ve del mismo tamaño en pantalla, pero los sprites tienen el doble de detalle.
 */
export const PIXEL_SCALE = 2;

export const GAME_WIDTH = 480 * PIXEL_SCALE;
export const GAME_HEIGHT = 270 * PIXEL_SCALE;

export const TILE_WIDTH = 32 * PIXEL_SCALE;
export const TILE_HEIGHT = 16 * PIXEL_SCALE;
export const GRID_COLS = 12;
export const GRID_ROWS = 10;
/** Alto visible de la pared sobre el borde de la baldosa (sprite de 80 px menos 16 px de caída). */
export const WALL_HEIGHT = 32 * PIXEL_SCALE;

const ROOM_WIDTH = (GRID_COLS + GRID_ROWS) * (TILE_WIDTH / 2);
const ROOM_HEIGHT = (GRID_COLS + GRID_ROWS) * (TILE_HEIGHT / 2) + WALL_HEIGHT;
const VIEW_MARGIN = 8 * PIXEL_SCALE;

/** Centro de la baldosa (0, 0), calculado para que la sala completa quede centrada en el juego. */
export const ROOM_ORIGIN = {
  x: GAME_WIDTH / 2 - (GRID_COLS - GRID_ROWS) * (TILE_WIDTH / 4),
  y: GAME_HEIGHT / 2 - (GRID_COLS + GRID_ROWS - 2) * (TILE_HEIGHT / 4) + WALL_HEIGHT / 2,
};

/** Zoom de la vista general: la sala ocupa todo el espacio disponible. */
export const ROOM_ZOOM = Math.min(
  GAME_WIDTH / (ROOM_WIDTH + VIEW_MARGIN),
  GAME_HEIGHT / (ROOM_HEIGHT + VIEW_MARGIN),
);

/** Zoom al viajar a una estación. */
export const FOCUS_ZOOM = 2.4;

/** Duración del viaje de la cámara entre la vista general y una estación. */
export const CAMERA_TRAVEL_MS = 450;

/** Convierte una celda de la grilla isométrica al centro de la baldosa en coordenadas del mundo. */
export function isoToScreen(col: number, row: number) {
  return {
    x: ROOM_ORIGIN.x + (col - row) * (TILE_WIDTH / 2),
    y: ROOM_ORIGIN.y + (col + row) * (TILE_HEIGHT / 2),
  };
}

/** Coordenadas del mundo → coordenadas visibles del juego, con la cámara en la vista general. */
export function worldToView(point: { x: number; y: number }) {
  return {
    x: GAME_WIDTH / 2 + (point.x - GAME_WIDTH / 2) * ROOM_ZOOM,
    y: GAME_HEIGHT / 2 + (point.y - GAME_HEIGHT / 2) * ROOM_ZOOM,
  };
}

/**
 * Centro de cámara para que `point` aparezca en la fracción `viewFraction` de la vista
 * (0.5, 0.5 = centro) con el zoom de enfoque. Sirve para dejar la estación visible junto a la ficha.
 */
export function cameraCenterFor(
  point: { x: number; y: number },
  viewFraction: { x: number; y: number },
) {
  const viewWidth = GAME_WIDTH / FOCUS_ZOOM;
  const viewHeight = GAME_HEIGHT / FOCUS_ZOOM;
  return {
    x: point.x + (0.5 - viewFraction.x) * viewWidth,
    y: point.y + (0.5 - viewFraction.y) * viewHeight,
  };
}
