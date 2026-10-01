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
