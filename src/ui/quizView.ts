import type { QuizAttempt } from '../domain/quiz';
import type { Difficulty } from '../domain/types';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  normal: 'Normal',
  medium: 'Media',
  hard: 'Difícil',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

export interface QuizViewHandlers {
  /** "Repasar el servicio": vuelve a la ficha en nivel Profundo. */
  onReview: () => void;
}

function button(text: string, className: string, onClick: () => void): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.textContent = text;
  element.addEventListener('click', onClick);
  return element;
}

function text(tag: 'p' | 'span' | 'strong', content: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = content;
  if (className) element.className = className;
  return element;
}

function progressBar(attempt: QuizAttempt): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'quiz__bar';
  bar.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('div');
  fill.className = 'quiz__bar-fill';
  const answered = attempt.index + (attempt.phase === 'answering' ? 0 : 1);
  fill.style.width = `${(answered / attempt.total) * 100}%`;
  bar.append(fill);
  return bar;
}

function resultMessage(correct: number, total: number): string {
  const ratio = correct / total;
  if (ratio >= 0.8) return '¡Excelente! Dominas este servicio para el examen.';
  if (ratio >= 0.6) return 'Buen avance. Repasa las preguntas que fallaste en el nivel Profundo.';
  return 'Conviene repasar el servicio en el nivel Profundo y volver a intentarlo.';
}

/**
 * Vista de las preguntas de práctica. Dibuja el estado del intento (dominio) y lo actualiza
 * con las acciones del usuario. El intento vive fuera de la vista para conservar el avance.
 */
export function renderQuizView(attempt: QuizAttempt, handlers: QuizViewHandlers): HTMLElement {
  const region = document.createElement('section');
  region.className = 'quiz';
  region.setAttribute('aria-label', 'Preguntas de práctica');

  function render(focus?: 'first-option' | 'next' | 'summary'): void {
    region.replaceChildren(...(attempt.phase === 'finished' ? renderSummary() : renderQuestion()));
    if (focus === 'first-option') region.querySelector<HTMLElement>('.quiz__option input')?.focus();
    if (focus === 'next') region.querySelector<HTMLElement>('.quiz__next')?.focus();
    if (focus === 'summary') region.querySelector<HTMLElement>('.quiz__summary-title')?.focus();
  }

  function renderQuestion(): HTMLElement[] {
    const question = attempt.current();
    const answered = attempt.phase === 'answered';
    const result = attempt.lastResult;
    const isMultiple = question.type === 'multiple';

    const progress = text(
      'p',
      `Pregunta ${attempt.index + 1} de ${attempt.total} · ${DIFFICULTY_LABELS[question.difficulty]}`,
      'quiz__progress',
    );

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quiz__question';
    const legend = document.createElement('legend');
    legend.className = 'quiz__prompt';
    legend.textContent = question.prompt;
    fieldset.append(legend);
    if (isMultiple) fieldset.append(text('p', 'Elige 2 opciones.', 'quiz__hint'));

    const inputName = `quiz-${question.id}`;
    question.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'quiz__option';
      const input = document.createElement('input');
      input.type = isMultiple ? 'checkbox' : 'radio';
      input.name = inputName;
      input.checked = attempt.selected.includes(index);
      input.disabled = answered;
      input.addEventListener('change', () => {
        attempt.select(index);
        // Sincroniza con el dominio: en "Elige 2" no se marca una tercera opción.
        fieldset.querySelectorAll<HTMLInputElement>('input').forEach((element, i) => {
          element.checked = attempt.selected.includes(i);
        });
        submit.disabled = !attempt.canSubmit();
      });

      const body = document.createElement('span');
      body.className = 'quiz__option-body';
      body.append(
        text('strong', `${OPTION_LETTERS[index]}.`, 'quiz__letter'),
        text('span', ` ${option.text}`),
      );
      label.append(input, body);

      if (answered && result) {
        const isCorrect = result.correctIndexes.includes(index);
        const wasChosen = attempt.selected.includes(index);
        if (isCorrect) label.classList.add('is-correct');
        if (wasChosen && !isCorrect) label.classList.add('is-wrong');
        body.append(text('p', option.explanation, 'quiz__explanation'));
      }
      fieldset.append(label);
    });

    const feedback = document.createElement('div');
    feedback.className = 'quiz__feedback';
    feedback.setAttribute('role', 'status');
    if (answered && result) {
      feedback.classList.add(result.correct ? 'is-correct' : 'is-wrong');
      feedback.append(
        text('strong', result.correct ? '¡Correcto!' : 'Incorrecto'),
        text(
          'span',
          result.correct ? '' : ` La respuesta correcta está marcada en verde.`,
        ),
      );
    }

    const submit = button('Responder', 'quiz__submit', () => {
      attempt.submit();
      render('next');
    });
    submit.disabled = !attempt.canSubmit();

    const actions = document.createElement('div');
    actions.className = 'quiz__actions';
    if (answered) {
      const isLast = attempt.index === attempt.total - 1;
      actions.append(
        button(isLast ? 'Ver resultado' : 'Siguiente', 'quiz__next', () => {
          attempt.next();
          render(attempt.phase === 'finished' ? 'summary' : 'first-option');
        }),
      );
    } else {
      actions.append(submit);
    }

    const elements: HTMLElement[] = [progress, progressBar(attempt), fieldset, feedback, actions];
    if (answered) {
      const source = document.createElement('p');
      source.className = 'quiz__source';
      const link = document.createElement('a');
      link.href = question.source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = question.source.title;
      source.append('Fuente oficial: ', link, ` · verificado el ${question.verifiedOn}`);
      elements.push(source);
    }
    return elements;
  }

  function renderSummary(): HTMLElement[] {
    const summary = attempt.summary();
    const title = text('strong', 'Resultado', 'quiz__summary-title');
    title.tabIndex = -1;

    const total = text('p', `${summary.correct} de ${summary.total} correctas`, 'quiz__score');
    const list = document.createElement('ul');
    list.className = 'quiz__breakdown';
    for (const [difficulty, score] of Object.entries(summary.byDifficulty) as [
      Difficulty,
      { correct: number; total: number },
    ][]) {
      const item = document.createElement('li');
      item.textContent = `${DIFFICULTY_LABELS[difficulty]}: ${score.correct} de ${score.total}`;
      list.append(item);
    }

    const actions = document.createElement('div');
    actions.className = 'quiz__actions';
    actions.append(
      button('Reintentar', 'quiz__submit', () => {
        attempt.restart();
        render('first-option');
      }),
      button('Repasar el servicio', 'quiz__secondary', handlers.onReview),
    );

    return [
      title,
      total,
      list,
      text('p', resultMessage(summary.correct, summary.total), 'quiz__message'),
      actions,
    ];
  }

  render();
  return region;
}
