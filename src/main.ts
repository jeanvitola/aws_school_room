import './styles/main.css';
import './styles/lobby.css';
import './styles/room.css';
import roomsFile from './content/rooms.json';
import servicesFile from './content/services.json';
import questionsFile from './content/questions.json';
import { loadQuestions } from './content/questionSchema';
import { ContentValidationError, loadCatalog } from './content/schema';
import {
  getRoom,
  getService,
  getServicesByRoom,
  resolveComparisons,
  resolveTarget,
} from './domain/catalog';
import { createNavigation, type NavigationState } from './domain/navigation';
import {
  DEFAULT_CARD_VIEW,
  type CardView,
  type ContentCatalog,
  type Question,
  type Service,
} from './domain/types';
import { computeDecor, computeLayout, type ServicePlacement } from './scene/layouts/compute';
import type { Hotspot, RoomSceneData, ViewFraction } from './scene/RoomScene';
import type { RoomEngine } from './scene/roomEngine';
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
  let questionsByService: Map<string, Question[]>;
  try {
    catalog = loadCatalog(roomsFile, servicesFile);
    questionsByService = loadQuestions(questionsFile, catalog);
  } catch (error) {
    renderContentError(ui, error);
    return;
  }

  const navigation = createNavigation(catalog);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gameContainer.dataset.motion = reducedMotion ? 'reduced' : 'full';
  // El motor (Phaser) se descarga recién al entrar a la primera sala (T047).
  let engine: RoomEngine | null = null;
  let enginePromise: Promise<RoomEngine> | null = null;
  const loadEngine = () =>
    (enginePromise ??= import('./scene/roomEngine').then(({ createRoomEngine }) => {
      engine = createRoomEngine(gameContainer);
      return engine;
    }));
  const lobby = renderLobby(catalog, navigation);
  const resolveServiceComparisons = (serviceId: string) => resolveComparisons(catalog, serviceId);
  const resolveServiceTarget = (target: string, fromServiceId: string) =>
    resolveTarget(catalog, target, fromServiceId);
  // Pestaña de las fichas (Normal / Profundo / Preguntas): se mantiene durante la visita y
  // vuelve a Normal al recargar.
  let cardView: CardView = DEFAULT_CARD_VIEW;
  let roomView: RoomView | null = null;
  let textMode = false;

  function setGameVisible(visible: boolean): void {
    gameContainer.hidden = !visible;
  }

  function showLobby(): void {
    roomView = null;
    textMode = false;
    document.body.dataset.view = 'lobby';
    engine?.stop();
    delete gameContainer.dataset.roomReady;
    setGameVisible(false);
    ui.replaceChildren(lobby);
  }

  function renderRoomContent(view: RoomView): void {
    if (textMode) {
      const textFallback = renderTextFallback(
        catalog,
        { resolveComparisons: resolveServiceComparisons, resolveTarget: resolveServiceTarget },
        cardView === 'deep' ? 'deep' : 'normal',
        (depth) => (cardView = depth),
      );
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
        onHighlight: (serviceId) => {
          if (engine?.isActive()) engine.scene().setHighlighted(serviceId);
        },
      }),
    };
    roomView = view;
    document.body.dataset.view = 'room';
    renderRoomContent(view);

    const roomEngine = await loadEngine();
    await roomEngine.ready;
    const data: RoomSceneData = {
      hotspots: toHotspots(services, ROOM_LAYOUTS[roomId] ?? {}),
      decor: roomId === 'compute' ? computeDecor : [],
      reducedMotion,
      onSelect: (serviceId) => navigation.selectService(serviceId),
    };
    // `data-room-ready` indica que las estaciones ya existen y responden a clics.
    gameContainer.dataset.roomReady = 'false';
    roomEngine.start(data, () => (gameContainer.dataset.roomReady = 'true'));
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
        resolveTarget: resolveServiceTarget,
        view: cardView,
        onViewChange: (view) => (cardView = view),
        questions: questionsByService.get(service.id) ?? [],
        onSelectService: (id) => navigation.selectService(id),
        onClose: () => navigation.closeCard(),
      });
      ui.append(view.card);
      view.card.querySelector<HTMLElement>('h2')?.focus();
    } else if (previousServiceId) {
      view.serviceList.focusService(previousServiceId);
    }
    if (engine?.isActive()) {
      engine.scene().setSelected(serviceId, focusFractionBeside(view.card));
    }
  }

  async function render(state: NavigationState): Promise<void> {
    if (state.view === 'lobby') {
      showLobby();
      return;
    }
    const view = roomView?.roomId === state.roomId ? roomView : await enterRoom(state.roomId);
    // Mientras se esperaba la carga de la sala, el usuario pudo navegar (p. ej. abrir una ficha):
    // ese render más nuevo ya dibujó el estado actual y este no debe pisarlo con el estado viejo.
    if (!view || navigation.getState() !== state) return;
    showCard(view, state.view === 'card' ? state.serviceId : null);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.getState().view === 'card') navigation.closeCard();
  });

  navigation.subscribe((state) => void render(state));
  void render(navigation.getState());
}

start();
