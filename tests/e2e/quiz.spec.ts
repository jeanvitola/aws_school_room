import { expect, test, type Page } from '@playwright/test';
import questionsFile from '../../src/content/questions/compute.json' with { type: 'json' };
import {
  cardTab,
  enterComputeRoom,
  serviceCard,
  serviceList,
  tabUntilFocused,
} from './helpers';

const lambdaQuestions = questionsFile.questions.filter((q) => q.serviceId === 'lambda');
const ORDER = ['normal', 'medium', 'hard'];
const ordered = [...lambdaQuestions].sort(
  (a, b) => ORDER.indexOf(a.difficulty) - ORDER.indexOf(b.difficulty),
);

function correctIndexes(questionIndex: number): number[] {
  return ordered[questionIndex]!.options.flatMap((option, i) => (option.correct ? [i] : []));
}

function wrongIndex(questionIndex: number): number {
  return ordered[questionIndex]!.options.findIndex((option) => !option.correct);
}

function quiz(page: Page) {
  return serviceCard(page).getByRole('region', { name: 'Preguntas de práctica' });
}

function option(page: Page, index: number) {
  return quiz(page).locator('.quiz__option input').nth(index);
}

async function openLambdaQuiz(page: Page) {
  await enterComputeRoom(page);
  await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
  await cardTab(page, 'Preguntas').click();
}

async function answer(page: Page, indexes: number[]) {
  for (const index of indexes) await option(page, index).check();
  await quiz(page).getByRole('button', { name: 'Responder' }).click();
}

async function answerAndContinue(page: Page, questionIndex: number, correctly: boolean) {
  const picks = correctly
    ? correctIndexes(questionIndex)
    : [wrongIndex(questionIndex), ...correctIndexes(questionIndex)].slice(
        0,
        correctIndexes(questionIndex).length,
      );
  await answer(page, picks);
  const nextLabel = questionIndex === ordered.length - 1 ? 'Ver resultado' : 'Siguiente';
  await quiz(page).getByRole('button', { name: nextLabel }).click();
}

test.describe('003 US1 - Responder preguntas', () => {
  test.beforeEach(async ({ page }) => {
    await openLambdaQuiz(page);
  });

  test('shows question 1 of 15 with its difficulty and options', async ({ page }) => {
    await expect(cardTab(page, 'Preguntas')).toHaveAttribute('aria-pressed', 'true');
    await expect(quiz(page)).toContainText('Pregunta 1 de 15 · Normal');
    await expect(quiz(page)).toContainText(ordered[0]!.prompt);
    await expect(quiz(page).getByRole('radio')).toHaveCount(4);
  });

  test('cannot answer without choosing an option', async ({ page }) => {
    await expect(quiz(page).getByRole('button', { name: 'Responder' })).toBeDisabled();
  });

  test('a wrong answer shows the correct option, every explanation and the source', async ({
    page,
  }) => {
    await answer(page, [wrongIndex(0)]);

    await expect(quiz(page).getByRole('status')).toContainText('Incorrecto');
    await expect(quiz(page).locator('.quiz__option').nth(correctIndexes(0)[0]!)).toHaveClass(
      /is-correct/,
    );
    await expect(quiz(page).locator('.quiz__option').nth(wrongIndex(0))).toHaveClass(/is-wrong/);
    for (const { explanation } of ordered[0]!.options) {
      await expect(quiz(page).getByText(explanation)).toBeVisible();
    }
    await expect(quiz(page).getByRole('link', { name: ordered[0]!.source.title })).toHaveAttribute(
      'href',
      ordered[0]!.source.url,
    );
  });

  test('a right answer is marked as correct and Siguiente advances', async ({ page }) => {
    await answer(page, correctIndexes(0));
    await expect(quiz(page).getByRole('status')).toContainText('Correcto');

    await quiz(page).getByRole('button', { name: 'Siguiente' }).click();

    await expect(quiz(page)).toContainText('Pregunta 2 de 15 · Normal');
  });

  test('keeps the progress when switching tabs and resets when closing the card', async ({
    page,
  }) => {
    await answerAndContinue(page, 0, true);
    await cardTab(page, 'Normal').click();
    await cardTab(page, 'Preguntas').click();
    await expect(quiz(page)).toContainText('Pregunta 2 de 15');

    await serviceCard(page).getByRole('button', { name: 'Cerrar ficha' }).click();
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
    await expect(cardTab(page, 'Preguntas')).toHaveAttribute('aria-pressed', 'true');
    await expect(quiz(page)).toContainText('Pregunta 1 de 15');
  });

  test('answers with the keyboard only', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
    await tabUntilFocused(page, option(page, 0));
    // Las flechas mueven la selección dentro del grupo de radios.
    for (let i = 0; i < correctIndexes(0)[0]!; i++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await tabUntilFocused(page, quiz(page).getByRole('button', { name: 'Responder' }));
    await page.keyboard.press('Enter');

    await expect(quiz(page).getByRole('status')).toContainText('Correcto');
    await expect(quiz(page).getByRole('button', { name: 'Siguiente' })).toBeFocused();
  });
});

test.describe('003 US2 - Preguntas "Elige 2"', () => {
  // Responde hasta 15 preguntas antes de verificar: en CI eso supera el límite general de 30 s.
  test.describe.configure({ timeout: 90_000 });

  const firstMultiple = ordered.findIndex((q) => q.type === 'multiple');

  test.beforeEach(async ({ page }) => {
    await openLambdaQuiz(page);
    for (let i = 0; i < firstMultiple; i++) await answerAndContinue(page, i, true);
  });

  test('requires exactly 2 options and never marks a third', async ({ page }) => {
    await expect(quiz(page)).toContainText('Elige 2');
    await expect(quiz(page).getByRole('checkbox')).toHaveCount(5);

    await option(page, 0).check();
    await expect(quiz(page).getByRole('button', { name: 'Responder' })).toBeDisabled();
    await option(page, 1).check();
    await option(page, 2).click();

    await expect(option(page, 2)).not.toBeChecked();
    await expect(quiz(page).getByRole('button', { name: 'Responder' })).toBeEnabled();
  });

  test('one right and one wrong option counts as incorrect and shows both correct', async ({
    page,
  }) => {
    const [firstCorrect] = correctIndexes(firstMultiple);
    await answer(page, [firstCorrect!, wrongIndex(firstMultiple)]);

    await expect(quiz(page).getByRole('status')).toContainText('Incorrecto');
    for (const index of correctIndexes(firstMultiple)) {
      await expect(quiz(page).locator('.quiz__option').nth(index)).toHaveClass(/is-correct/);
    }
  });
});

test.describe('003 US3 - Resultado final', () => {
  // Responde hasta 15 preguntas antes de verificar: en CI eso supera el límite general de 30 s.
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await openLambdaQuiz(page);
    // Acierta las normales y las medias, falla las difíciles.
    for (let i = 0; i < ordered.length; i++) await answerAndContinue(page, i, i < 10);
  });

  test('shows the total and the score by difficulty', async ({ page }) => {
    await expect(quiz(page)).toContainText('10 de 15');
    await expect(quiz(page)).toContainText('Normal: 5 de 5');
    await expect(quiz(page)).toContainText('Media: 5 de 5');
    await expect(quiz(page)).toContainText('Difícil: 0 de 5');
  });

  test('Reintentar goes back to question 1', async ({ page }) => {
    await quiz(page).getByRole('button', { name: 'Reintentar' }).click();
    await expect(quiz(page)).toContainText('Pregunta 1 de 15 · Normal');
  });

  test('Repasar el servicio opens the deep level', async ({ page }) => {
    await quiz(page).getByRole('button', { name: 'Repasar el servicio' }).click();

    await expect(cardTab(page, 'Profundo')).toHaveAttribute('aria-pressed', 'true');
    await expect(
      serviceCard(page).getByRole('heading', { name: 'Definición y funcionamiento' }),
    ).toBeVisible();
  });
});
