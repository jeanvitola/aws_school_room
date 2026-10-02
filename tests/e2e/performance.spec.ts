import { expect, test, type Page } from '@playwright/test';
import { enterComputeRoom } from './helpers';

/** Bytes de JavaScript descargados desde que se abre la página. */
function trackScriptBytes(page: Page): () => number {
  let total = 0;
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return;
    const body = await response.body().catch(() => Buffer.alloc(0));
    total += body.length;
  });
  return () => total;
}

/**
 * Presupuesto de JavaScript del lobby (sin comprimir). Incluye el contenido validado al inicio
 * (preguntas ≈ 140 KB, fichas ≈ 42 KB) y Zod; el motor de la sala (Phaser, ≈ 1,2 MB) queda fuera.
 */
const LOBBY_SCRIPT_BUDGET = 300 * 1024;

test.describe('Rendimiento (T047)', () => {
  test('el lobby no descarga el motor del juego', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    const scriptBytes = trackScriptBytes(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(scriptBytes()).toBeLessThan(LOBBY_SCRIPT_BUDGET);
  });

  test('el motor se descarga al entrar a una sala', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    const scriptBytes = trackScriptBytes(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const lobbyBytes = scriptBytes();

    await enterComputeRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-room-ready', 'true');

    expect(scriptBytes() - lobbyBytes).toBeGreaterThan(500 * 1024);
  });
});
