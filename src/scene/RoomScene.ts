import Phaser from 'phaser';
import { GRID_SIZE, ROOM_ZOOM, TILE_HEIGHT, TILE_WIDTH, isoToScreen } from './iso';
import type { SpriteKey } from './sprites';

export const ROOM_SCENE_KEY = 'room';

const SPRITE_SCALE = 2;
const HOVER_TINT = 0xffe9a8;
const MARKER_COLOR = 0xff9900;

export interface Hotspot {
  id: string;
  name: string;
  col: number;
  row: number;
  sprite: SpriteKey;
}

export interface RoomSceneData {
  hotspots: Hotspot[];
  onSelect: (serviceId: string) => void;
}

interface HotspotView {
  sprite: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
}

/** Sala isométrica. Solo dibuja e interpreta input; las reglas viven en src/domain/. */
export class RoomScene extends Phaser.Scene {
  private views = new Map<string, HotspotView>();
  private highlightedId: string | null = null;
  private selectedId: string | null = null;

  constructor() {
    super(ROOM_SCENE_KEY);
  }

  create(data: RoomSceneData): void {
    this.views = new Map();
    this.highlightedId = null;
    this.selectedId = null;

    this.drawWalls();
    this.drawFloor();
    const byDepth = [...data.hotspots].sort((a, b) => a.col + a.row - (b.col + b.row));
    byDepth.forEach((hotspot, index) => this.addHotspot(hotspot, index, data.onSelect));
    this.cameras.main.setZoom(ROOM_ZOOM);
    this.cameras.main.fadeIn(250, 27, 22, 38);
  }

  /** Resalta un servicio (hover o foco en la lista accesible). */
  setHighlighted(serviceId: string | null): void {
    this.highlightedId = serviceId;
    this.refreshHotspots();
  }

  /** Marca el servicio cuya ficha está abierta. */
  setSelected(serviceId: string | null): void {
    this.selectedId = serviceId;
    this.refreshHotspots();
  }

  private refreshHotspots(): void {
    for (const [id, view] of this.views) {
      const highlighted = id === this.highlightedId;
      const selected = id === this.selectedId;
      if (highlighted || selected) view.sprite.setTint(HOVER_TINT);
      else view.sprite.clearTint();
      view.label.setVisible(highlighted || selected);
      view.marker.setVisible(selected);
    }
  }

  private drawFloor(): void {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const { x, y } = isoToScreen(col, row);
        const tile = this.add.image(x, y, 'floor-tile');
        if ((col + row) % 2 === 1) tile.setTint(0xe6d2bb);
      }
    }
  }

  private drawWalls(): void {
    for (let i = 0; i < GRID_SIZE; i++) {
      // Pared del fondo izquierdo: sobre el borde superior-izquierdo de las baldosas col = 0.
      const left = isoToScreen(0, i);
      this.add.image(left.x - TILE_WIDTH / 2, left.y, 'wall-right').setOrigin(0, 1);
      // Pared del fondo derecho: sobre el borde superior-derecho de las baldosas row = 0.
      const right = isoToScreen(i, 0);
      this.add.image(right.x + TILE_WIDTH / 2, right.y, 'wall-left').setOrigin(1, 1);
    }
  }

  private addHotspot(hotspot: Hotspot, index: number, onSelect: (id: string) => void): void {
    const { x, y } = isoToScreen(hotspot.col, hotspot.row);

    const marker = this.add.graphics();
    marker.lineStyle(2, MARKER_COLOR, 1);
    marker.strokePoints(
      [
        new Phaser.Math.Vector2(x, y - TILE_HEIGHT / 2),
        new Phaser.Math.Vector2(x + TILE_WIDTH / 2, y),
        new Phaser.Math.Vector2(x, y + TILE_HEIGHT / 2),
        new Phaser.Math.Vector2(x - TILE_WIDTH / 2, y),
      ],
      true,
    );
    marker.setVisible(false);
    this.tweens.add({ targets: marker, alpha: 0.35, duration: 500, yoyo: true, repeat: -1 });

    this.add.ellipse(x, y + 2, 20, 8, 0x000000, 0.25);

    const sprite = this.add
      .image(x, y + 4, hotspot.sprite)
      .setOrigin(0.5, 1)
      .setScale(SPRITE_SCALE)
      .setInteractive({ useHandCursor: true });
    this.tweens.add({
      targets: sprite,
      y: sprite.y - 2,
      duration: 700,
      delay: index * 120,
      ease: 'Stepped',
      easeParams: [2],
      yoyo: true,
      repeat: -1,
    });

    const label = this.add
      .text(x, y - 16 * SPRITE_SCALE - 4, hotspot.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffd166',
        backgroundColor: '#1b1626',
        padding: { x: 4, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setResolution(2)
      .setDepth(10)
      .setVisible(false);

    sprite.on('pointerover', () => this.setHighlighted(hotspot.id));
    sprite.on('pointerout', () => {
      if (this.highlightedId === hotspot.id) this.setHighlighted(null);
    });
    sprite.on('pointerup', () => onSelect(hotspot.id));

    this.views.set(hotspot.id, { sprite, marker, label });
  }
}
