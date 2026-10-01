import { describe, expect, it } from 'vitest';
import servicesFile from '../../src/content/services.json';
import { GRID_SIZE } from '../../src/scene/iso';
import { computeLayout } from '../../src/scene/layouts/compute';
import { SPRITE_KEYS } from '../../src/scene/sprites';

const computeServiceIds = servicesFile.services
  .filter((service) => service.roomId === 'compute')
  .map((service) => service.id);

describe('compute room layout', () => {
  it('places every compute service and nothing else', () => {
    expect(Object.keys(computeLayout).sort()).toEqual([...computeServiceIds].sort());
  });

  it('uses existing sprites', () => {
    for (const placement of Object.values(computeLayout)) {
      expect(SPRITE_KEYS).toContain(placement.sprite);
    }
  });

  it('keeps every placement inside the grid and on a different tile', () => {
    const tiles = Object.values(computeLayout).map(({ col, row }) => `${col},${row}`);

    expect(new Set(tiles).size).toBe(tiles.length);
    for (const { col, row } of Object.values(computeLayout)) {
      expect(col).toBeGreaterThanOrEqual(0);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(GRID_SIZE);
      expect(row).toBeLessThan(GRID_SIZE);
    }
  });
});
