import { z } from 'zod';
import type { ContentCatalog, Room, Service } from '../domain/types';

export const MAX_SUMMARY_WORDS = 50;
export const MAX_CARD_WORDS = 350;

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

const serviceSchema = z.object({
  id: requiredText,
  name: requiredText,
  roomId: requiredText,
  summary: requiredText.refine(
    (summary) => countWords(summary) <= MAX_SUMMARY_WORDS,
    `no puede superar ${MAX_SUMMARY_WORDS} palabras`,
  ),
  useCases: nonEmptyTextList,
  examConcepts: nonEmptyTextList,
  compareWith: z
    .array(z.object({ target: requiredText, difference: requiredText }))
    .min(1, 'debe tener al menos un elemento'),
  examTraps: nonEmptyTextList,
  costNote: requiredText,
  tags: z.array(z.string()).optional(),
});

const servicesFileSchema = z.object({
  services: z.array(serviceSchema),
});

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

function countCardWords(service: Service): number {
  const texts = [
    service.summary,
    ...service.useCases,
    ...service.examConcepts,
    ...service.compareWith.flatMap((comparison) => [comparison.target, comparison.difference]),
    ...service.examTraps,
    service.costNote,
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

function checkCrossReferences(rooms: Room[], services: Service[]): string[] {
  const issues: string[] = [];
  const roomsById = new Map(rooms.map((room) => [room.id, room]));

  for (const id of findDuplicateIds(rooms)) issues.push(`Room id duplicado: ${id}`);
  for (const id of findDuplicateIds(services)) issues.push(`Service id duplicado: ${id}`);

  for (const service of services) {
    const room = roomsById.get(service.roomId);
    if (!room) {
      issues.push(`Service "${service.id}": roomId inexistente "${service.roomId}"`);
    } else if (room.status === 'upcoming') {
      issues.push(`Service "${service.id}": pertenece a una sala "upcoming" (${room.id})`);
    }
    const cardWords = countCardWords(service);
    if (cardWords > MAX_CARD_WORDS) {
      issues.push(
        `Service "${service.id}": la ficha tiene ${cardWords} palabras y no puede superar ${MAX_CARD_WORDS} palabras`,
      );
    }
  }
  return issues;
}

/** Valida los archivos de contenido y devuelve el catálogo tipado, o lanza ContentValidationError. */
export function loadCatalog(roomsFile: unknown, servicesFile: unknown): ContentCatalog {
  const roomsResult = roomsFileSchema.safeParse(roomsFile);
  const servicesResult = servicesFileSchema.safeParse(servicesFile);

  const schemaIssues = [
    ...(roomsResult.success ? [] : formatZodIssues(roomsResult.error)),
    ...(servicesResult.success ? [] : formatZodIssues(servicesResult.error)),
  ];
  if (!roomsResult.success || !servicesResult.success) {
    throw new ContentValidationError(schemaIssues);
  }

  const { rooms, version, lastReviewed } = roomsResult.data;
  const { services } = servicesResult.data;
  const referenceIssues = checkCrossReferences(rooms, services);
  if (referenceIssues.length > 0) throw new ContentValidationError(referenceIssues);

  return { rooms, services, version, lastReviewed };
}
