import { expect, test } from '@playwright/test';
import servicesFile from '../../src/content/services.json' with { type: 'json' };
import {
  DEEP_SECTIONS,
  NORMAL_SECTIONS,
  clickHotspot,
  depthButton,
  enterComputeRoom,
  serviceCard,
  serviceList,
  tabUntilFocused,
  waitForCameraTravel,
} from './helpers';

const lambda = servicesFile.services.find((service) => service.id === 'lambda')!;

test.describe('002 US1 - Nivel Normal', () => {
  test.beforeEach(async ({ page }) => {
    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
  });

  test('opens in the Normal level with its five sections', async ({ page }) => {
    await expect(depthButton(page, 'Normal')).toHaveAttribute('aria-pressed', 'true');
    await expect(depthButton(page, 'Profundo')).toHaveAttribute('aria-pressed', 'false');
    await expect(serviceCard(page).getByRole('heading', { level: 3 })).toHaveText(NORMAL_SECTIONS);
  });

  test('explains the service in plain language with an analogy and key words', async ({ page }) => {
    const card = serviceCard(page);

    await expect(card.getByText(lambda.normal.whatIs)).toBeVisible();
    await expect(card.getByText(lambda.normal.analogy)).toBeVisible();
    for (const { term } of lambda.normal.glossary) {
      await expect(card.getByRole('term').filter({ hasText: term })).toBeVisible();
    }
  });

  test('the quick comparison opens the compared service', async ({ page }) => {
    const quick = serviceCard(page).getByRole('region', { name: 'Comparación rápida' });
    await expect(quick).toContainText(lambda.normal.quickComparison.rule);

    await quick.getByRole('button', { name: 'Amazon EC2' }).click();

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('Amazon EC2');
  });
});

test.describe('002 US2 - Nivel Profundo', () => {
  test.beforeEach(async ({ page }) => {
    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
  });

  test('shows the seven deep sections', async ({ page }) => {
    await depthButton(page, 'Profundo').click();

    await expect(depthButton(page, 'Profundo')).toHaveAttribute('aria-pressed', 'true');
    await expect(serviceCard(page).getByRole('heading', { level: 3 })).toHaveText(DEEP_SECTIONS);
    await expect(serviceCard(page).getByText(lambda.deep.definition)).toBeVisible();
    await expect(serviceCard(page).getByText(lambda.deep.useCases[0]!.example)).toBeVisible();
  });

  test('keeps the deep level when opening other services', async ({ page }) => {
    await depthButton(page, 'Profundo').click();

    await serviceList(page).getByRole('button', { name: 'Amazon ECS' }).click();
    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('Amazon ECS');
    await expect(depthButton(page, 'Profundo')).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Escape');
    await waitForCameraTravel(page);
    await clickHotspot(page, 'elb');
    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText(
      'Elastic Load Balancing',
    );
    await expect(depthButton(page, 'Profundo')).toHaveAttribute('aria-pressed', 'true');
  });

  test('switches back to Normal without closing the card', async ({ page }) => {
    await depthButton(page, 'Profundo').click();
    await depthButton(page, 'Normal').click();

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('AWS Lambda');
    await expect(serviceCard(page).getByRole('heading', { level: 3 })).toHaveText(NORMAL_SECTIONS);
  });

  test('goes back to Normal after reloading the page', async ({ page }) => {
    await depthButton(page, 'Profundo').click();

    await page.reload();
    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();

    await expect(depthButton(page, 'Normal')).toHaveAttribute('aria-pressed', 'true');
  });

  test('scrolls the card to the top when changing level', async ({ page }) => {
    const body = serviceCard(page).locator('.service-card__body');
    await depthButton(page, 'Profundo').click();
    await body.evaluate((element) => (element.scrollTop = element.scrollHeight));

    await depthButton(page, 'Normal').click();
    await depthButton(page, 'Profundo').click();

    await expect.poll(() => body.evaluate((element) => element.scrollTop)).toBe(0);
  });

  test('changes level with the keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
    await tabUntilFocused(page, depthButton(page, 'Profundo'));
    await page.keyboard.press('Enter');

    await expect(depthButton(page, 'Profundo')).toHaveAttribute('aria-pressed', 'true');
    await expect(depthButton(page, 'Profundo')).toBeFocused();
  });
});

