export type RoomStatus = 'available' | 'upcoming';

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: RoomStatus;
  order: number;
}

export interface Comparison {
  /** Id de un servicio del catálogo, o el nombre de un servicio de AWS que no está en el catálogo. */
  target: string;
  /** Cuándo conviene elegir un servicio u otro. */
  difference: string;
}

export interface Service {
  id: string;
  name: string;
  roomId: string;
  summary: string;
  useCases: string[];
  examConcepts: string[];
  compareWith: Comparison[];
  examTraps: string[];
  costNote: string;
  tags?: string[];
}

export interface ContentCatalog {
  rooms: Room[];
  services: Service[];
  version: string;
  lastReviewed: string;
}
