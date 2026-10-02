import { expect, test } from '@playwright/test';
import { enterComputeRoom, serviceCard, serviceList } from './helpers';

test.describe('Preferencia "reducir movimiento"', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('desactiva las animaciones de la interfaz', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.lobby__title')).toHaveCSS('animation-name', 'none');

    await enterComputeRoom(page);
    await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();
    await expect(serviceCard(page)).toHaveCSS('animation-name', 'none');
    await expect(serviceCard(page)).toHaveCSS('opacity', '1');
  });

  test('la sala se dibuja sin movimiento', async ({ page }) => {
    await enterComputeRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-motion', 'reduced');
  });

  test('sin la preferencia, la sala mantiene sus animaciones', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await enterComputeRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-motion', 'full');
  });
});
