import { expect, test } from '@playwright/test';
import servicesFile from '../../src/content/services.json' with { type: 'json' };
import { DEEP_SECTIONS, NORMAL_SECTIONS, cardTab, serviceCard, serviceList } from './helpers';

const storageServices = servicesFile.services.filter((service) => service.roomId === 'storage');
const computeServices = servicesFile.services.filter((service) => service.roomId === 'compute');

async function enterStorageRoom(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Bodega/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Bodega' })).toBeVisible();
}

test.describe('005 US1 - Bodega', () => {
  test('the Bodega is available in the lobby and opens with a click', async ({ page }) => {
    await page.goto('/');
    const door = page.getByRole('button', { name: /Bodega/ });
    await expect(door).not.toContainText('Próximamente');
    await door.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Bodega' })).toBeVisible();
  });

  test('lists the storage stations in the order of the tour', async ({ page }) => {
    await enterStorageRoom(page);
    await expect(serviceList(page).getByRole('button')).toHaveText(
      storageServices.map((service) => service.name),
    );
  });

  test('opens the S3 card with its Normal and Deep levels', async ({ page }) => {
    await enterStorageRoom(page);
    await serviceList(page).getByRole('button', { name: 'Amazon S3' }).click();
    const card = serviceCard(page);
    await expect(card.getByRole('heading', { level: 2, name: 'Amazon S3' })).toBeVisible();
    for (const section of NORMAL_SECTIONS) {
      await expect(card.getByRole('heading', { name: section, exact: true })).toBeVisible();
    }
    await cardTab(page, 'Profundo').click();
    for (const section of DEEP_SECTIONS) {
      await expect(card.getByRole('heading', { name: section, exact: true })).toBeVisible();
    }
  });

  test('text mode shows the storage cards', async ({ page }) => {
    await enterStorageRoom(page);
    await page.getByRole('button', { name: 'Modo texto' }).click();
    const textView = page.getByRole('region', { name: 'Torre AWS en modo texto' });
    for (const service of storageServices) {
      await expect(
        textView.getByRole('heading', { name: service.name, exact: true }),
      ).toBeVisible();
    }
  });

  test('going back and entering the compute room shows its own stations', async ({ page }) => {
    await enterStorageRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-room-ready', 'true');
    await page.getByRole('button', { name: 'Volver al lobby' }).click();
    await page.getByRole('button', { name: /Sala de Máquinas/ }).click();
    await expect(serviceList(page).getByRole('button')).toHaveText(
      computeServices.map((service) => service.name),
    );
    await expect(page.locator('#game')).toHaveAttribute('data-room-ready', 'true');
  });
});

test.describe('005 US3 - Preguntas de la Bodega', () => {
  test('the S3 questions start at question 1 of 15', async ({ page }) => {
    await enterStorageRoom(page);
    await serviceList(page).getByRole('button', { name: 'Amazon S3' }).click();
    await cardTab(page, 'Preguntas').click();
    await expect(serviceCard(page)).toContainText('Pregunta 1 de 15 · Normal');
  });
});
