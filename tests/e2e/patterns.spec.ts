import { expect, test, type Page } from '@playwright/test';
import { depthButton, enterComputeRoom, serviceCard, serviceList, tabUntilFocused } from './helpers';

async function openDeepCard(page: Page, serviceName: string) {
  await enterComputeRoom(page);
  await serviceList(page).getByRole('button', { name: serviceName, exact: true }).click();
  await depthButton(page, 'Profundo').click();
}

function patterns(page: Page) {
  return serviceCard(page).getByRole('region', { name: 'Patrones de arquitectura' });
}

function flowOf(page: Page, patternName: string) {
  return patterns(page).getByRole('list', { name: `Flujo: ${patternName}` });
}

test.describe('002 US3 - Patrones de arquitectura', () => {
  test('shows a pattern with problem, when to use, when not and an ordered flow', async ({
    page,
  }) => {
    await openDeepCard(page, 'AWS Lambda');
    const pattern = patterns(page).getByRole('article').filter({
      has: page.getByRole('heading', { name: 'Procesamiento de archivos por eventos' }),
    });

    for (const label of ['Problema', 'Cuándo usarlo', 'Cuándo no usarlo']) {
      await expect(pattern.getByRole('term').filter({ hasText: label })).toBeVisible();
    }
    const steps = flowOf(page, 'Procesamiento de archivos por eventos').getByRole('listitem');
    await expect(steps).toHaveCount(3);
    await expect(steps.nth(0)).toContainText('Amazon S3');
    await expect(steps.nth(1)).toContainText('AWS Lambda');
    await expect(steps.nth(2)).toContainText('Amazon DynamoDB');
  });

  test('marks the service itself as current and external services as plain text', async ({
    page,
  }) => {
    await openDeepCard(page, 'AWS Lambda');
    const steps = flowOf(page, 'Procesamiento de archivos por eventos').getByRole('listitem');

    await expect(steps.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(steps.nth(1).getByRole('button')).toHaveCount(0);
    await expect(steps.nth(0).getByRole('button')).toHaveCount(0);
  });

  test('opens a service of the room from the flow', async ({ page }) => {
    await openDeepCard(page, 'Amazon EC2');

    await flowOf(page, 'Aplicación web altamente disponible')
      .getByRole('button', { name: 'Elastic Load Balancing' })
      .click();

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText(
      'Elastic Load Balancing',
    );
  });

  test('opens a service of the flow with the keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
    await openDeepCard(page, 'Amazon EC2');

    await tabUntilFocused(
      page,
      flowOf(page, 'Aplicación web altamente disponible').getByRole('button', {
        name: 'Amazon EC2 Auto Scaling',
      }),
    );
    await page.keyboard.press('Enter');

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText(
      'Amazon EC2 Auto Scaling',
    );
  });
});
