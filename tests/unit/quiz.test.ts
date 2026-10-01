import { describe, expect, it } from 'vitest';
import { createQuizAttempt } from '../../src/domain/quiz';
import { makeQuestion, makeQuestionSet, makeSingleQuestion } from '../fixtures';

function answerAll(attempt: ReturnType<typeof createQuizAttempt>, correctly: (i: number) => boolean) {
  for (let i = 0; i < attempt.total; i++) {
    const question = attempt.current();
    const correctIndexes = question.options.flatMap((option, index) => (option.correct ? [index] : []));
    const wrongIndexes = question.options.flatMap((option, index) => (option.correct ? [] : [index]));
    const picks = correctly(i)
      ? correctIndexes
      : [wrongIndexes[0]!, ...correctIndexes].slice(0, correctIndexes.length);
    for (const pick of picks) attempt.select(pick);
    attempt.submit();
    attempt.next();
  }
}

describe('createQuizAttempt', () => {
  it('orders questions normal → medium → hard', () => {
    const attempt = createQuizAttempt([...makeQuestionSet()].reverse());
    const order: string[] = [];
    for (let i = 0; i < attempt.total; i++) {
      order.push(attempt.current().difficulty);
      attempt.select(0);
      if (attempt.current().type === 'multiple') attempt.select(1);
      attempt.submit();
      attempt.next();
    }
    expect(order).toEqual([...Array(5).fill('normal'), ...Array(5).fill('medium'), ...Array(5).fill('hard')]);
  });

  it('starts at question 1 in the answering phase', () => {
    const attempt = createQuizAttempt(makeQuestionSet());
    expect(attempt.index).toBe(0);
    expect(attempt.total).toBe(15);
    expect(attempt.phase).toBe('answering');
  });

  describe('single questions', () => {
    it('replaces the selection and enables submit with one option', () => {
      const attempt = createQuizAttempt([makeSingleQuestion(2)]);
      expect(attempt.canSubmit()).toBe(false);

      attempt.select(0);
      attempt.select(2);

      expect(attempt.selected).toEqual([2]);
      expect(attempt.canSubmit()).toBe(true);
    });

    it('evaluates the answer and reports the correct index', () => {
      const right = createQuizAttempt([makeSingleQuestion(2)]);
      right.select(2);
      expect(right.submit()).toEqual({ correct: true, correctIndexes: [2] });

      const wrong = createQuizAttempt([makeSingleQuestion(2)]);
      wrong.select(1);
      expect(wrong.submit()).toEqual({ correct: false, correctIndexes: [2] });
    });
  });

  describe('multiple questions ("Elige 2")', () => {
    it('toggles options and never selects more than 2', () => {
      const attempt = createQuizAttempt([makeQuestion({ type: 'multiple' })]);

      attempt.select(0);
      expect(attempt.canSubmit()).toBe(false);
      attempt.select(3);
      attempt.select(4);
      expect(attempt.selected).toEqual([0, 3]);
      expect(attempt.canSubmit()).toBe(true);

      attempt.select(0);
      expect(attempt.selected).toEqual([3]);
    });

    it('is correct only when both correct options are chosen', () => {
      const right = createQuizAttempt([makeQuestion({ type: 'multiple' })]);
      right.select(1);
      right.select(0);
      expect(right.submit()).toEqual({ correct: true, correctIndexes: [0, 1] });

      const half = createQuizAttempt([makeQuestion({ type: 'multiple' })]);
      half.select(0);
      half.select(4);
      expect(half.submit()).toEqual({ correct: false, correctIndexes: [0, 1] });
    });
  });

  it('cannot submit without a valid selection nor answer twice', () => {
    const attempt = createQuizAttempt([makeSingleQuestion(0), makeSingleQuestion(1)]);
    expect(() => attempt.submit()).toThrow();

    attempt.select(0);
    attempt.submit();
    expect(attempt.phase).toBe('answered');
    expect(() => attempt.submit()).toThrow();

    attempt.select(3);
    expect(attempt.selected).toEqual([0]);
  });

  it('advances with next and finishes after the last question', () => {
    const attempt = createQuizAttempt([makeSingleQuestion(0), makeSingleQuestion(1)]);
    expect(() => attempt.next()).toThrow();

    attempt.select(0);
    attempt.submit();
    attempt.next();
    expect(attempt.index).toBe(1);
    expect(attempt.selected).toEqual([]);
    expect(attempt.phase).toBe('answering');

    attempt.select(1);
    attempt.submit();
    attempt.next();
    expect(attempt.phase).toBe('finished');
  });

  it('summarizes the score in total and by difficulty', () => {
    const attempt = createQuizAttempt(makeQuestionSet());
    // Acierta las 5 normales, 2 medias (índices 6 y 8) y ninguna difícil.
    answerAll(attempt, (i) => i < 5 || (i < 10 && i % 2 === 0));

    expect(attempt.summary()).toEqual({
      correct: 7,
      total: 15,
      byDifficulty: {
        normal: { correct: 5, total: 5 },
        medium: { correct: 2, total: 5 },
        hard: { correct: 0, total: 5 },
      },
    });
  });

  it('restarts from the first question with no answers', () => {
    const attempt = createQuizAttempt(makeQuestionSet());
    answerAll(attempt, () => true);

    attempt.restart();

    expect(attempt.index).toBe(0);
    expect(attempt.phase).toBe('answering');
    expect(attempt.summary().correct).toBe(0);
  });
});
