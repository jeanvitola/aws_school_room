import { describe, expect, it } from 'vitest';
import {
  getRoom,
  getService,
  getServicesByRoom,
  isRoomAvailable,
  listRooms,
  resolveComparisons,
  resolveTarget,
} from '../../src/domain/catalog';
import type { ContentCatalog } from '../../src/domain/types';
import { makeDeep, makeRoom, makeService } from '../fixtures';

const catalog: ContentCatalog = {
  version: '1.0.0',
  lastReviewed: '2026-09-30',
  rooms: [
    makeRoom({ id: 'storage', slug: 'storage', name: 'Bodega', status: 'available', order: 2 }),
    makeRoom({ id: 'compute', order: 1 }),
  ],
  services: [
    makeService({ id: 'ec2', roomId: 'compute' }),
    makeService({ id: 'lambda', name: 'Lambda', roomId: 'compute' }),
    makeService({
      id: 'elb',
      name: 'ELB',
      roomId: 'compute',
      deep: makeDeep('elb', {
        compareWith: [
          { target: 'ec2', difference: 'Reparte tráfico entre instancias.' },
          { target: 'Amazon Route 53', difference: 'Balanceo por DNS.' },
        ],
      }),
    }),
    makeService({ id: 's3', name: 'Amazon S3', roomId: 'storage' }),
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
    expect(isRoomAvailable(catalog, 'missing')).toBe(false);
  });

  it('derives the services of a room from Service.roomId', () => {
    expect(getServicesByRoom(catalog, 'compute').map((service) => service.id)).toEqual([
      'ec2',
      'lambda',
      'elb',
    ]);
  });

  it('gets a service by id', () => {
    expect(getService(catalog, 'lambda')?.name).toBe('Lambda');
    expect(getService(catalog, 'missing')).toBeUndefined();
  });

  describe('resolveTarget', () => {
    it('makes a service of the same room openable', () => {
      expect(resolveTarget(catalog, 'lambda', 'ec2')).toMatchObject({
        label: 'Lambda',
        isCurrent: false,
        isOpenable: true,
      });
    });

    it('marks the service itself as current and not openable', () => {
      expect(resolveTarget(catalog, 'ec2', 'ec2')).toMatchObject({
        label: 'EC2',
        isCurrent: true,
        isOpenable: false,
      });
    });

    it('keeps an external AWS name as plain text', () => {
      expect(resolveTarget(catalog, 'Amazon DynamoDB', 'ec2')).toEqual({
        label: 'Amazon DynamoDB',
        service: undefined,
        isCurrent: false,
        isOpenable: false,
      });
    });

    it('does not open a service from another room', () => {
      expect(resolveTarget(catalog, 's3', 'ec2')).toMatchObject({
        label: 'Amazon S3',
        isOpenable: false,
      });
    });
  });

  describe('resolveComparisons', () => {
    it('resolves the deep comparisons of a service', () => {
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
