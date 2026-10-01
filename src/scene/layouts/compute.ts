import type { SpriteKey } from '../sprites';

export interface ServicePlacement {
  col: number;
  row: number;
  sprite: SpriteKey;
}

/** Ubicación de cada servicio en la Sala de Máquinas (grilla 8×8), por id de servicio. */
export const computeLayout = {
  ec2: { col: 1, row: 1, sprite: 'service-ec2' },
  ecs: { col: 4, row: 1, sprite: 'service-ecs' },
  eks: { col: 6, row: 2, sprite: 'service-eks' },
  lambda: { col: 1, row: 4, sprite: 'service-lambda' },
  autoscaling: { col: 3, row: 4, sprite: 'service-autoscaling' },
  fargate: { col: 6, row: 5, sprite: 'service-fargate' },
  elb: { col: 3, row: 6, sprite: 'service-elb' },
} as const satisfies Record<string, ServicePlacement>;
