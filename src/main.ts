import './styles/main.css';
import roomsFile from './content/rooms.json';
import servicesFile from './content/services.json';
import { ContentValidationError, loadCatalog } from './content/schema';
import { createNavigation } from './domain/navigation';
import type { ContentCatalog } from './domain/types';
import { createGame } from './scene/game';

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Falta el elemento #${id} en index.html`);
  return element;
}

function renderContentError(ui: HTMLElement, error: unknown): void {
  const details =
    error instanceof ContentValidationError ? error.issues : [String(error)];
  ui.innerHTML = '';
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
  ui.append(box);
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
  createGame(gameContainer);
  gameContainer.hidden = true;

  // Las vistas (lobby, sala, ficha) se conectan a `navigation` en las fases de cada user story.
  const heading = document.createElement('h1');
  heading.textContent = 'Torre AWS';
  ui.append(heading);
  void navigation;
}

start();
