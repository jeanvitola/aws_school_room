import { expect, type Locator, type Page } from '@playwright/test';
import { CAMERA_TRAVEL_MS, GAME_WIDTH, isoToScreen, worldToView } from '../../src/scene/iso';
import { computeLayout } from '../../src/scene/layouts/compute';

export const NORMAL_SECTIONS = [
  'Qué es',
  'Palabras clave',
  'Lo clave para el examen',
  'Comparación rápida',
  'Costo en una frase',
];

export const DEEP_SECTIONS = [
  'Definición y funcionamiento',
  'Conceptos clave y límites',
  'Comparación detallada',
  'Casos de uso',
  'Patrones de arquitectura',
  'Trampas del examen',
  'Costos',
];

/** Pestaña de la ficha: Normal, Profundo o Preguntas (spec 003). */
export function cardTab(page: Page, tab: 'Normal' | 'Profundo' | 'Preguntas'): Locator {
  return serviceCard(page)
    .getByRole('group', { name: 'Contenido de la ficha' })
    .getByRole('button', { name: tab });
}

export function depthButton(page: Page, level: 'Normal' | 'Profundo'): Locator {
  return cardTab(page, level);
}

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

/** Espera a que la cámara termine de viajar (a una estación o de vuelta a la vista general). */
export async function waitForCameraTravel(page: Page): Promise<void> {
  await page.waitForTimeout(CAMERA_TRAVEL_MS + 150);
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
  // Se hace clic sobre el escritorio de la estación.
  const target = worldToView({ x: tile.x, y: tile.y - 8 });
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
