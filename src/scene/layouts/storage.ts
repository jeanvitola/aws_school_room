import type { DecorPlacement, ServicePlacement } from './compute';

/**
 * Bodega (grilla 12×10): las 9 estaciones en una cuadrícula alineada de 3×3, en el orden del
 * recorrido (spec 005): objetos y archivo, bloque y archivos, híbrido, protección y migración.
 */
export const storageLayout = {
  s3: { col: 3, row: 2, sprite: 'service-s3' },
  glacier: { col: 6, row: 2, sprite: 'service-glacier' },
  ebs: { col: 9, row: 2, sprite: 'service-ebs' },
  efs: { col: 3, row: 5, sprite: 'service-efs' },
  fsx: { col: 6, row: 5, sprite: 'service-fsx' },
  'storage-gateway': { col: 9, row: 5, sprite: 'service-storage-gateway' },
  backup: { col: 3, row: 8, sprite: 'service-backup' },
  datasync: { col: 6, row: 8, sprite: 'service-datasync' },
  'transfer-family': { col: 9, row: 8, sprite: 'service-transfer-family' },
} as const satisfies Record<string, ServicePlacement>;

/** Decoración de la Bodega (US4): estanterías y cajas. */
export const storageDecor: DecorPlacement[] = [];
