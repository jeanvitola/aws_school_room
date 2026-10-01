import type { Service } from '../domain/types';

export interface RoomServiceListHandlers {
  onSelect: (serviceId: string) => void;
  onHighlight: (serviceId: string | null) => void;
}

export interface RoomServiceList {
  element: HTMLElement;
  focusService: (serviceId: string) => void;
}

/** Lista de servicios de la sala: la vía de teclado y lector de pantalla equivalente a los objetos del canvas. */
export function renderRoomServiceList(
  services: Service[],
  handlers: RoomServiceListHandlers,
): RoomServiceList {
  const nav = document.createElement('nav');
  nav.className = 'service-list';
  nav.setAttribute('aria-label', 'Servicios en esta sala');

  const list = document.createElement('ul');
  const buttons = new Map<string, HTMLButtonElement>();

  for (const service of services) {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'service-list__button';
    button.textContent = service.name;
    button.addEventListener('click', () => handlers.onSelect(service.id));
    button.addEventListener('focus', () => handlers.onHighlight(service.id));
    button.addEventListener('mouseenter', () => handlers.onHighlight(service.id));
    button.addEventListener('blur', () => handlers.onHighlight(null));
    button.addEventListener('mouseleave', () => handlers.onHighlight(null));
    buttons.set(service.id, button);
    item.append(button);
    list.append(item);
  }

  nav.append(list);
  return {
    element: nav,
    focusService: (serviceId) => buttons.get(serviceId)?.focus(),
  };
}
