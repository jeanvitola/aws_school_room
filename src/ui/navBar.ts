import type { Room } from '../domain/types';

/** Barra superior de la sala: muestra la sala actual. */
export function renderNavBar(room: Room): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'nav-bar';

  const title = document.createElement('h1');
  title.className = 'nav-bar__title';
  title.textContent = room.name;

  bar.append(title);
  return bar;
}
