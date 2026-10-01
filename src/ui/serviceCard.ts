import type { ResolvedComparison, ResolvedTarget } from '../domain/catalog';
import { createQuizAttempt, type QuizAttempt } from '../domain/quiz';
import type { ArchitecturePattern, CardView, DepthLevel, Question, Service } from '../domain/types';
import { renderQuizView } from './quizView';
import { renderTabSelector } from './tabSelector';

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

function definitionList(entries: [string, string][], className: string): HTMLDListElement {
  const list = document.createElement('dl');
  list.className = className;
  for (const [term, definition] of entries) {
    const termElement = document.createElement('dt');
    termElement.textContent = term;
    const definitionElement = document.createElement('dd');
    definitionElement.textContent = definition;
    list.append(termElement, definitionElement);
  }
  return list;
}

/** Flujo de un patrón como lista ordenada: el orden se comunica sin depender de las flechas. */
function patternFlow(
  service: Service,
  pattern: ArchitecturePattern,
  options: CardOptions,
): HTMLOListElement {
  const flow = document.createElement('ol');
  flow.className = 'flow';
  flow.setAttribute('aria-label', `Flujo: ${pattern.name}`);
  for (const step of pattern.steps) {
    const resolved = options.resolveTarget(step.target, service.id);
    const item = document.createElement('li');
    item.className = 'flow__step';
    const chip = serviceReference(resolved, options);
    chip.classList.add('flow__chip');
    if (resolved.isCurrent) {
      item.setAttribute('aria-current', 'true');
      chip.classList.add('flow__chip--current');
    }
    item.append(chip, paragraph(step.role, 'flow__role'));
    flow.append(item);
  }
  return flow;
}

function patternList(service: Service, level: HeadingLevel, options: CardOptions): HTMLElement {
  const list = document.createElement('div');
  list.className = 'pattern-list';
  const patternLevel = Math.min(level + 1, 4) as HeadingLevel;
  for (const pattern of service.deep.patterns) {
    const article = document.createElement('article');
    article.className = 'pattern';
    article.append(
      heading(patternLevel, pattern.name),
      definitionList(
        [
          ['Problema', pattern.problem],
          ['Cuándo usarlo', pattern.whenToUse],
          ['Cuándo no usarlo', pattern.whenNotToUse],
        ],
        'pattern__details',
      ),
      patternFlow(service, pattern, options),
    );
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
    section('patterns', 'Patrones de arquitectura', patternList(service, level, options)),
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
  view: CardView;
  onViewChange: (view: CardView) => void;
  /** Preguntas de práctica del servicio; sin preguntas no se muestra la pestaña. */
  questions: Question[];
  onClose: () => void;
}

const CARD_TABS: [CardView, string][] = [
  ['normal', 'Normal'],
  ['deep', 'Profundo'],
  ['quiz', 'Preguntas'],
];

/** Ficha de estudio de un servicio: diálogo no modal con pestañas Normal / Profundo / Preguntas. */
export function renderServiceCard(service: Service, handlers: ServiceCardHandlers): HTMLElement {
  const options: CardOptions = { ...handlers, idPrefix: 'card' };
  const hasQuestions = handlers.questions.length > 0;
  // El intento vive mientras la ficha está abierta: se conserva al cambiar de pestaña.
  let attempt: QuizAttempt | null = null;

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

  function showView(view: CardView): void {
    body.dataset.view = view;
    if (view === 'quiz') {
      attempt ??= createQuizAttempt(handlers.questions);
      body.replaceChildren(renderQuizView(attempt, { onReview: () => changeView('deep') }));
    } else {
      body.replaceChildren(...renderCardSections(service, view, 3, options));
    }
  }

  function changeView(view: CardView): void {
    tabs.setActive(view);
    showView(view);
    body.scrollTop = 0;
    handlers.onViewChange(view);
  }

  const initialView = handlers.view === 'quiz' && !hasQuestions ? 'normal' : handlers.view;
  const tabs = renderTabSelector(
    'Contenido de la ficha',
    CARD_TABS.filter(([view]) => view !== 'quiz' || hasQuestions),
    initialView,
    changeView,
  );
  const toolbar = document.createElement('div');
  toolbar.className = 'service-card__toolbar';
  toolbar.append(tabs.element);

  showView(initialView);
  card.append(header, toolbar, body);
  return card;
}
