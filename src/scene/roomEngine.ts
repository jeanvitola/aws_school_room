import { createGame } from './game';
import { ROOM_SCENE_KEY, RoomScene, type RoomSceneData } from './RoomScene';

/**
 * Fachada del motor de la sala. Es el único módulo que `main.ts` importa de Phaser, y lo hace con
 * un import dinámico: el lobby no descarga el motor (T047).
 */
export interface RoomEngine {
  /** Se resuelve cuando los sprites están cargados. */
  ready: Promise<void>;
  start(data: RoomSceneData, onCreated: () => void): void;
  stop(): void;
  isActive(): boolean;
  scene(): RoomScene;
}

export function createRoomEngine(container: HTMLElement): RoomEngine {
  const { game, ready } = createGame(container, [RoomScene]);
  const scene = () => game.scene.getScene(ROOM_SCENE_KEY) as RoomScene;

  return {
    ready,
    start(data, onCreated) {
      game.scale.refresh();
      scene().events.once('create', onCreated);
      game.scene.start(ROOM_SCENE_KEY, data);
    },
    stop: () => game.scene.stop(ROOM_SCENE_KEY),
    isActive: () => game.scene.isActive(ROOM_SCENE_KEY),
    scene,
  };
}
