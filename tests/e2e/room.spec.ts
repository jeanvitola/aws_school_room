import { expect, test } from '@playwright/test';
import roomsFile from '../../src/content/rooms.json' with { type: 'json' };
import servicesFile from '../../src/content/services.json' with { type: 'json' };
import {
  NORMAL_SECTIONS,
  clickHotspot,
  enterComputeRoom,
  serviceCard,
  serviceList,
  waitForCameraTravel,
} from './helpers';

const computeServices = servicesFile.services.filter((service) => service.roomId === 'compute');

test.describe('US2 - Sala de Máquinas', () => {
  test.beforeEach(async ({ page }) => {
    await enterComputeRoom(page);
  });

  test('lists the seven services of the room', async ({ page }) => {
    const buttons = serviceList(page).getByRole('button');

    await expect(buttons).toHaveText(computeServices.map((service) => service.name));
  });

  test('opens a service card from the list with every section', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'Amazon EC2', exact: true }).click();

    const card = serviceCard(page);
    await expect(card).toBeVisible();
    await expect(card.getByRole('heading', { level: 2 })).toHaveText('Amazon EC2');
    await expect(card.getByRole('heading', { level: 3 })).toHaveText(NORMAL_SECTIONS);
  });

  test('opens a service card by clicking its object in the room', async ({ page }) => {
    await clickHotspot(page, 'lambda');

    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('AWS Lambda');
  });

  test('keeps only the last selected card when selecting quickly', async ({ page }) => {
    const list = serviceList(page);
    await list.getByRole('button', { name: 'Amazon EC2', exact: true }).click();
    await list.getByRole('button', { name: 'AWS Lambda' }).click();
    await list.getByRole('button', { name: 'Amazon ECS' }).click();

    await expect(serviceCard(page)).toHaveCount(1);
    await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('Amazon ECS');
  });

  test('Escape closes the card and returns focus to the service', async ({ page }) => {
    const ecsButton = serviceList(page).getByRole('button', { name: 'Amazon ECS' });
    await ecsButton.click();
    await expect(serviceCard(page)).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(serviceCard(page)).toHaveCount(0);
    await expect(ecsButton).toBeFocused();
  });

  test('the close button closes the card', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'Amazon EKS' }).click();
    await serviceCard(page).getByRole('button', { name: 'Cerrar ficha' }).click();

    await expect(serviceCard(page)).toHaveCount(0);
  });

  test('"Volver al lobby" is always visible and returns to the lobby', async ({ page }) => {
    const back = page.getByRole('button', { name: 'Volver al lobby' });
    await expect(back).toBeVisible();

    await serviceList(page).getByRole('button', { name: 'AWS Fargate' }).click();
    await expect(back).toBeVisible();
    await back.click();

    await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeVisible();
    await expect(page.locator('#game')).toBeHidden();
  });

  test('text mode shows every room and the full cards of the room', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Modo texto' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    const textView = page.getByRole('region', { name: 'Torre AWS en modo texto' });
    await expect(textView).toBeVisible();
    await expect(page.locator('#game')).toBeHidden();
    for (const room of roomsFile.rooms) {
      await expect(textView.getByRole('heading', { name: room.name })).toBeVisible();
    }
    await expect(textView.getByText('Próximamente')).toHaveCount(
      roomsFile.rooms.filter((room) => room.status === 'upcoming').length,
    );
    for (const service of computeServices) {
      await expect(textView.getByRole('heading', { name: service.name, exact: true })).toBeVisible();
      await expect(textView.getByText(service.normal.whatIs)).toBeVisible();
    }

    // Spec 002: el modo texto tiene el mismo selector de nivel.
    await textView
      .getByRole('group', { name: 'Nivel de profundidad' })
      .getByRole('button', { name: 'Profundo' })
      .click();
    for (const service of computeServices) {
      await expect(textView.getByText(service.deep.definition)).toBeVisible();
    }
    await expect(textView.getByText(computeServices[0]!.normal.whatIs)).toHaveCount(0);

    await toggle.click();
    await expect(textView).toBeHidden();
    await expect(page.locator('#game canvas')).toBeVisible();
  });

  // Regresión: Phaser escuchaba clics en toda la ventana y un clic sobre la ficha activaba
  // la estación que quedaba detrás en el canvas.
  test('clicking inside the card never selects the station behind it', async ({ page }) => {
    await serviceList(page).getByRole('button', { name: 'Amazon EC2', exact: true }).click();
    const card = serviceCard(page);
    await expect(card).toBeVisible();
    await waitForCameraTravel(page);
    const box = await card.boundingBox();
    if (!box) throw new Error('La ficha no tiene tamaño');

    for (let y = box.y + 8; y < box.y + box.height - 8; y += 30) {
      await page.mouse.click(box.x + 4, y); // borde interior de la ficha, sin botones
    }

    await expect(card.getByRole('heading', { level: 2 })).toHaveText('Amazon EC2');
  });
});

// Regresión: si el usuario abre una ficha mientras los sprites todavía cargan, el render de la
// sala que esperaba la carga terminaba después con el estado viejo y cerraba la ficha.
test('a card opened while sprites are still loading stays open', async ({ page }) => {
  await page.route('**/assets/sprites/*.png', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Sala de Máquinas/ }).click();
  await serviceList(page).getByRole('button', { name: 'AWS Lambda' }).click();

  await page.waitForTimeout(2500); // la carga de sprites termina con la ficha ya abierta
  await expect(serviceCard(page).getByRole('heading', { level: 2 })).toHaveText('AWS Lambda');
});

