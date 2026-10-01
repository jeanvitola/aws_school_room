import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './game';

export const ROOM_SCENE_KEY = 'room';

const TILE_WIDTH = 32;
const TILE_HEIGHT = 16;
const GRID_SIZE = 8;

export interface RoomSceneData {
  roomId: string;
}

/** Convierte una celda de la grilla isométrica al centro de la baldosa en pantalla. */
export function isoToScreen(col: number, row: number, originX: number, originY: number) {
  return {
    x: originX + (col - row) * (TILE_WIDTH / 2),
    y: originY + (col + row) * (TILE_HEIGHT / 2),
  };
}

/** Sala isométrica. Solo dibuja e interpreta input; las reglas viven en src/domain/. */
export class RoomScene extends Phaser.Scene {
  constructor() {
    super(ROOM_SCENE_KEY);
  }

  create(): void {
    const originX = GAME_WIDTH / 2;
    const originY = (GAME_HEIGHT - GRID_SIZE * TILE_HEIGHT) / 2 + 24;

    this.drawWalls(originX, originY);
    this.drawFloor(originX, originY);
    this.cameras.main.fadeIn(250, 27, 22, 38);
  }

  private drawFloor(originX: number, originY: number): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { x, y } = isoToScreen(col, row, originX, originY);
        const tile = this.add.image(x, y, 'floor-tile');
        if ((col + row) % 2 === 1) tile.setTint(0xe6d2bb);
      }
    }
  }

  private drawWalls(originX: number, originY: number): void {
    for (let i = 0; i < GRID_SIZE; i++) {
      // Pared del fondo izquierdo: sobre el borde superior-izquierdo de las baldosas col = 0.
      const left = isoToScreen(0, i, originX, originY);
      this.add.image(left.x - TILE_WIDTH / 2, left.y, 'wall-right').setOrigin(0, 1);
      // Pared del fondo derecho: sobre el borde superior-derecho de las baldosas row = 0.
      const right = isoToScreen(i, 0, originX, originY);
      this.add.image(right.x + TILE_WIDTH / 2, right.y, 'wall-left').setOrigin(1, 1);
    }
  }
}
