import type { DecorPlacement, ServicePlacement } from './compute';

/**
 * Bodega (grilla 12×10). El recorrido va en tres filas (spec 005):
 * fila 2: objetos y archivo (S3, Glacier); fila 5: bloque y archivos (EBS, EFS, FSx);
 * fila 8: híbrido, protección y migración (Storage Gateway, Backup, DataSync, Transfer Family).
 * Cada estación se agrega cuando su ficha está escrita.
 */
export const storageLayout = {
  s3: { col: 3, row: 2, sprite: 'service-s3' },
} as const satisfies Record<string, ServicePlacement>;

/** Decoración de la Bodega (US4): estanterías y cajas. */
export const storageDecor: DecorPlacement[] = [];
