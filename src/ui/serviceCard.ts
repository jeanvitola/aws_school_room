import type { ResolvedComparison, ResolvedTarget } from '../domain/catalog';
import type { DepthLevel, Service } from '../domain/types';
import { renderDepthSelector } from './depthSelector';

export type HeadingLevel = 2 | 3 | 4;

export interface CardOptions {
  resolveComparisons: (serviceId: string) => ResolvedComparison[];
  /** Resuelve un id o nombre de AWS visto desde la ficha de `fromServiceId`. */
  resolveTarget: (target: string, fromServiceId: string) => ResolvedTarget;
  /** Si se define, los servicios abribles de la misma sala se muestran como enlaces. */
  onSelectService?: (serviceId: string) => void;
  /** Prefijo para ids únicos cuando la misma ficha aparece en otra vista. */
  idPrefix: string;
}

function heading(level: HeadingLevel, text: string): HTMLHeadingElement {
  const element = document.createElement(`h${level}`);
  element.textContent = text;
  return element;
}

function paragraph(text: string, className?: string): HTMLParagraphElement {
  const element = document.createElement('p');
  element.textContent = text;
  if (className) element.className = className;
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

/** Nombre de un servicio referenciado: enlace si se puede abrir, texto en otro caso. */
function serviceReference(resolved: ResolvedTarget, options: CardOptions): HTMLElement {
  const { service } = resolved;
  if (resolved.isOpenable && service && options.onSelectService) {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'service-link';
    link.textContent = resolved.label;
    link.addEventListener('click', () => options.onSelectService?.(service.id));
    return link;
  }
  const text = document.createElement('span');
  text.textContent = resolved.label;
  return text;
}

function createSectionFactory(service: Service, level: HeadingLevel, options: CardOptions) {
  return function section(key: string, title: string, ...content: HTMLElement[]): HTMLElement {
    const element = document.createElement('section');
    element.className = `card-section card-section--${key}`;
    const sectionHeading = heading(level, title);
    sectionHeading.id = `${options.idPrefix}-${service.id}-${key}`;
    element.setAttribute('aria-labelledby', sectionHeading.id);
    element.append(sectionHeading, ...content);
    return element;
  };
}

function glossaryList(service: Service): HTMLDListElement {
  const list = document.createElement('dl');
  list.className = 'glossary';
  for (const { term, definition } of service.normal.glossary) {
    const termElement = document.createElement('dt');
    termElement.textContent = term;
    const definitionElement = document.createElement('dd');
    definitionElement.textContent = definition;
    list.append(termElement, definitionElement);
  }
  return list;
}

function quickComparison(service: Service, options: CardOptions): HTMLElement[] {
  const { target, rule } = service.normal.quickComparison;
  const question = document.createElement('p');
  question.className = 'quick-comparison__question';
  question.append(
    `¿${service.name} o `,
    serviceReference(options.resolveTarget(target, service.id), options),
    '?',
  );
  return [question, paragraph(rule)];
}

/** Nivel Normal: lenguaje cotidiano. */
export function renderNormalSections(
  service: Service,
  level: HeadingLevel,
  options: CardOptions,
): HTMLElement[] {
  const section = createSectionFactory(service, level, options);
  const { normal } = service;
  const analogy = document.createElement('p');
  analogy.className = 'card-analogy';
  const analogyLabel = document.createElement('span');
  analogyLabel.className = 'card-analogy__label';
  analogyLabel.textContent = 'Imagínalo así';
  analogy.append(analogyLabel, ' ', normal.analogy);

  return [
    section('what-is', 'Qué es', paragraph(normal.whatIs), analogy),
    section('glossary', 'Palabras clave', glossaryList(service)),
    section('exam', 'Lo clave para el examen', bulletList(normal.examKeyPoints)),
    section('quick-comparison', 'Comparación rápida', ...quickComparison(service, options)),
    section('cost-line', 'Costo en una frase', paragraph(normal.costInOneLine)),
  ];
}

function comparisonList(service: Service, options: CardOptions): HTMLDListElement {
  const list = document.createElement('dl');
  list.className = 'comparison-list';
  for (const comparison of options.resolveComparisons(service.id)) {
    const term = document.createElement('dt');
    term.append(
      'vs. ',
      serviceReference(options.resolveTarget(comparison.target, service.id), options),
    );
    const description = document.createElement('dd');
    description.textContent = comparison.difference;
    list.append(term, description);
  }
  return list;
}

function useCaseList(service: Service): HTMLUListElement {
  const list = document.createElement('ul');
  list.className = 'use-case-list';
  for (const { scenario, example } of service.deep.useCases) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = scenario;
    item.append(title, paragraph(example, 'use-case-list__example'));
    list.append(item);
  }
  return list;
}

function patternList(service: Service, level: HeadingLevel): HTMLElement {
  const list = document.createElement('div');
  list.className = 'pattern-list';
  const patternLevel = Math.min(level + 1, 4) as HeadingLevel;
  for (const pattern of service.deep.patterns) {
    const article = document.createElement('article');
    article.className = 'pattern';
    article.append(heading(patternLevel, pattern.name), paragraph(pattern.problem));
    list.append(article);
  }
  return list;
}

/** Nivel Profundo: desglose completo para decidir entre servicios. */
export function renderDeepSections(
  service: Service,
  level: HeadingLevel,
  options: CardOptions,
): HTMLElement[] {
  const section = createSectionFactory(service, level, options);
  const { deep } = service;
  const traps = section('traps', 'Trampas del examen', bulletList(deep.examTraps));
  traps.prepend(alertIcon());

  return [
    section('definition', 'Definición y funcionamiento', paragraph(deep.definition)),
    section('concepts', 'Conceptos clave y límites', bulletList(deep.keyConcepts)),
    section('comparison', 'Comparación detallada', comparisonList(service, options)),
    section('use-cases', 'Casos de uso', useCaseList(service)),
    section('patterns', 'Patrones de arquitectura', patternList(service, level)),
    traps,
    section('cost', 'Costos', paragraph(deep.costs)),
  ];
}

export function renderCardSections(
  service: Service,
  depth: DepthLevel,
  level: HeadingLevel,
  options: CardOptions,
): HTMLElement[] {
  return depth === 'normal'
    ? renderNormalSections(service, level, options)
    : renderDeepSections(service, level, options);
}

export interface ServiceCardHandlers extends Omit<CardOptions, 'idPrefix'> {
  depth: DepthLevel;
  onDepthChange: (depth: DepthLevel) => void;
  onClose: () => void;
}

/** Ficha de estudio de un servicio, como panel de diálogo no modal con selector de nivel. */
export function renderServiceCard(service: Service, handlers: ServiceCardHandlers): HTMLElement {
  const options: CardOptions = { ...handlers, idPrefix: 'card' };
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

  function showDepth(depth: DepthLevel): void {
    body.dataset.depth = depth;
    body.replaceChildren(...renderCardSections(service, depth, 3, options));
  }

  const selector = renderDepthSelector(handlers.depth, (depth) => {
    selector.setLevel(depth);
    showDepth(depth);
    body.scrollTop = 0;
    handlers.onDepthChange(depth);
  });
  const toolbar = document.createElement('div');
  toolbar.className = 'service-card__toolbar';
  toolbar.append(selector.element);

  showDepth(handlers.depth);
  card.append(header, toolbar, body);
  return card;
}
