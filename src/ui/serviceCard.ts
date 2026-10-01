import type { Service } from '../domain/types';

export type HeadingLevel = 2 | 3 | 4;

export interface CardOptions {
  /** Nombre a mostrar para el destino de una comparación (id del catálogo o nombre de AWS). */
  resolveTargetName: (target: string) => string;
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

function section(className: string, level: HeadingLevel, title: string, ...content: HTMLElement[]) {
  const element = document.createElement('section');
  element.className = `card-section card-section--${className}`;
  element.append(heading(level, title), ...content);
  return element;
}

function comparisonList(service: Service, options: CardOptions): HTMLDListElement {
  const list = document.createElement('dl');
  list.className = 'comparison-list';
  for (const comparison of service.compareWith) {
    const term = document.createElement('dt');
    term.textContent = `vs. ${options.resolveTargetName(comparison.target)}`;
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
  return [
    section('summary', level, 'Qué es', paragraph(service.summary)),
    section('use-cases', level, 'Casos de uso', bulletList(service.useCases)),
    section('concepts', level, 'Conceptos clave del examen', bulletList(service.examConcepts)),
    section('comparison', level, 'Comparación', comparisonList(service, options)),
    section('traps', level, 'Trampas del examen', bulletList(service.examTraps)),
    section('cost', level, 'Costos', paragraph(service.costNote)),
  ];
}

export interface ServiceCardHandlers extends CardOptions {
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
  body.append(...renderCardSections(service, 3, handlers));

  card.append(header, body);
  return card;
}
