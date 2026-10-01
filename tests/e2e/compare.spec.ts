import { expect, test } from '@playwright/test';
import { depthButton, enterComputeRoom, serviceCard, serviceList, tabUntilFocused } from './helpers';

function comparisonSection(page: Parameters<typeof serviceCard>[0]) {
  return serviceCard(page).getByRole('region', { name: 'Comparación detallada' });
}

test.describe('US3 - Comparar servicios (nivel Profundo)', () => {
  test.beforeEach(async ({ page }) => {
    await enterComputeRoom(page);
    // Las comparaciones detalladas y las trampas viven en el nivel Profundo (spec 002).
    await serviceList(page).getByRole('button', { name: 'Amazon EKS' }).click();
    await depthButton(page, 'Profundo').click();
  });

  test('opens the compared service card from a comparison link', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'Amazon EC2', exact: true }).click();

    const link = comparisonSection(page).getByRole('button', { name: 'AWS Lambda' });
    await expect(comparisonSection(page)).toContainText('15 minutos');
    await link.click();

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('AWS Lambda');
  });

  test('opens the compared service with the keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
    await serviceList(page).getByRole('button', { name: 'Amazon ECS' }).click();

    await tabUntilFocused(page, comparisonSection(page).getByRole('button', { name: 'Amazon EKS' }));
    await page.keyboard.press('Enter');

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('Amazon EKS');
  });

  test('shows a comparison with a service outside the catalog as plain text', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'Elastic Load Balancing' }).click();

    await expect(comparisonSection(page)).toContainText('Amazon Route 53');
    await expect(comparisonSection(page).getByRole('button', { name: /Route 53/ })).toHaveCount(0);
  });

  test('highlights the exam traps section', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'AWS Fargate' }).click();

    const traps = serviceCard(page).getByRole('region', { name: 'Trampas del examen' });
    await expect(traps).toBeVisible();
    await expect(traps).toHaveCSS('border-left-width', '4px');
    await expect(traps.locator('[data-icon="alert"]')).toBeVisible();
  });
});
