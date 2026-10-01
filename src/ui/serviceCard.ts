import type { ResolvedComparison } from '../domain/catalog';
import type { Service } from '../domain/types';

export type HeadingLevel = 2 | 3 | 4;

export interface CardOptions {
  resolveComparisons: (serviceId: string) => ResolvedComparison[];
  /** Si se define, las comparaciones con servicios de la misma sala se muestran como enlaces. */
  onSelectService?: (serviceId: string) => void;
  /** Prefijo para ids únicos cuando la misma ficha aparece en otra vista. */
  idPrefix: string;
}

function heading(level: HeadingLevel, text: string): HTMLHeadingElement {
  const element = document.createElement(`h${level}`);
  element.textContent = text;
  return element;
}

function paragraph(text: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.textContent = text;
  return element;
}

function bulletList(items: string[]): HTMLUListElement {
  const list = document.createElement('ul');
  for (const text of items) {
    const item = document.createElement('li');
    item.textContent = text;
    list.append(item);
  }
  return list;
}

function alertIcon(): HTMLSpanElement {
  const icon = document.createElement('span');
  icon.className = 'card-section__icon';
  icon.dataset.icon = 'alert';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '!';
  return icon;
}

function comparisonList(service: Service, options: CardOptions): HTMLDListElement {
  const list = document.createElement('dl');
  list.className = 'comparison-list';
  for (const comparison of options.resolveComparisons(service.id)) {
    const term = document.createElement('dt');
    term.append('vs. ');
    const compared = comparison.service;
    if (compared && compared.roomId === service.roomId && options.onSelectService) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'comparison-list__link';
      link.textContent = compared.name;
      link.addEventListener('click', () => options.onSelectService?.(compared.id));
      term.append(link);
    } else {
      term.append(compared?.name ?? comparison.target);
    }
    const description = document.createElement('dd');
    description.textContent = comparison.difference;
    list.append(term, description);
  }
  return list;
}

/** Las 6 secciones de una ficha. Se usa en el panel de la sala y en el modo texto. */
export function renderCardSections(
  service: Service,
  level: HeadingLevel,
  options: CardOptions,
): HTMLElement[] {
  function section(key: string, title: string, ...content: HTMLElement[]): HTMLElement {
    const element = document.createElement('section');
    element.className = `card-section card-section--${key}`;
    const sectionHeading = heading(level, title);
    sectionHeading.id = `${options.idPrefix}-${service.id}-${key}`;
    element.setAttribute('aria-labelledby', sectionHeading.id);
    element.append(sectionHeading, ...content);
    return element;
  }

  const traps = section('traps', 'Trampas del examen', bulletList(service.examTraps));
  traps.prepend(alertIcon());

  return [
    section('summary', 'Qué es', paragraph(service.summary)),
    section('use-cases', 'Casos de uso', bulletList(service.useCases)),
    section('concepts', 'Conceptos clave del examen', bulletList(service.examConcepts)),
    section('comparison', 'Comparación', comparisonList(service, options)),
    traps,
    section('cost', 'Costos', paragraph(service.costNote)),
  ];
}

export interface ServiceCardHandlers extends Omit<CardOptions, 'idPrefix'> {
  onClose: () => void;
}

/** Ficha de estudio de un servicio, como panel de diálogo no modal. */
export function renderServiceCard(service: Service, handlers: ServiceCardHandlers): HTMLElement {
  const card = document.createElement('article');
  card.className = 'service-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-labelledby', 'service-card-title');

  const header = document.createElement('header');
  header.className = 'service-card__header';
  const title = heading(2, service.name);
  title.id = 'service-card-title';
  title.tabIndex = -1;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'service-card__close';
  close.setAttribute('aria-label', 'Cerrar ficha');
  close.textContent = '✕';
  close.addEventListener('click', handlers.onClose);
  header.append(title, close);

  const body = document.createElement('div');
  body.className = 'service-card__body';
  body.append(...renderCardSections(service, 3, { ...handlers, idPrefix: 'card' }));

  card.append(header, body);
  return card;
}
