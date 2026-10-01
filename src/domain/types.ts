export type RoomStatus = 'available' | 'upcoming';

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: RoomStatus;
  order: number;
}

/** Nivel de lectura de una ficha. Preferencia de la visita; no se guarda. */
export type DepthLevel = 'normal' | 'deep';
export const DEFAULT_DEPTH_LEVEL: DepthLevel = 'normal';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface QuickComparison {
  /** Id de un servicio del catálogo o nombre de un servicio de AWS. */
  target: string;
  /** Regla corta para elegir entre ambos. */
  rule: string;
}

/** Nivel Normal: lenguaje cotidiano para entender el servicio sin conocimientos previos. */
export interface NormalContent {
  whatIs: string;
  analogy: string;
  glossary: GlossaryTerm[];
  examKeyPoints: string[];
  quickComparison: QuickComparison;
  costInOneLine: string;
}

export interface Comparison {
  /** Id de un servicio del catálogo, o el nombre de un servicio de AWS que no está en el catálogo. */
  target: string;
  /** Cuándo conviene elegir un servicio u otro. */
  difference: string;
}

export interface UseCase {
  scenario: string;
  example: string;
}

export interface PatternStep {
  /** Id de un servicio del catálogo o nombre de un servicio de AWS. */
  target: string;
  role: string;
}

export interface ArchitecturePattern {
  name: string;
  problem: string;
  whenToUse: string;
  whenNotToUse: string;
  steps: PatternStep[];
}

/** Nivel Profundo: desglose completo para decidir entre servicios. */
export interface DeepContent {
  definition: string;
  keyConcepts: string[];
  compareWith: Comparison[];
  useCases: UseCase[];
  patterns: ArchitecturePattern[];
  examTraps: string[];
  costs: string;
}

export interface Service {
  id: string;
  name: string;
  roomId: string;
  normal: NormalContent;
  deep: DeepContent;
  tags?: string[];
}

export interface ContentCatalog {
  rooms: Room[];
  services: Service[];
  version: string;
  lastReviewed: string;
}

// --- Preguntas de práctica (spec 003) ---

export type Difficulty = 'normal' | 'medium' | 'hard';
export const DIFFICULTY_ORDER: Difficulty[] = ['normal', 'medium', 'hard'];

/** single: 4 opciones y 1 correcta. multiple: "Elige 2", 5 opciones y 2 correctas. */
export type QuestionType = 'single' | 'multiple';

export interface QuestionOption {
  text: string;
  correct: boolean;
  explanation: string;
}

export interface Question {
  id: string;
  serviceId: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  source: { title: string; url: string };
  /** Fecha (ISO) en que se verificó contra la fuente oficial. */
  verifiedOn: string;
}

/** Pestaña activa de la ficha. Se mantiene entre servicios durante la visita. */
export type CardView = DepthLevel | 'quiz';
export const DEFAULT_CARD_VIEW: CardView = 'normal';
