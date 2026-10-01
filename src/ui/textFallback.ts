import { getServicesByRoom, listRooms } from '../domain/catalog';
import type { ContentCatalog, DepthLevel } from '../domain/types';
import { renderDepthSelector } from './depthSelector';
import { renderCardSections, type CardOptions } from './serviceCard';

function renderRooms(
  catalog: ContentCatalog,
  options: Pick<CardOptions, 'resolveComparisons' | 'resolveTarget'>,
  depth: DepthLevel,
): HTMLElement[] {
  return listRooms(catalog).map((room) => {
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
      article.append(
        serviceTitle,
        ...renderCardSections(service, depth, 4, { ...options, idPrefix: 'text' }),
      );
      roomSection.append(article);
    }
    return roomSection;
  });
}

/** Vista alternativa en texto: todas las salas y sus fichas completas, con selector de nivel. */
export function renderTextFallback(
  catalog: ContentCatalog,
  options: Pick<CardOptions, 'resolveComparisons' | 'resolveTarget'>,
  depth: DepthLevel,
  onDepthChange: (depth: DepthLevel) => void,
): HTMLElement {
  const region = document.createElement('section');
  region.className = 'text-fallback';
  region.setAttribute('aria-label', 'Torre AWS en modo texto');

  const content = document.createElement('div');
  const selector = renderDepthSelector(depth, (next) => {
    selector.setLevel(next);
    content.replaceChildren(...renderRooms(catalog, options, next));
    onDepthChange(next);
  });
  const toolbar = document.createElement('div');
  toolbar.className = 'text-fallback__toolbar';
  toolbar.append(selector.element);

  content.replaceChildren(...renderRooms(catalog, options, depth));
  region.append(toolbar, content);
  return region;
}
