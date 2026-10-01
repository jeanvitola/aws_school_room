import Phaser from 'phaser';
import {
  FOCUS_ZOOM,
  GAME_HEIGHT,
  GAME_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  ROOM_ZOOM,
  TILE_HEIGHT,
  TILE_WIDTH,
  cameraCenterFor,
  isoToScreen,
} from './iso';
import type { SpriteKey } from './sprites';

export const ROOM_SCENE_KEY = 'room';

const ICON_SCALE = 1.5;
const HOVER_TINT = 0xffe9a8;
const MARKER_COLOR = 0xff9900;
const CAMERA_TRAVEL_MS = 450;

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

/** Dónde debe quedar la estación seleccionada dentro de la vista (0.5, 0.5 = centro). */
export interface ViewFraction {
  x: number;
  y: number;
}

interface StationView {
  focusPoint: { x: number; y: number };
  desk: Phaser.GameObjects.Image;
  icon: Phaser.GameObjects.Image;
  marker: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
}

/** Sala de informática isométrica. Solo dibuja e interpreta input; las reglas viven en src/domain/. */
export class RoomScene extends Phaser.Scene {
  private stations = new Map<string, StationView>();
  private highlightedId: string | null = null;
  private selectedId: string | null = null;

  constructor() {
    super(ROOM_SCENE_KEY);
  }

  create(data: RoomSceneData): void {
    this.stations = new Map();
    this.highlightedId = null;
    this.selectedId = null;

    this.drawWalls();
    this.drawFloor();
    const byDepth = [...data.hotspots].sort((a, b) => a.col + a.row - (b.col + b.row));
    byDepth.forEach((hotspot, index) => this.addStation(hotspot, index, data.onSelect));

    const camera = this.cameras.main;
    camera.setZoom(ROOM_ZOOM);
    camera.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    camera.fadeIn(250, 27, 22, 38);
  }

  /** Resalta una estación (hover o foco en la lista accesible). */
  setHighlighted(serviceId: string | null): void {
    this.highlightedId = serviceId;
    this.refreshStations();
  }

  /**
   * Marca la estación cuya ficha está abierta y viaja hasta ella con la cámara.
   * Con `null` vuelve a la vista general de la sala.
   */
  setSelected(serviceId: string | null, viewFraction: ViewFraction = { x: 0.5, y: 0.5 }): void {
    this.selectedId = serviceId;
    this.refreshStations();

    const station = serviceId ? this.stations.get(serviceId) : undefined;
    const camera = this.cameras.main;
    if (station) {
      const center = cameraCenterFor(station.focusPoint, viewFraction);
      camera.pan(center.x, center.y, CAMERA_TRAVEL_MS, 'Sine.easeInOut', true);
      camera.zoomTo(FOCUS_ZOOM, CAMERA_TRAVEL_MS, 'Sine.easeInOut', true);
    } else {
      camera.pan(GAME_WIDTH / 2, GAME_HEIGHT / 2, CAMERA_TRAVEL_MS, 'Sine.easeInOut', true);
      camera.zoomTo(ROOM_ZOOM, CAMERA_TRAVEL_MS, 'Sine.easeInOut', true);
    }
  }

  private refreshStations(): void {
    for (const [id, station] of this.stations) {
      const active = id === this.highlightedId || id === this.selectedId;
      for (const image of [station.desk, station.icon]) {
        if (active) image.setTint(HOVER_TINT);
        else image.clearTint();
      }
      // La etiqueta solo en hover: con la estación seleccionada, la ficha ya muestra el nombre.
      station.label.setVisible(id === this.highlightedId && id !== this.selectedId);
      station.marker.setVisible(id === this.selectedId);
    }
  }

  private drawFloor(): void {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const { x, y } = isoToScreen(col, row);
        const tile = this.add.image(x, y, 'floor-tile');
        if ((col + row) % 2 === 1) tile.setTint(0xe8ecf2);
      }
    }
  }

  private drawWalls(): void {
    // Pared del fondo izquierdo: sobre el borde superior-izquierdo de las baldosas col = 0.
    for (let row = 0; row < GRID_ROWS; row++) {
      const { x, y } = isoToScreen(0, row);
      this.add.image(x - TILE_WIDTH / 2, y, 'wall-right').setOrigin(0, 1);
    }
    // Pared del fondo derecho: sobre el borde superior-derecho de las baldosas row = 0.
    for (let col = 0; col < GRID_COLS; col++) {
      const { x, y } = isoToScreen(col, 0);
      this.add.image(x + TILE_WIDTH / 2, y, 'wall-left').setOrigin(1, 1);
    }
  }

  private addStation(hotspot: Hotspot, index: number, onSelect: (id: string) => void): void {
    const { x, y } = isoToScreen(hotspot.col, hotspot.row);

    const marker = this.add.graphics();
    marker.lineStyle(2, MARKER_COLOR, 1);
    marker.strokePoints(
      [
        new Phaser.Math.Vector2(x, y - TILE_HEIGHT),
        new Phaser.Math.Vector2(x + TILE_WIDTH, y),
        new Phaser.Math.Vector2(x, y + TILE_HEIGHT),
        new Phaser.Math.Vector2(x - TILE_WIDTH, y),
      ],
      true,
    );
    marker.setVisible(false);
    this.tweens.add({ targets: marker, alpha: 0.35, duration: 500, yoyo: true, repeat: -1 });

    // Escritorio con monitor: su base se apoya en el vértice inferior de la baldosa.
    const desk = this.add.image(x, y + TILE_HEIGHT / 2, 'workstation').setOrigin(0.5, 1);

    // Brillo de la pantalla
    const glow = this.add.rectangle(x - 2, y - 14, 6, 9, 0x7fd1e8, 0.15);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: glow,
      alpha: 0.45,
      duration: 900 + index * 70,
      ease: 'Stepped',
      easeParams: [3],
      yoyo: true,
      repeat: -1,
    });

    // Ícono del servicio flotando sobre el monitor
    const icon = this.add
      .image(x + 2, y - 21, hotspot.sprite)
      .setOrigin(0.5, 1)
      .setScale(ICON_SCALE);
    this.tweens.add({
      targets: icon,
      y: icon.y - 3,
      duration: 700,
      delay: index * 120,
      ease: 'Stepped',
      easeParams: [3],
      yoyo: true,
      repeat: -1,
    });

    const label = this.add
      .text(x + 2, icon.y - 16 * ICON_SCALE - 3, hotspot.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffd166',
        backgroundColor: '#1b1626',
        padding: { x: 4, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setResolution(3)
      .setDepth(10)
      .setVisible(false);

    // Área de clic que cubre escritorio e ícono.
    const hitArea = this.add
      .zone(x, y - 20, TILE_WIDTH + 4, 60)
      .setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => this.setHighlighted(hotspot.id));
    hitArea.on('pointerout', () => {
      if (this.highlightedId === hotspot.id) this.setHighlighted(null);
    });
    hitArea.on('pointerup', () => onSelect(hotspot.id));

    this.stations.set(hotspot.id, {
      focusPoint: { x, y: y - 16 },
      desk,
      icon,
      marker,
      label,
    });
  }
}
