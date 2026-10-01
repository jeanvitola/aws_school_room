import { expect, type Locator, type Page } from '@playwright/test';
import { GAME_WIDTH, isoToScreen, worldToView } from '../../src/scene/iso';
import { computeLayout } from '../../src/scene/layouts/compute';

export const CARD_SECTIONS = [
  'Qué es',
  'Casos de uso',
  'Conceptos clave del examen',
  'Comparación',
  'Trampas del examen',
  'Costos',
];

export async function enterComputeRoom(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Sala de Máquinas/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Sala de Máquinas' })).toBeVisible();
}

export function serviceList(page: Page): Locator {
  return page.getByRole('navigation', { name: 'Servicios en esta sala' });
}

export function serviceCard(page: Page): Locator {
  return page.getByRole('dialog');
}

/** Hace clic sobre el sprite de un servicio en el canvas, a partir del layout y la escala del juego. */
export async function clickHotspot(page: Page, serviceId: keyof typeof computeLayout): Promise<void> {
  const placement = computeLayout[serviceId];
  const canvas = page.locator('#game canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('El canvas no tiene tamaño');

  const scale = box.width / GAME_WIDTH;
  const tile = isoToScreen(placement.col, placement.row);
  // El sprite se apoya sobre el centro de la baldosa: se hace clic en su mitad.
  const target = worldToView({ x: tile.x, y: tile.y - 12 });
  await page.mouse.click(box.x + target.x * scale, box.y + target.y * scale);
}

/** Pulsa Tab (o Shift+Tab) hasta que el elemento tenga el foco. */
export async function tabUntilFocused(page: Page, target: Locator, key = 'Tab'): Promise<void> {
  for (let i = 0; i < 30; i++) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}
