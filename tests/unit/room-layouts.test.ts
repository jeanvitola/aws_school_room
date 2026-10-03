import { describe, expect, it } from 'vitest';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';
import { GRID_COLS, GRID_ROWS } from '../../src/scene/iso';
import { ROOM_LAYOUTS } from '../../src/scene/layouts';
import { SPRITE_KEYS } from '../../src/scene/sprites';

/** Una estación ocupa su baldosa; se deja al menos un pasillo entre estaciones. */
const MIN_STATION_DISTANCE = 3;
const MIN_DECOR_DISTANCE = 2;

function distance(a: { col: number; row: number }, b: { col: number; row: number }): number {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}

describe('room layouts', () => {
  it('every available room has a layout', () => {
    const availableRooms = roomsFile.rooms.filter((room) => room.status === 'available');
    for (const room of availableRooms) {
      expect(Object.keys(ROOM_LAYOUTS)).toContain(room.id);
    }
  });

  describe.each(Object.entries(ROOM_LAYOUTS))('%s', (roomId, layout) => {
    const placements = Object.values(layout.stations);
    const roomServiceIds = servicesFile.services
      .filter((service) => service.roomId === roomId)
      .map((service) => service.id);

    it('places every service of the room and nothing else', () => {
      expect(Object.keys(layout.stations).sort()).toEqual([...roomServiceIds].sort());
    });

    it('uses existing sprites', () => {
      for (const { sprite } of [...placements, ...layout.decor]) {
        expect(SPRITE_KEYS).toContain(sprite);
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

    it('organizes stations in the declared lab rows', () => {
      const rows = new Set(placements.map((placement) => placement.row));
      expect(rows.size).toBe(layout.rows);
    });

    it('aligns the columns when every row has the same number of stations', () => {
      const columnsByRow = new Map<number, number[]>();
      for (const { row, col } of placements) {
        columnsByRow.set(
          row,
          [...(columnsByRow.get(row) ?? []), col].sort((a, b) => a - b),
        );
      }
      const rows = [...columnsByRow.values()];
      if (rows.some((columns) => columns.length !== rows[0]?.length)) return;
      for (const columns of rows) expect(columns).toEqual(rows[0]);
    });

    it('leaves room between stations so they never overlap', () => {
      for (const [index, a] of placements.entries()) {
        for (const b of placements.slice(index + 1)) {
          expect(distance(a, b)).toBeGreaterThanOrEqual(MIN_STATION_DISTANCE);
        }
      }
    });

    it('keeps decoration inside the grid with a free tile around every station', () => {
      for (const decor of layout.decor) {
        expect(decor.col).toBeGreaterThanOrEqual(0);
        expect(decor.row).toBeGreaterThanOrEqual(0);
        expect(decor.col).toBeLessThan(GRID_COLS);
        expect(decor.row).toBeLessThan(GRID_ROWS);
        for (const station of placements) {
          expect(distance(decor, station)).toBeGreaterThanOrEqual(MIN_DECOR_DISTANCE);
        }
      }
    });
  });
});
