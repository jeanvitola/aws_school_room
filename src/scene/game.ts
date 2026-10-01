import Phaser from 'phaser';

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

/** Sprites en public/assets/sprites/<key>.png */
export const SPRITE_KEYS = [
  'floor-tile',
  'wall-left',
  'wall-right',
  'service-ec2',
  'service-lambda',
  'service-ecs',
  'service-eks',
  'service-fargate',
  'service-autoscaling',
  'service-elb',
] as const;

class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload(): void {
    for (const key of SPRITE_KEYS) {
      this.load.image(key, `assets/sprites/${key}.png`);
    }
  }
}

/** Crea el juego con resolución interna baja escalada a la ventana (pixel art nítido). */
export function createGame(parent: HTMLElement, scenes: Phaser.Types.Scenes.SceneType[] = []): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    backgroundColor: '#1b1626',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PreloadScene, ...scenes],
  });
}
