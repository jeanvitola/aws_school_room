// Geometría isométrica de las salas. Sin dependencias de Phaser para poder probarla.

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

export const TILE_WIDTH = 32;
export const TILE_HEIGHT = 16;
export const GRID_SIZE = 8;

/** Centro de la baldosa (0, 0) en coordenadas del juego. */
export const ROOM_ORIGIN = {
  x: GAME_WIDTH / 2,
  y: (GAME_HEIGHT - GRID_SIZE * TILE_HEIGHT) / 2 + 24,
};

/** Convierte una celda de la grilla isométrica al centro de la baldosa en coordenadas del juego. */
export function isoToScreen(col: number, row: number) {
  return {
    x: ROOM_ORIGIN.x + (col - row) * (TILE_WIDTH / 2),
    y: ROOM_ORIGIN.y + (col + row) * (TILE_HEIGHT / 2),
  };
}

/** Zoom de la cámara de la sala (centrado en el centro del juego). */
export const ROOM_ZOOM = 1.3;

/** Convierte coordenadas del mundo a coordenadas visibles del juego aplicando el zoom de la cámara. */
export function worldToView(point: { x: number; y: number }) {
  return {
    x: GAME_WIDTH / 2 + (point.x - GAME_WIDTH / 2) * ROOM_ZOOM,
    y: GAME_HEIGHT / 2 + (point.y - GAME_HEIGHT / 2) * ROOM_ZOOM,
  };
}
