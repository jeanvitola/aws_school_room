import { z } from 'zod';
import type { ContentCatalog, DeepContent, NormalContent, Room, Service } from '../domain/types';

export const MAX_NORMAL_WORDS = 250;
export const MAX_DEEP_WORDS = 900;

export class ContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Contenido inválido:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'ContentValidationError';
    this.issues = issues;
  }
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

const requiredText = z.string().trim().min(1, 'no puede estar vacío');
const nonEmptyTextList = z.array(requiredText).min(1, 'debe tener al menos un elemento');

function listBetween<T extends z.ZodType>(item: T, min: number, max: number) {
  return z
    .array(item)
    .min(min, `debe tener entre ${min} y ${max} elementos`)
    .max(max, `debe tener entre ${min} y ${max} elementos`);
}

const roomSchema = z.object({
  id: requiredText,
  name: requiredText,
  slug: requiredText,
  description: requiredText,
  status: z.enum(['available', 'upcoming']),
  order: z.number().int(),
});

const roomsFileSchema = z.object({
  rooms: z.array(roomSchema),
  version: requiredText,
  lastReviewed: z.iso.date('debe ser una fecha ISO (AAAA-MM-DD)'),
});

const normalSchema = z.object({
  whatIs: requiredText,
  analogy: requiredText,
  glossary: listBetween(z.object({ term: requiredText, definition: requiredText }), 1, 4),
  examKeyPoints: listBetween(requiredText, 1, 3),
  quickComparison: z.object({ target: requiredText, rule: requiredText }),
  costInOneLine: requiredText,
});

const patternSchema = z.object({
  name: requiredText,
  problem: requiredText,
  whenToUse: requiredText,
  whenNotToUse: requiredText,
  steps: listBetween(z.object({ target: requiredText, role: requiredText }), 2, 6),
});

const deepSchema = z.object({
  definition: requiredText,
  keyConcepts: nonEmptyTextList,
  compareWith: z
    .array(z.object({ target: requiredText, difference: requiredText }))
    .min(1, 'debe tener al menos un elemento'),
  useCases: z
    .array(z.object({ scenario: requiredText, example: requiredText }))
    .min(1, 'debe tener al menos un elemento'),
  patterns: z.array(patternSchema).min(1, 'debe tener al menos un elemento'),
  examTraps: nonEmptyTextList,
  costs: requiredText,
});

const serviceSchema = z.object({
  id: requiredText,
  name: requiredText,
  roomId: requiredText,
  normal: normalSchema,
  deep: deepSchema,
  tags: z.array(z.string()).optional(),
});

const servicesFileSchema = z.object({
  services: z.array(serviceSchema),
});

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

function countNormalWords(normal: NormalContent): number {
  const texts = [
    normal.whatIs,
    normal.analogy,
    ...normal.glossary.flatMap(({ term, definition }) => [term, definition]),
    ...normal.examKeyPoints,
    normal.quickComparison.rule,
    normal.costInOneLine,
  ];
  return texts.reduce((total, text) => total + countWords(text), 0);
}

function countDeepWords(deep: DeepContent): number {
  const texts = [
    deep.definition,
    ...deep.keyConcepts,
    ...deep.compareWith.map(({ difference }) => difference),
    ...deep.useCases.flatMap(({ scenario, example }) => [scenario, example]),
    ...deep.patterns.flatMap((pattern) => [
      pattern.name,
      pattern.problem,
      pattern.whenToUse,
      pattern.whenNotToUse,
      ...pattern.steps.map(({ role }) => role),
    ]),
    ...deep.examTraps,
    deep.costs,
  ];
  return texts.reduce((total, text) => total + countWords(text), 0);
}

function findDuplicateIds(items: { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

function checkServiceRules(service: Service, room: Room | undefined): string[] {
  const issues: string[] = [];
  if (!room) {
    issues.push(`Service "${service.id}": roomId inexistente "${service.roomId}"`);
  } else if (room.status === 'upcoming') {
    issues.push(`Service "${service.id}": pertenece a una sala "upcoming" (${room.id})`);
  }

  const normalWords = countNormalWords(service.normal);
  if (normalWords > MAX_NORMAL_WORDS) {
    issues.push(
      `Service "${service.id}": el nivel Normal tiene ${normalWords} palabras (máximo ${MAX_NORMAL_WORDS})`,
    );
  }
  const deepWords = countDeepWords(service.deep);
  if (deepWords > MAX_DEEP_WORDS) {
    issues.push(
      `Service "${service.id}": el nivel Profundo tiene ${deepWords} palabras (máximo ${MAX_DEEP_WORDS})`,
    );
  }

  for (const pattern of service.deep.patterns) {
    if (!pattern.steps.some((step) => step.target === service.id)) {
      issues.push(
        `Service "${service.id}": el patrón "${pattern.name}" no incluye al propio servicio en su flujo`,
      );
    }
  }
  return issues;
}

/** Valida los archivos de contenido y devuelve el catálogo tipado, o lanza ContentValidationError. */
export function loadCatalog(roomsFile: unknown, servicesFile: unknown): ContentCatalog {
  const roomsResult = roomsFileSchema.safeParse(roomsFile);
  const servicesResult = servicesFileSchema.safeParse(servicesFile);

  if (!roomsResult.success || !servicesResult.success) {
    throw new ContentValidationError([
      ...(roomsResult.success ? [] : formatZodIssues(roomsResult.error)),
      ...(servicesResult.success ? [] : formatZodIssues(servicesResult.error)),
    ]);
  }

  const { rooms, version, lastReviewed } = roomsResult.data;
  const { services } = servicesResult.data;
  const roomsById = new Map(rooms.map((room) => [room.id, room]));
  const issues = [
    ...findDuplicateIds(rooms).map((id) => `Room id duplicado: ${id}`),
    ...findDuplicateIds(services).map((id) => `Service id duplicado: ${id}`),
    ...services.flatMap((service) => checkServiceRules(service, roomsById.get(service.roomId))),
  ];
  if (issues.length > 0) throw new ContentValidationError(issues);

  return { rooms, services, version, lastReviewed };
}
