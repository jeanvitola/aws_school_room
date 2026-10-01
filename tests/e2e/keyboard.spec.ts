import { expect, test } from '@playwright/test';
import { serviceCard, serviceList, tabUntilFocused } from './helpers';

test('completes the learning loop using only the keyboard', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
  await page.goto('/');

  // Lobby → sala
  await tabUntilFocused(page, page.getByRole('button', { name: /Sala de Máquinas/ }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Sala de Máquinas' })).toBeVisible();

  // Sala → ficha
  const lambdaButton = serviceList(page).getByRole('button', { name: 'AWS Lambda' });
  await tabUntilFocused(page, lambdaButton);
  await page.keyboard.press('Enter');
  const card = serviceCard(page);
  await expect(card).toBeVisible();
  await expect(card.locator(':focus')).toHaveCount(1);

  // Ficha → sala
  await page.keyboard.press('Escape');
  await expect(card).toHaveCount(0);
  await expect(lambdaButton).toBeFocused();

  // Sala → lobby
  await tabUntilFocused(page, page.getByRole('button', { name: 'Volver al lobby' }), 'Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeVisible();
});
