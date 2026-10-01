import { getServicesByRoom, listRooms } from '../domain/catalog';
import type { ContentCatalog } from '../domain/types';
import { renderCardSections, type CardOptions } from './serviceCard';

/** Vista alternativa en texto: todas las salas y, para las disponibles, sus fichas completas. */
export function renderTextFallback(catalog: ContentCatalog, options: CardOptions): HTMLElement {
  const region = document.createElement('section');
  region.className = 'text-fallback';
  region.setAttribute('aria-label', 'Torre AWS en modo texto');

  for (const room of listRooms(catalog)) {
    const roomSection = document.createElement('section');
    roomSection.className = 'text-fallback__room';

    const title = document.createElement('h2');
    title.textContent = room.name;
    const description = document.createElement('p');
    description.textContent = room.description;
    roomSection.append(title, description);

    if (room.status === 'upcoming') {
      const status = document.createElement('p');
      status.className = 'text-fallback__status';
      status.textContent = 'Próximamente';
      roomSection.append(status);
    }

    for (const service of getServicesByRoom(catalog, room.id)) {
      const article = document.createElement('article');
      article.className = 'text-fallback__service';
      const serviceTitle = document.createElement('h3');
      serviceTitle.textContent = service.name;
      article.append(serviceTitle, ...renderCardSections(service, 4, options));
      roomSection.append(article);
    }

    region.append(roomSection);
  }
  return region;
}
