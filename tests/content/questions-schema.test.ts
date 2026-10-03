import { describe, expect, it } from 'vitest';
import { ContentValidationError, loadCatalog } from '../../src/content/schema';
import { loadQuestions, loadRoomQuestions } from '../../src/content/questionSchema';
import type { Question } from '../../src/domain/types';
import {
  makeQuestion,
  makeQuestionSet,
  makeRoom,
  makeRoomsFile,
  makeService,
  makeServicesFile,
  makeSingleQuestion,
} from '../fixtures';

const catalog = loadCatalog(makeRoomsFile(), makeServicesFile());

function replaceAt(questions: Question[], index: number, question: Question): Question[] {
  return questions.map((current, i) => (i === index ? question : current));
}

function expectInvalid(questions: unknown[], messageFragment: string) {
  const load = () => loadQuestions({ questions }, catalog);
  expect(load).toThrow(ContentValidationError);
  expect(load).toThrow(messageFragment);
}

describe('loadQuestions', () => {
  it('groups a valid set by service, ordered normal → medium → hard', () => {
    const shuffled = [...makeQuestionSet()].reverse();
    const byService = loadQuestions({ questions: shuffled }, catalog);

    const difficulties = byService.get('ec2')?.map((question) => question.difficulty);
    expect(difficulties).toEqual([
      ...Array(5).fill('normal'),
      ...Array(5).fill('medium'),
      ...Array(5).fill('hard'),
    ]);
  });

  it('accepts an empty file', () => {
    expect(loadQuestions({ questions: [] }, catalog).size).toBe(0);
  });

  it('rejects duplicated ids', () => {
    const set = makeQuestionSet();
    expectInvalid(replaceAt(set, 1, { ...set[1]!, id: set[0]!.id }), 'Question id duplicado');
  });

  it('rejects an unknown service', () => {
    expectInvalid(makeQuestionSet('s3'), 'serviceId inexistente');
  });

  it('rejects a single question without exactly 4 options and 1 correct answer', () => {
    const set = makeQuestionSet();
    const threeOptions = { ...set[0]!, options: set[0]!.options.slice(0, 3) };
    const twoCorrect = {
      ...set[0]!,
      options: set[0]!.options.map((option, i) => ({ ...option, correct: i < 2 })),
    };
    expectInvalid(replaceAt(set, 0, threeOptions), '4 opciones');
    expectInvalid(replaceAt(set, 0, twoCorrect), '1 correcta');
  });

  it('rejects a multiple question without 5 options, 2 correct answers or "(Elige 2)"', () => {
    const set = makeQuestionSet();
    const multipleIndex = set.findIndex((question) => question.type === 'multiple');
    const base = set[multipleIndex]!;
    expectInvalid(
      replaceAt(set, multipleIndex, { ...base, options: base.options.slice(0, 4) }),
      '5 opciones',
    );
    expectInvalid(
      replaceAt(set, multipleIndex, {
        ...base,
        options: base.options.map((option, i) => ({ ...option, correct: i === 0 })),
      }),
      '2 correctas',
    );
    expectInvalid(
      replaceAt(set, multipleIndex, { ...base, prompt: '¿Qué dos acciones…?' }),
      '(Elige 2)',
    );
  });

  it('rejects an option without explanation', () => {
    const set = makeQuestionSet();
    const options = set[0]!.options.map((option, i) =>
      i === 2 ? { ...option, explanation: '' } : option,
    );
    expectInvalid(replaceAt(set, 0, { ...set[0]!, options }), 'explanation');
  });

  it.each([
    'http://docs.aws.amazon.com/lambda/',
    'https://example.com/lambda',
    'https://aws.amazon.com.evil.io/x',
  ])('rejects a non official source: %s', (url) => {
    const set = makeQuestionSet();
    expectInvalid(replaceAt(set, 0, { ...set[0]!, source: { title: 'X', url } }), 'fuente oficial');
  });

  it('rejects a verifiedOn that is not an ISO date', () => {
    const set = makeQuestionSet();
    expectInvalid(replaceAt(set, 0, { ...set[0]!, verifiedOn: '30/09/2026' }), 'verifiedOn');
  });

  it('rejects a service without 5 questions of each difficulty', () => {
    const set = makeQuestionSet();
    expectInvalid(replaceAt(set, 0, { ...set[0]!, difficulty: 'medium' }), '5 normal');
    expectInvalid(set.slice(1), '15 preguntas');
  });

  it('rejects fewer than 2 "Elige 2" questions among the hard ones', () => {
    const set = makeQuestionSet();
    const lastIndex = set.length - 1;
    const single = makeSingleQuestion(1, {
      id: set[lastIndex]!.id,
      difficulty: 'hard',
    });
    expectInvalid(replaceAt(set, lastIndex, single), 'Elige 2');
  });

  it('rejects single questions whose correct answer is always in fewer than 3 positions', () => {
    const set = makeQuestionSet().map((question) =>
      question.type === 'single' ? makeSingleQuestion(0, question) : question,
    );
    expectInvalid(set, 'posiciones');
  });

  it('builds valid questions from the fixture helpers', () => {
    expect(makeQuestion().options).toHaveLength(4);
  });
});

describe('loadRoomQuestions', () => {
  const twoRooms = loadCatalog(
    makeRoomsFile([
      makeRoom(),
      makeRoom({ id: 'storage', slug: 'storage', name: 'Bodega', order: 2 }),
    ]),
    makeServicesFile([makeService(), makeService({ id: 's3', name: 'S3', roomId: 'storage' })]),
  );

  it('loads the questions of the services of the room', () => {
    const byService = loadRoomQuestions({ questions: makeQuestionSet('s3') }, twoRooms, 'storage');
    expect(byService.get('s3')).toHaveLength(15);
  });

  it('rejects a question of a service of another room', () => {
    const load = () =>
      loadRoomQuestions({ questions: makeQuestionSet('ec2') }, twoRooms, 'storage');
    expect(load).toThrow(ContentValidationError);
    expect(load).toThrow('no pertenece a la sala "storage"');
  });
});
