import { describe, expect, it } from 'vitest';
import servicesFile from '../../src/content/services.json';
import { GRID_COLS, GRID_ROWS } from '../../src/scene/iso';
import { computeDecor, computeLayout } from '../../src/scene/layouts/compute';
import { SPRITE_KEYS } from '../../src/scene/sprites';

const computeServiceIds = servicesFile.services
  .filter((service) => service.roomId === 'compute')
  .map((service) => service.id);

const placements = Object.values(computeLayout);

/** Una estación ocupa su baldosa; se deja al menos un pasillo entre estaciones. */
const MIN_STATION_DISTANCE = 3;

describe('compute room layout', () => {
  it('places every compute service and nothing else', () => {
    expect(Object.keys(computeLayout).sort()).toEqual([...computeServiceIds].sort());
  });

  it('uses existing sprites', () => {
    for (const placement of placements) {
      expect(SPRITE_KEYS).toContain(placement.sprite);
    }
  });

  it('keeps every station inside the grid, away from the walls', () => {
    for (const { col, row } of placements) {
      expect(col).toBeGreaterThanOrEqual(1);
      expect(row).toBeGreaterThanOrEqual(1);
      expect(col).toBeLessThan(GRID_COLS - 1);
      expect(row).toBeLessThan(GRID_ROWS - 1);
    }
  });

  it('organizes stations in lab rows', () => {
    const rows = new Set(placements.map((placement) => placement.row));
    expect(rows.size).toBe(2);
  });

  it('leaves room between stations so they never overlap', () => {
    for (const [index, a] of placements.entries()) {
      for (const b of placements.slice(index + 1)) {
        const distance = Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
        expect(distance).toBeGreaterThanOrEqual(MIN_STATION_DISTANCE);
      }
    }
  });

  describe('decoration (spec 004)', () => {
    it('uses existing sprites and stays inside the grid', () => {
      for (const { col, row, sprite } of computeDecor) {
        expect(SPRITE_KEYS).toContain(sprite);
        expect(col).toBeGreaterThanOrEqual(0);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThan(GRID_COLS);
        expect(row).toBeLessThan(GRID_ROWS);
      }
    });

    it('keeps a free tile around every station', () => {
      for (const decor of computeDecor) {
        for (const station of placements) {
          const distance = Math.max(
            Math.abs(decor.col - station.col),
            Math.abs(decor.row - station.row),
          );
          expect(distance).toBeGreaterThanOrEqual(2);
        }
      }
    });
  });
});

