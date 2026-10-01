import './styles/main.css';
import './styles/lobby.css';
import './styles/room.css';
import roomsFile from './content/rooms.json';
import servicesFile from './content/services.json';
import { ContentValidationError, loadCatalog } from './content/schema';
import { getRoom } from './domain/catalog';
import { createNavigation, type NavigationState } from './domain/navigation';
import type { ContentCatalog } from './domain/types';
import { createGame } from './scene/game';
import { ROOM_SCENE_KEY, RoomScene, type RoomSceneData } from './scene/RoomScene';
import { renderLobby } from './ui/lobby';
import { renderNavBar } from './ui/navBar';

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento #${id} en index.html`);
  return element;
}

function renderContentError(ui: HTMLElement, error: unknown): void {
  const details = error instanceof ContentValidationError ? error.issues : [String(error)];
  const box = document.createElement('section');
  box.className = 'app-error';
  box.setAttribute('role', 'alert');
  const title = document.createElement('h1');
  title.textContent = 'No se pudo cargar el contenido';
  const list = document.createElement('ul');
  for (const detail of details) {
    const item = document.createElement('li');
    item.textContent = detail;
    list.append(item);
  }
  box.append(title, list);
  ui.replaceChildren(box);
}

function start(): void {
  const ui = getElement('ui');
  const gameContainer = getElement('game');

  let catalog: ContentCatalog;
  try {
    catalog = loadCatalog(roomsFile, servicesFile);
  } catch (error) {
    renderContentError(ui, error);
    return;
  }

  const navigation = createNavigation(catalog);
  const { game, ready } = createGame(gameContainer, [RoomScene]);
  const lobby = renderLobby(catalog, navigation);
  let currentRoomId: string | null = null;

  async function showRoom(roomId: string): Promise<void> {
    if (currentRoomId === roomId) return;
    currentRoomId = roomId;
    const room = getRoom(catalog, roomId);
    if (!room) return;

    ui.replaceChildren(renderNavBar(room));
    gameContainer.hidden = false;
    await ready;
    game.scale.refresh();
    const data: RoomSceneData = { roomId };
    game.scene.start(ROOM_SCENE_KEY, data);
  }

  function showLobby(): void {
    currentRoomId = null;
    game.scene.stop(ROOM_SCENE_KEY);
    gameContainer.hidden = true;
    ui.replaceChildren(lobby);
  }

  function render(state: NavigationState): void {
    if (state.view === 'lobby') showLobby();
    else void showRoom(state.roomId);
  }

  navigation.subscribe(render);
  render(navigation.getState());
}

start();
