import type { Room } from '../domain/types';

export interface NavBarHandlers {
  onBack: () => void;
  onToggleTextMode: () => void;
}

export interface NavBar {
  element: HTMLElement;
  setTextMode: (enabled: boolean) => void;
}

/** Barra superior de la sala: volver al lobby (siempre visible), sala actual y modo texto. */
export function renderNavBar(room: Room, handlers: NavBarHandlers): NavBar {
  const bar = document.createElement('header');
  bar.className = 'nav-bar';

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'nav-bar__button';
  back.innerHTML = '<span aria-hidden="true">←</span> Volver al lobby';
  back.addEventListener('click', handlers.onBack);

  const title = document.createElement('h1');
  title.className = 'nav-bar__title';
  title.textContent = room.name;

  const textMode = document.createElement('button');
  textMode.type = 'button';
  textMode.className = 'nav-bar__button nav-bar__toggle';
  textMode.textContent = 'Modo texto';
  textMode.setAttribute('aria-pressed', 'false');
  textMode.addEventListener('click', handlers.onToggleTextMode);

  bar.append(back, title, textMode);
  return {
    element: bar,
    setTextMode: (enabled) => textMode.setAttribute('aria-pressed', String(enabled)),
  };
}
