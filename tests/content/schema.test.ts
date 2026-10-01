import { describe, expect, it } from 'vitest';
import { ContentValidationError, loadCatalog } from '../../src/content/schema';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';
import {
  makeRoom,
  makeRoomsFile,
  makeService,
  makeServicesFile,
  words,
} from '../fixtures';

function expectInvalid(rooms: unknown, services: unknown, messageFragment: string) {
  expect(() => loadCatalog(rooms, services)).toThrow(ContentValidationError);
  expect(() => loadCatalog(rooms, services)).toThrow(messageFragment);
}

describe('loadCatalog', () => {
  it('returns a typed catalog for valid content', () => {
    const catalog = loadCatalog(makeRoomsFile(), makeServicesFile());

    expect(catalog.version).toBe('1.0.0');
    expect(catalog.lastReviewed).toBe('2026-09-30');
    expect(catalog.rooms).toHaveLength(1);
    expect(catalog.services[0]?.id).toBe('ec2');
  });

  it('accepts the project content files', () => {
    expect(() => loadCatalog(roomsFile, servicesFile)).not.toThrow();
  });

  describe('rooms', () => {
    it.each(['id', 'name', 'slug', 'description', 'status', 'order'] as const)(
      'rejects a room without %s',
      (field) => {
        const room: Record<string, unknown> = { ...makeRoom() };
        delete room[field];
        expectInvalid(makeRoomsFile([room as never]), makeServicesFile([]), field);
      },
    );

    it('rejects an unknown status', () => {
      const room = makeRoom({ status: 'hidden' as never });
      expectInvalid(makeRoomsFile([room]), makeServicesFile([]), 'status');
    });

    it('rejects duplicated room ids', () => {
      const rooms = [makeRoom(), makeRoom({ slug: 'otra', order: 2 })];
      expectInvalid(makeRoomsFile(rooms), makeServicesFile([]), 'Room id duplicado: compute');
    });

    it('rejects a missing version or lastReviewed', () => {
      expectInvalid({ rooms: [makeRoom()], lastReviewed: '2026-09-30' }, makeServicesFile(), 'version');
      expectInvalid({ rooms: [makeRoom()], version: '1.0.0' }, makeServicesFile(), 'lastReviewed');
    });

    it('rejects a lastReviewed that is not an ISO date', () => {
      const rooms = { ...makeRoomsFile(), lastReviewed: '30/09/2026' };
      expectInvalid(rooms, makeServicesFile(), 'lastReviewed');
    });
  });

  describe('services', () => {
    it('rejects duplicated service ids', () => {
      const services = [makeService(), makeService()];
      expectInvalid(makeRoomsFile(), makeServicesFile(services), 'Service id duplicado: ec2');
    });

    it('rejects a service whose room does not exist', () => {
      const services = [makeService({ roomId: 'storage' })];
      expectInvalid(makeRoomsFile(), makeServicesFile(services), 'roomId inexistente');
    });

    it('rejects a service that belongs to an upcoming room', () => {
      const rooms = [makeRoom({ status: 'upcoming' })];
      expectInvalid(makeRoomsFile(rooms), makeServicesFile(), 'sala "upcoming"');
    });

    it.each(['useCases', 'examConcepts', 'compareWith', 'examTraps'] as const)(
      'rejects an empty %s list',
      (field) => {
        const services = [makeService({ [field]: [] })];
        expectInvalid(makeRoomsFile(), makeServicesFile(services), field);
      },
    );

    it('rejects an empty costNote', () => {
      const services = [makeService({ costNote: '  ' })];
      expectInvalid(makeRoomsFile(), makeServicesFile(services), 'costNote');
    });

    it('rejects a comparison without target or difference', () => {
      const withoutTarget = [makeService({ compareWith: [{ target: '', difference: 'x' }] })];
      const withoutDifference = [makeService({ compareWith: [{ target: 'lambda', difference: '' }] })];
      expectInvalid(makeRoomsFile(), makeServicesFile(withoutTarget), 'target');
      expectInvalid(makeRoomsFile(), makeServicesFile(withoutDifference), 'difference');
    });

    it('rejects a summary longer than 50 words', () => {
      const services = [makeService({ summary: words(51) })];
      expectInvalid(makeRoomsFile(), makeServicesFile(services), 'summary');
    });

    it('accepts a summary of exactly 50 words', () => {
      const services = [makeService({ summary: words(50) })];
      expect(() => loadCatalog(makeRoomsFile(), makeServicesFile(services))).not.toThrow();
    });

    it('rejects a card longer than 350 words in total', () => {
      const services = [makeService({ useCases: [words(200)], examTraps: [words(200)] })];
      expectInvalid(makeRoomsFile(), makeServicesFile(services), '350 palabras');
    });
  });
});
