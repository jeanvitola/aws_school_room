/** Sprites en public/assets/sprites/<key>.png */
export const SPRITE_KEYS = [
  'floor-tile',
  'wall-left',
  'wall-right',
  'workstation',
  'service-ec2',
  'service-lambda',
  'service-ecs',
  'service-eks',
  'service-fargate',
  'service-autoscaling',
  'service-elb',
] as const;

export type SpriteKey = (typeof SPRITE_KEYS)[number];
