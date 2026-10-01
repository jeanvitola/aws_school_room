import { DIFFICULTY_ORDER, type Difficulty, type Question } from './types';

export type QuizPhase = 'answering' | 'answered' | 'finished';

export interface AnswerResult {
  correct: boolean;
  correctIndexes: number[];
}

export interface QuizSummary {
  correct: number;
  total: number;
  byDifficulty: Record<Difficulty, { correct: number; total: number }>;
}

export interface QuizAttempt {
  readonly total: number;
  readonly index: number;
  readonly phase: QuizPhase;
  /** Índices elegidos en la pregunta actual, en orden ascendente. */
  readonly selected: number[];
  /** Resultado de la pregunta actual una vez respondida. */
  readonly lastResult: AnswerResult | null;
  current(): Question;
  /** Cuántas opciones hay que elegir en la pregunta actual (1 o 2). */
  requiredSelections(): number;
  select(optionIndex: number): void;
  canSubmit(): boolean;
  submit(): AnswerResult;
  next(): void;
  summary(): QuizSummary;
  restart(): void;
}

function selectionsFor(question: Question): number {
  return question.type === 'multiple' ? 2 : 1;
}

function correctIndexesOf(question: Question): number[] {
  return question.options.flatMap((option, index) => (option.correct ? [index] : []));
}

/** Intento de las preguntas de un servicio: orden, selección, evaluación y puntaje. */
export function createQuizAttempt(questions: Question[]): QuizAttempt {
  const ordered = [...questions].sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty),
  );
  let index = 0;
  let phase: QuizPhase = 'answering';
  let selected: number[] = [];
  let lastResult: AnswerResult | null = null;
  let answers: boolean[] = [];

  function current(): Question {
    const question = ordered[index];
    if (!question) throw new Error('No hay pregunta actual');
    return question;
  }

  function canSubmit(): boolean {
    return phase === 'answering' && selected.length === selectionsFor(current());
  }

  return {
    get total() {
      return ordered.length;
    },
    get index() {
      return index;
    },
    get phase() {
      return phase;
    },
    get selected() {
      return [...selected];
    },
    get lastResult() {
      return lastResult;
    },
    current,
    requiredSelections: () => selectionsFor(current()),
    canSubmit,

    select(optionIndex) {
      if (phase !== 'answering') return;
      const question = current();
      if (question.type === 'single') {
        selected = [optionIndex];
      } else if (selected.includes(optionIndex)) {
        selected = selected.filter((value) => value !== optionIndex);
      } else if (selected.length < selectionsFor(question)) {
        selected = [...selected, optionIndex].sort((a, b) => a - b);
      }
    },

    submit() {
      if (!canSubmit()) throw new Error('No se puede responder todavía');
      const correctIndexes = correctIndexesOf(current());
      const correct =
        selected.length === correctIndexes.length &&
        selected.every((value) => correctIndexes.includes(value));
      answers = [...answers, correct];
      lastResult = { correct, correctIndexes };
      phase = 'answered';
      return lastResult;
    },

    next() {
      if (phase !== 'answered') throw new Error('Primero responde la pregunta');
      selected = [];
      lastResult = null;
      if (index + 1 < ordered.length) {
        index += 1;
        phase = 'answering';
      } else {
        phase = 'finished';
      }
    },

    summary() {
      const byDifficulty = Object.fromEntries(
        DIFFICULTY_ORDER.map((difficulty) => [difficulty, { correct: 0, total: 0 }]),
      ) as QuizSummary['byDifficulty'];
      ordered.forEach((question, i) => {
        const bucket = byDifficulty[question.difficulty];
        bucket.total += 1;
        if (answers[i]) bucket.correct += 1;
      });
      return { correct: answers.filter(Boolean).length, total: ordered.length, byDifficulty };
    },

    restart() {
      index = 0;
      phase = 'answering';
      selected = [];
      lastResult = null;
      answers = [];
    },
  };
}
