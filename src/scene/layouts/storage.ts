import type { DecorPlacement, ServicePlacement } from './compute';

/**
 * Bodega (grilla 12×10), recorrido en tres filas (spec 005):
 * fila 2: objetos y archivo; fila 5: bloque y archivos; fila 8: híbrido, protección y migración.
 */
export const storageLayout = {
  s3: { col: 3, row: 2, sprite: 'service-s3' },
  glacier: { col: 8, row: 2, sprite: 'service-glacier' },
  ebs: { col: 2, row: 5, sprite: 'service-ebs' },
  efs: { col: 5, row: 5, sprite: 'service-efs' },
  fsx: { col: 8, row: 5, sprite: 'service-fsx' },
  'storage-gateway': { col: 1, row: 8, sprite: 'service-storage-gateway' },
  backup: { col: 4, row: 8, sprite: 'service-backup' },
  datasync: { col: 7, row: 8, sprite: 'service-datasync' },
  'transfer-family': { col: 10, row: 8, sprite: 'service-transfer-family' },
} as const satisfies Record<string, ServicePlacement>;

/** Decoración de la Bodega (US4): estanterías y cajas. */
export const storageDecor: DecorPlacement[] = [];
