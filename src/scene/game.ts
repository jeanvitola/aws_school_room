import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './iso';
import { SPRITE_KEYS } from './sprites';

class PreloadScene extends Phaser.Scene {
  constructor(private readonly onReady: () => void) {
    super('preload');
  }

  preload(): void {
    for (const key of SPRITE_KEYS) {
      this.load.image(key, `assets/sprites/${key}.png`);
    }
  }

  create(): void {
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
