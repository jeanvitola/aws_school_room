import { describe, expect, it } from 'vitest';
import { loadRoomQuestions } from '../../src/content/questionSchema';
import { loadCatalog } from '../../src/content/schema';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';

// Un archivo de preguntas por sala (spec 005): src/content/questions/<roomId>.json
const questionFiles = import.meta.glob<unknown>('../../src/content/questions/*.json', {
  eager: true,
  import: 'default',
});
const fileOf = (roomId: string) => questionFiles[`../../src/content/questions/${roomId}.json`];

describe('practice questions content', () => {
  const catalog = loadCatalog(roomsFile, servicesFile);
  const availableRooms = catalog.rooms.filter((room) => room.status === 'available');

  describe.each(availableRooms.map((room) => room.id))('%s', (roomId) => {
    const byService = loadRoomQuestions(fileOf(roomId), catalog, roomId);
    const serviceIds = catalog.services
      .filter((service) => service.roomId === roomId)
      .map((service) => service.id);

    // SC-001 (003): cada servicio de una sala disponible tiene sus 15 preguntas.
    it.each(serviceIds)('%s has its 15 validated questions', (serviceId) => {
      expect(byService.get(serviceId)).toHaveLength(15);
    });

    it('every question cites an official source and a verification date', () => {
      for (const questions of byService.values()) {
        for (const question of questions) {
          expect(question.source.url).toMatch(/^https:\/\/(docs\.)?aws\.amazon\.com\//);
          expect(question.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    });
  });

  it('has no question file for a room that does not exist', () => {
    const roomIds = catalog.rooms.map((room) => room.id);
    for (const path of Object.keys(questionFiles)) {
      const roomId = path.split('/').pop()?.replace('.json', '');
      expect(roomIds).toContain(roomId);
    }
  });
});
