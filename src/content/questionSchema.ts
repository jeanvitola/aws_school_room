import { z } from 'zod';
import { DIFFICULTY_ORDER, type ContentCatalog, type Question } from '../domain/types';
import { ContentValidationError } from './schema';

export const QUESTIONS_PER_DIFFICULTY = 5;
export const MIN_HARD_MULTIPLE = 2;
export const MIN_CORRECT_POSITIONS = 3;

const OFFICIAL_HOSTS = ['docs.aws.amazon.com', 'aws.amazon.com', 'd1.awsstatic.com'];

function isOfficialAwsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && OFFICIAL_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

const requiredText = z.string().trim().min(1, 'no puede estar vacío');

const questionSchema = z.object({
  id: requiredText,
  serviceId: requiredText,
  difficulty: z.enum(['normal', 'medium', 'hard']),
  type: z.enum(['single', 'multiple']),
  prompt: requiredText,
  options: z.array(
    z.object({ text: requiredText, correct: z.boolean(), explanation: requiredText }),
  ),
  source: z.object({
    title: requiredText,
    url: z.string().refine(isOfficialAwsUrl, 'debe ser una fuente oficial de AWS (https)'),
  }),
  verifiedOn: z.iso.date('debe ser una fecha ISO (AAAA-MM-DD)'),
});

const questionsFileSchema = z.object({ questions: z.array(questionSchema) });

function checkQuestion(question: Question): string[] {
  const issues: string[] = [];
  const correctCount = question.options.filter((option) => option.correct).length;
  const label = `Question "${question.id}"`;

  if (question.type === 'single') {
    if (question.options.length !== 4) issues.push(`${label}: debe tener 4 opciones`);
    if (correctCount !== 1) issues.push(`${label}: debe tener exactamente 1 correcta`);
  } else {
    if (question.options.length !== 5) issues.push(`${label}: debe tener 5 opciones`);
    if (correctCount !== 2) issues.push(`${label}: debe tener exactamente 2 correctas`);
    if (!question.prompt.includes('(Elige 2)')) {
      issues.push(`${label}: el enunciado debe indicar "(Elige 2)"`);
    }
  }
  return issues;
}

function checkServiceSet(serviceId: string, questions: Question[]): string[] {
  const issues: string[] = [];
  const label = `Service "${serviceId}"`;
  const total = QUESTIONS_PER_DIFFICULTY * DIFFICULTY_ORDER.length;
  if (questions.length !== total) {
    issues.push(`${label}: debe tener ${total} preguntas (tiene ${questions.length})`);
  }

  const counts = DIFFICULTY_ORDER.map(
    (difficulty) => questions.filter((question) => question.difficulty === difficulty).length,
  );
  if (counts.some((count) => count !== QUESTIONS_PER_DIFFICULTY)) {
    issues.push(`${label}: debe tener 5 normal, 5 medium y 5 hard (tiene ${counts.join('/')})`);
  }

  const hardMultiple = questions.filter(
    (question) => question.difficulty === 'hard' && question.type === 'multiple',
  ).length;
  if (hardMultiple < MIN_HARD_MULTIPLE) {
    issues.push(`${label}: necesita al menos ${MIN_HARD_MULTIPLE} preguntas "Elige 2" difíciles`);
  }

  const correctPositions = new Set(
    questions
      .filter((question) => question.type === 'single')
      .map((question) => question.options.findIndex((option) => option.correct)),
  );
  if (correctPositions.size < MIN_CORRECT_POSITIONS) {
    issues.push(
      `${label}: la respuesta correcta debe variar de posición (al menos ${MIN_CORRECT_POSITIONS} posiciones distintas)`,
    );
  }
  return issues;
}

function byDifficulty(a: Question, b: Question): number {
  return DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
}

/**
 * Valida el archivo de preguntas contra el catálogo y devuelve las preguntas de cada servicio
 * ordenadas por dificultad (normal → medium → hard). Lanza ContentValidationError si es inválido.
 */
export function loadQuestions(file: unknown, catalog: ContentCatalog): Map<string, Question[]> {
  const result = questionsFileSchema.safeParse(file);
  if (!result.success) {
    throw new ContentValidationError(
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const serviceIds = new Set(catalog.services.map((service) => service.id));
  const seenIds = new Set<string>();
  const issues: string[] = [];
  const byService = new Map<string, Question[]>();

  for (const question of result.data.questions) {
    if (seenIds.has(question.id)) issues.push(`Question id duplicado: ${question.id}`);
    seenIds.add(question.id);
    if (!serviceIds.has(question.serviceId)) {
      issues.push(`Question "${question.id}": serviceId inexistente "${question.serviceId}"`);
    }
    issues.push(...checkQuestion(question));
    byService.set(question.serviceId, [...(byService.get(question.serviceId) ?? []), question]);
  }
  for (const [serviceId, questions] of byService) {
    issues.push(...checkServiceSet(serviceId, questions));
  }
  if (issues.length > 0) throw new ContentValidationError(issues);

  for (const [serviceId, questions] of byService) {
    byService.set(serviceId, [...questions].sort(byDifficulty));
  }
  return byService;
}

/**
 * Valida el archivo de preguntas de una sala (src/content/questions/<roomId>.json): además de las
 * reglas de loadQuestions, cada pregunta debe ser de un servicio de esa sala.
 */
export function loadRoomQuestions(
  file: unknown,
  catalog: ContentCatalog,
  roomId: string,
): Map<string, Question[]> {
  const byService = loadQuestions(file, catalog);
  const roomServiceIds = new Set(
    catalog.services.filter((service) => service.roomId === roomId).map((service) => service.id),
  );
  const issues = [...byService.keys()]
    .filter((serviceId) => !roomServiceIds.has(serviceId))
    .map((serviceId) => `Service "${serviceId}": no pertenece a la sala "${roomId}"`);
  if (issues.length > 0) throw new ContentValidationError(issues);
  return byService;
}
