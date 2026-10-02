import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { cardTab, enterComputeRoom, serviceList } from './helpers';

/** Revisa la página con axe (WCAG 2.1 A y AA) y falla ante violaciones serias o críticas. */
async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      id: violation.id,
      help: violation.help,
      targets: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
    }));
  expect(serious).toEqual([]);
}

test.describe('Accesibilidad (axe)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('lobby', async ({ page }) => {
    await page.goto('/');
    await expectNoSeriousViolations(page);
  });

  test('sala', async ({ page }) => {
    await enterComputeRoom(page);
    await expectNoSeriousViolations(page);
  });

  test('ficha en nivel Normal y Profundo', async ({ page }) => {
    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
    await expectNoSeriousViolations(page);

    await cardTab(page, 'Profundo').click();
    await expectNoSeriousViolations(page);
  });

  test('preguntas, antes y después de responder', async ({ page }) => {
    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
    await cardTab(page, 'Preguntas').click();
    await expectNoSeriousViolations(page);

    await page.locator('.quiz__option input').first().check();
    await page.getByRole('button', { name: 'Responder' }).click();
    await expectNoSeriousViolations(page);
  });

  test('modo texto', async ({ page }) => {
    await enterComputeRoom(page);
    await page.getByRole('button', { name: 'Modo texto' }).click();
    await expectNoSeriousViolations(page);
  });
});
