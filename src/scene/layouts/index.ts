import { computeDecor, computeLayout, type DecorPlacement, type ServicePlacement } from './compute';
import { storageDecor, storageLayout } from './storage';

export interface RoomLayout {
  /** serviceId → posición y sprite de su estación. */
  stations: Record<string, ServicePlacement>;
  /** Objetos decorativos, sin interacción. */
  decor: DecorPlacement[];
  /** Filas de estaciones (orden del recorrido); el test de layout lo comprueba. */
  rows: number;
}

/** Distribución de cada sala disponible. Una sala nueva solo agrega su entrada (spec 005). */
export const ROOM_LAYOUTS: Record<string, RoomLayout> = {
  compute: { stations: computeLayout, decor: computeDecor, rows: 2 },
  storage: { stations: storageLayout, decor: storageDecor, rows: 1 },
};
