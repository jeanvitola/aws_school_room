import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './iso';
import { SPRITE_KEYS, SPRITE_SIZES, frameCount } from './sprites';

class PreloadScene extends Phaser.Scene {
  constructor(private readonly onReady: () => void) {
    super('preload');
  }

  preload(): void {
    for (const key of SPRITE_KEYS) {
      const url = `assets/sprites/${key}.png`;
      if (frameCount(key) > 1) {
        const { width, height } = SPRITE_SIZES[key];
        this.load.spritesheet(key, url, { frameWidth: width, frameHeight: height });
      } else {
        this.load.image(key, url);
      }
    }
  }

  create(): void {
    // Cada sprite animado tiene una animación en bucle con su mismo nombre.
    for (const key of SPRITE_KEYS) {
      if (frameCount(key) === 1) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key),
        frameRate: SPRITE_SIZES[key].frameRate ?? 4,
        repeat: -1,
      });
    }
    this.onReady();
  }
}

export interface GameHandle {
  game: Phaser.Game;
  /** Se resuelve cuando todos los sprites están cargados. */
  ready: Promise<void>;
}

/** Crea el juego con resolución interna baja escalada a la ventana (pixel art nítido). */
export function createGame(
  parent: HTMLElement,
  scenes: Phaser.Types.Scenes.SceneType[] = [],
): GameHandle {
  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => (resolveReady = resolve));
  const game = new Phaser.Game({
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
    // Solo eventos sobre el canvas: un clic en la UI superpuesta (ficha, lista) no debe
    // activar la estación que queda detrás.
    input: { windowEvents: false },
    scene: [new PreloadScene(() => resolveReady()), ...scenes],
  });
  return { game, ready };
}
