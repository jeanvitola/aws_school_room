import type { SpriteKey } from '../sprites';

export interface ServicePlacement {
  col: number;
  row: number;
  sprite: SpriteKey;
}

/**
 * Sala de Máquinas como sala de informática (grilla 12×10): dos filas de estaciones con pasillos.
 * Fila del fondo: cómputo y contenedores. Fila del frente: escalado, balanceo y serverless.
 */
export const computeLayout = {
  ec2: { col: 1, row: 3, sprite: 'service-ec2' },
  ecs: { col: 4, row: 3, sprite: 'service-ecs' },
  eks: { col: 7, row: 3, sprite: 'service-eks' },
  fargate: { col: 10, row: 3, sprite: 'service-fargate' },
  lambda: { col: 3, row: 7, sprite: 'service-lambda' },
  autoscaling: { col: 6, row: 7, sprite: 'service-autoscaling' },
  elb: { col: 9, row: 7, sprite: 'service-elb' },
} as const satisfies Record<string, ServicePlacement>;

export interface DecorPlacement {
  col: number;
  row: number;
  sprite: SpriteKey;
}

/** Decoración de la sala (spec 004): racks contra las paredes y bandejas de cables en el piso. */
export const computeDecor: DecorPlacement[] = [
  { col: 0, row: 0, sprite: 'rack' },
  { col: 5, row: 0, sprite: 'rack' },
  { col: 9, row: 0, sprite: 'rack' },
  { col: 0, row: 5, sprite: 'rack' },
  { col: 6, row: 5, sprite: 'cable-tray' },
  { col: 1, row: 9, sprite: 'cable-tray' },
];
