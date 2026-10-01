import { describe, expect, it } from 'vitest';
import { loadQuestions } from '../../src/content/questionSchema';
import { loadCatalog } from '../../src/content/schema';
import questionsFile from '../../src/content/questions.json';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';

// Servicios con preguntas redactadas. Se amplía a los 7 en la fase 5 (T017).
const SERVICES_WITH_QUESTIONS = ['lambda'];

describe('practice questions content', () => {
  const catalog = loadCatalog(roomsFile, servicesFile);
  const byService = loadQuestions(questionsFile, catalog);

  it.each(SERVICES_WITH_QUESTIONS)('%s has its 15 validated questions', (serviceId) => {
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
