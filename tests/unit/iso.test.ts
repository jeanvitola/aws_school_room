import { describe, expect, it } from 'vitest';
import {
  FOCUS_ZOOM,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  ROOM_ZOOM,
  TILE_HEIGHT,
  TILE_WIDTH,
  WALL_HEIGHT,
  cameraCenterFor,
  isoToScreen,
  worldToView,
} from '../../src/scene/iso';

function roomBounds() {
  const left = isoToScreen(0, GRID_ROWS - 1).x - TILE_WIDTH / 2;
  const right = isoToScreen(GRID_COLS - 1, 0).x + TILE_WIDTH / 2;
  const top = isoToScreen(0, 0).y - TILE_HEIGHT / 2 - WALL_HEIGHT;
  const bottom = isoToScreen(GRID_COLS - 1, GRID_ROWS - 1).y + TILE_HEIGHT / 2;
  return { left, right, top, bottom };
}

describe('room geometry', () => {
  it('centers the room in the game view', () => {
    const { left, right, top, bottom } = roomBounds();

    expect((left + right) / 2).toBeCloseTo(GAME_WIDTH / 2, 0);
    expect((top + bottom) / 2).toBeCloseTo(GAME_HEIGHT / 2, 0);
  });

  it('fits the whole room in the view with the overview zoom', () => {
    const { left, right, top, bottom } = roomBounds();
    const topLeft = worldToView({ x: left, y: top });
    const bottomRight = worldToView({ x: right, y: bottom });

    expect(topLeft.x).toBeGreaterThanOrEqual(0);
    expect(topLeft.y).toBeGreaterThanOrEqual(0);
    expect(bottomRight.x).toBeLessThanOrEqual(GAME_WIDTH);
    expect(bottomRight.y).toBeLessThanOrEqual(GAME_HEIGHT);
  });

  it('uses most of the view (the room is not tiny)', () => {
    const { left, right } = roomBounds();
    expect((right - left) * ROOM_ZOOM).toBeGreaterThan(GAME_WIDTH * 0.85);
  });
});

describe('cameraCenterFor', () => {
  it('centers the camera on the point for the middle of the view', () => {
    expect(cameraCenterFor({ x: 100, y: 80 }, { x: 0.5, y: 0.5 })).toEqual({ x: 100, y: 80 });
  });

  it('shifts the camera so the point appears at the requested fraction of the view', () => {
    const center = cameraCenterFor({ x: 100, y: 80 }, { x: 0.25, y: 0.5 });
    const viewWidth = GAME_WIDTH / FOCUS_ZOOM;

    // El punto queda a un 25% del borde izquierdo de la vista.
    const viewLeft = center.x - viewWidth / 2;
    expect((100 - viewLeft) / viewWidth).toBeCloseTo(0.25);
  });
});
