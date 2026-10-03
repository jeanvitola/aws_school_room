import { expect, test, type Page } from '@playwright/test';
import { enterComputeRoom } from './helpers';

/** JavaScript descargado desde que se abre la página. */
function trackScripts(page: Page) {
  const bodies: string[] = [];
  page.on('response', async (response) => {
    if (response.request().resourceType() !== 'script') return;
    const body = await response.body().catch(() => Buffer.alloc(0));
    bodies.push(body.toString('utf8'));
  });
  return {
    bytes: () => bodies.reduce((total, body) => total + Buffer.byteLength(body), 0),
    includes: (text: string) => bodies.some((body) => body.includes(text)),
  };
}

/** Id de una pregunta de la Sala de Máquinas: aparece solo en el archivo de preguntas de esa sala. */
const COMPUTE_QUESTION_ID = 'lambda-n1';

/**
 * Presupuesto de JavaScript del lobby (sin comprimir). Incluye las fichas validadas al inicio y Zod;
 * el motor de la sala (Phaser, ≈ 1,2 MB) y las preguntas de cada sala se descargan al entrar (005).
 */
const LOBBY_SCRIPT_BUDGET = 300 * 1024;

test.describe('Rendimiento (T047)', () => {
  test('el lobby no descarga el motor del juego', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    const scripts = trackScripts(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeVisible();
    await page.waitForLoadState('networkidle');

    expect(scripts.bytes()).toBeLessThan(LOBBY_SCRIPT_BUDGET);
  });

  test('el motor se descarga al entrar a una sala', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    const scripts = trackScripts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const lobbyBytes = scripts.bytes();

    await enterComputeRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-room-ready', 'true');

    expect(scripts.bytes() - lobbyBytes).toBeGreaterThan(500 * 1024);
  });

  test('las preguntas de una sala se descargan recién al entrar a ella (005)', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Una pasada en escritorio basta');
    const scripts = trackScripts(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(scripts.includes(COMPUTE_QUESTION_ID)).toBe(false);

    await enterComputeRoom(page);
    await expect(page.locator('#game')).toHaveAttribute('data-room-ready', 'true');
    expect(scripts.includes(COMPUTE_QUESTION_ID)).toBe(true);
  });
});
