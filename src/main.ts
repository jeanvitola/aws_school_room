import './styles/main.css';
import './styles/lobby.css';
import './styles/room.css';
import roomsFile from './content/rooms.json';
import servicesFile from './content/services.json';
import { ContentValidationError, loadCatalog } from './content/schema';
import { getRoom, getService, getServicesByRoom, resolveComparisons } from './domain/catalog';
import { createNavigation, type NavigationState } from './domain/navigation';
import type { ContentCatalog, Service } from './domain/types';
import { createGame } from './scene/game';
import { computeLayout, type ServicePlacement } from './scene/layouts/compute';
import {
  ROOM_SCENE_KEY,
  RoomScene,
  type Hotspot,
  type RoomSceneData,
  type ViewFraction,
} from './scene/RoomScene';
import { renderLobby } from './ui/lobby';
import { renderNavBar, type NavBar } from './ui/navBar';
import { renderRoomServiceList, type RoomServiceList } from './ui/roomServiceList';
import { renderServiceCard } from './ui/serviceCard';
import { renderTextFallback } from './ui/textFallback';

const ROOM_LAYOUTS: Record<string, Record<string, ServicePlacement>> = {
  compute: computeLayout,
};

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

function toHotspots(services: Service[], layout: Record<string, ServicePlacement>): Hotspot[] {
  return services.flatMap((service) => {
    const placement = layout[service.id];
    return placement ? [{ id: service.id, name: service.name, ...placement }] : [];
  });
}

/** Dónde dejar la estación seleccionada para que no la tape la ficha. */
function focusFractionBeside(card: HTMLElement | null): ViewFraction {
  const canvas = document.querySelector('#game canvas');
  if (!card || !canvas) return { x: 0.5, y: 0.5 };
  const canvasRect = canvas.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  if (canvasRect.width === 0 || canvasRect.height === 0) return { x: 0.5, y: 0.5 };

  const isBottomSheet = cardRect.left <= canvasRect.left + 1;
  if (isBottomSheet) {
    const visibleHeight = Math.max(cardRect.top - canvasRect.top, 0);
    return { x: 0.5, y: Math.max(visibleHeight / 2 / canvasRect.height, 0.15) };
  }
  const visibleWidth = Math.max(cardRect.left - canvasRect.left, 0);
  return { x: Math.max(visibleWidth / 2 / canvasRect.width, 0.2), y: 0.5 };
}

interface RoomView {
  roomId: string;
  navBar: NavBar;
  serviceList: RoomServiceList;
  card: HTMLElement | null;
  openServiceId: string | null;
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
  const resolveServiceComparisons = (serviceId: string) => resolveComparisons(catalog, serviceId);
  let textFallback: HTMLElement | null = null;
  let roomView: RoomView | null = null;
  let textMode = false;

  const roomScene = () => game.scene.getScene(ROOM_SCENE_KEY) as RoomScene;

  function setGameVisible(visible: boolean): void {
    gameContainer.hidden = !visible;
  }

  function showLobby(): void {
    roomView = null;
    textMode = false;
    document.body.dataset.view = 'lobby';
    game.scene.stop(ROOM_SCENE_KEY);
    setGameVisible(false);
    ui.replaceChildren(lobby);
  }

  function renderRoomContent(view: RoomView): void {
    if (textMode) {
      textFallback ??= renderTextFallback(catalog, {
        resolveComparisons: resolveServiceComparisons,
      });
      setGameVisible(false);
      ui.replaceChildren(view.navBar.element, textFallback);
    } else {
      setGameVisible(true);
      ui.replaceChildren(view.navBar.element, view.serviceList.element);
      if (view.card) ui.append(view.card);
    }
  }

  async function enterRoom(roomId: string): Promise<RoomView | null> {
    const room = getRoom(catalog, roomId);
    if (!room) return null;
    const services = getServicesByRoom(catalog, roomId);

    const view: RoomView = {
      roomId,
      card: null,
      openServiceId: null,
      navBar: renderNavBar(room, {
        onBack: () => navigation.goToLobby(),
        onToggleTextMode: () => {
          textMode = !textMode;
          view.navBar.setTextMode(textMode);
          navigation.closeCard();
          renderRoomContent(view);
        },
      }),
      serviceList: renderRoomServiceList(services, {
        onSelect: (serviceId) => navigation.selectService(serviceId),
        onHighlight: (serviceId) => roomScene().setHighlighted(serviceId),
      }),
    };
    roomView = view;
    document.body.dataset.view = 'room';
    renderRoomContent(view);

    await ready;
    game.scale.refresh();
    const data: RoomSceneData = {
      hotspots: toHotspots(services, ROOM_LAYOUTS[roomId] ?? {}),
      onSelect: (serviceId) => navigation.selectService(serviceId),
    };
    game.scene.start(ROOM_SCENE_KEY, data);
    return view;
  }

  function showCard(view: RoomView, serviceId: string | null): void {
    if (view.openServiceId === serviceId) return;
    const previousServiceId = view.openServiceId;
    view.card?.remove();
    view.card = null;
    view.openServiceId = serviceId;

    if (serviceId) {
      const service = getService(catalog, serviceId);
      if (!service) return;
      view.card = renderServiceCard(service, {
        resolveComparisons: resolveServiceComparisons,
        onSelectService: (id) => navigation.selectService(id),
        onClose: () => navigation.closeCard(),
      });
      ui.append(view.card);
      view.card.querySelector<HTMLElement>('h2')?.focus();
    } else if (previousServiceId) {
      view.serviceList.focusService(previousServiceId);
    }
    if (game.scene.isActive(ROOM_SCENE_KEY)) {
      roomScene().setSelected(serviceId, focusFractionBeside(view.card));
    }
  }

  async function render(state: NavigationState): Promise<void> {
    if (state.view === 'lobby') {
      showLobby();
      return;
    }
    const view = roomView?.roomId === state.roomId ? roomView : await enterRoom(state.roomId);
    if (!view) return;
    showCard(view, state.view === 'card' ? state.serviceId : null);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.getState().view === 'card') navigation.closeCard();
  });

  navigation.subscribe((state) => void render(state));
  void render(navigation.getState());
}

start();
