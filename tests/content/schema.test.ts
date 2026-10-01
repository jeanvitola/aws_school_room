import { describe, expect, it } from 'vitest';
import { ContentValidationError, loadCatalog } from '../../src/content/schema';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';
import {
  makeDeep,
  makeNormal,
  makePattern,
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

function expectServiceInvalid(service: unknown, messageFragment: string) {
  expectInvalid(makeRoomsFile(), { services: [service] }, messageFragment);
}

describe('loadCatalog', () => {
  it('returns a typed catalog for valid content', () => {
    const catalog = loadCatalog(makeRoomsFile(), makeServicesFile());

    expect(catalog.version).toBe('1.0.0');
    expect(catalog.lastReviewed).toBe('2026-09-30');
    expect(catalog.rooms).toHaveLength(1);
    expect(catalog.services[0]?.normal.analogy).toContain('alquilar');
    expect(catalog.services[0]?.deep.patterns).toHaveLength(1);
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
      expectServiceInvalid(makeService({ roomId: 'storage' }), 'roomId inexistente');
    });

    it('rejects a service that belongs to an upcoming room', () => {
      const rooms = [makeRoom({ status: 'upcoming' })];
      expectInvalid(makeRoomsFile(rooms), makeServicesFile(), 'sala "upcoming"');
    });

    it.each(['normal', 'deep'] as const)('rejects a service without the %s level', (level) => {
      const service: Record<string, unknown> = { ...makeService() };
      delete service[level];
      expectServiceInvalid(service, level);
    });
  });

  describe('normal level', () => {
    it('rejects a glossary with 0 or more than 4 terms', () => {
      const term = { term: 'T', definition: 'D' };
      expectServiceInvalid(makeService({ normal: makeNormal({ glossary: [] }) }), 'glossary');
      expectServiceInvalid(
        makeService({ normal: makeNormal({ glossary: Array(5).fill(term) }) }),
        'glossary',
      );
    });

    it('rejects 0 or more than 3 exam key points', () => {
      expectServiceInvalid(makeService({ normal: makeNormal({ examKeyPoints: [] }) }), 'examKeyPoints');
      expectServiceInvalid(
        makeService({ normal: makeNormal({ examKeyPoints: ['a', 'b', 'c', 'd'] }) }),
        'examKeyPoints',
      );
    });

    it('rejects a quick comparison without target or rule', () => {
      expectServiceInvalid(
        makeService({ normal: makeNormal({ quickComparison: { target: '', rule: 'x' } }) }),
        'target',
      );
      expectServiceInvalid(
        makeService({ normal: makeNormal({ quickComparison: { target: 'lambda', rule: ' ' } }) }),
        'rule',
      );
    });

    it('rejects an empty analogy or cost line', () => {
      expectServiceInvalid(makeService({ normal: makeNormal({ analogy: '' }) }), 'analogy');
      expectServiceInvalid(makeService({ normal: makeNormal({ costInOneLine: '' }) }), 'costInOneLine');
    });

    it('rejects a normal level longer than 250 words', () => {
      expectServiceInvalid(
        makeService({ normal: makeNormal({ whatIs: words(260) }) }),
        'nivel Normal',
      );
    });
  });

  describe('deep level', () => {
    it.each(['keyConcepts', 'compareWith', 'useCases', 'patterns', 'examTraps'] as const)(
      'rejects an empty %s list',
      (field) => {
        expectServiceInvalid(makeService({ deep: makeDeep('ec2', { [field]: [] }) }), field);
      },
    );

    it('rejects a use case without example', () => {
      const useCases = [{ scenario: 'Migrar', example: '' }];
      expectServiceInvalid(makeService({ deep: makeDeep('ec2', { useCases }) }), 'example');
    });

    it('rejects a comparison without target or difference', () => {
      expectServiceInvalid(
        makeService({ deep: makeDeep('ec2', { compareWith: [{ target: '', difference: 'x' }] }) }),
        'target',
      );
      expectServiceInvalid(
        makeService({ deep: makeDeep('ec2', { compareWith: [{ target: 'x', difference: '' }] }) }),
        'difference',
      );
    });

    it('rejects a pattern with fewer than 2 or more than 6 steps', () => {
      const step = { target: 'ec2', role: 'Ejecuta' };
      const tooShort = makePattern('ec2', { steps: [step] });
      const tooLong = makePattern('ec2', { steps: Array(7).fill(step) });
      expectServiceInvalid(makeService({ deep: makeDeep('ec2', { patterns: [tooShort] }) }), 'steps');
      expectServiceInvalid(makeService({ deep: makeDeep('ec2', { patterns: [tooLong] }) }), 'steps');
    });

    it('rejects a pattern that does not include the service itself', () => {
      const pattern = makePattern('ec2', {
        steps: [
          { target: 'Amazon S3', role: 'Guarda' },
          { target: 'lambda', role: 'Procesa' },
        ],
      });
      expectServiceInvalid(
        makeService({ deep: makeDeep('ec2', { patterns: [pattern] }) }),
        'no incluye al propio servicio',
      );
    });

    it('rejects a deep level longer than 900 words', () => {
      expectServiceInvalid(
        makeService({ deep: makeDeep('ec2', { definition: words(910) }) }),
        'nivel Profundo',
      );
    });
  });
});
