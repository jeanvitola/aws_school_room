import { describe, expect, it } from 'vitest';
import {
  getRoom,
  getService,
  getServicesByRoom,
  isRoomAvailable,
  listRooms,
  resolveComparisons,
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
    makeService({
      id: 'elb',
      name: 'ELB',
      roomId: 'compute',
      compareWith: [
        { target: 'ec2', difference: 'Reparte tráfico entre instancias.' },
        { target: 'Amazon Route 53', difference: 'Balanceo por DNS.' },
      ],
    }),
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
      'elb',
    ]);
    expect(getServicesByRoom(catalog, 'storage')).toEqual([]);
  });

  it('gets a service by id', () => {
    expect(getService(catalog, 'lambda')?.name).toBe('Lambda');
    expect(getService(catalog, 'missing')).toBeUndefined();
  });

  describe('resolveComparisons', () => {
    it('resolves catalog targets to services and keeps external names unresolved', () => {
      const comparisons = resolveComparisons(catalog, 'elb');

      expect(comparisons).toHaveLength(2);
      expect(comparisons[0]).toMatchObject({
        target: 'ec2',
        difference: 'Reparte tráfico entre instancias.',
      });
      expect(comparisons[0]?.service?.id).toBe('ec2');
      expect(comparisons[1]).toEqual({
        target: 'Amazon Route 53',
        difference: 'Balanceo por DNS.',
        service: undefined,
      });
    });

    it('returns an empty list for an unknown service', () => {
      expect(resolveComparisons(catalog, 'missing')).toEqual([]);
    });
  });
});
