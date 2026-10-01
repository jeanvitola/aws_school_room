import { describe, expect, it } from 'vitest';
import {
  getRoom,
  getService,
  getServicesByRoom,
  isRoomAvailable,
  listRooms,
} from '../../src/domain/catalog';
import type { ContentCatalog } from '../../src/domain/types';
import { makeRoom, makeService } from '../fixtures';

const catalog: ContentCatalog = {
  version: '1.0.0',
  lastReviewed: '2026-09-30',
  rooms: [
    makeRoom({ id: 'storage', slug: 'storage', name: 'Bodega', status: 'upcoming', order: 2 }),
    makeRoom({ id: 'compute', order: 1 }),
  ],
  services: [
    makeService({ id: 'ec2', roomId: 'compute' }),
    makeService({ id: 'lambda', name: 'Lambda', roomId: 'compute' }),
  ],
};

describe('catalog', () => {
  it('lists rooms sorted by order', () => {
    expect(listRooms(catalog).map((room) => room.id)).toEqual(['compute', 'storage']);
  });

  it('gets a room by id', () => {
    expect(getRoom(catalog, 'storage')?.name).toBe('Bodega');
    expect(getRoom(catalog, 'missing')).toBeUndefined();
  });

  it('knows whether a room is available', () => {
    expect(isRoomAvailable(catalog, 'compute')).toBe(true);
    expect(isRoomAvailable(catalog, 'storage')).toBe(false);
    expect(isRoomAvailable(catalog, 'missing')).toBe(false);
  });

  it('derives the services of a room from Service.roomId', () => {
    expect(getServicesByRoom(catalog, 'compute').map((service) => service.id)).toEqual([
      'ec2',
      'lambda',
    ]);
    expect(getServicesByRoom(catalog, 'storage')).toEqual([]);
  });

  it('gets a service by id', () => {
    expect(getService(catalog, 'lambda')?.name).toBe('Lambda');
    expect(getService(catalog, 'missing')).toBeUndefined();
  });
});
