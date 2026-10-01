import { expect, test, type Page } from '@playwright/test';
import roomsFile from '../../src/content/rooms.json' with { type: 'json' };

const roomsInOrder = [...roomsFile.rooms].sort((a, b) => a.order - b.order);
const upcomingRoom = roomsInOrder.find((room) => room.status === 'upcoming')!;

function door(page: Page, roomName: string) {
  return page.getByRole('button', { name: new RegExp(roomName) });
}

async function expectInLobby(page: Page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeVisible();
  await expect(page.locator('#game')).toBeHidden();
}

async function expectInComputeRoom(page: Page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Sala de Máquinas' })).toBeVisible();
  await expect(page.locator('#game canvas')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Torre AWS' })).toBeHidden();
}

test.describe('US1 - Lobby', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('lists every room in order', async ({ page }) => {
    await expectInLobby(page);
    const doors = page.locator('[data-room-id]');

    await expect(doors).toHaveCount(roomsInOrder.length);
    await expect(doors).toHaveText(roomsInOrder.map((room) => new RegExp(room.name)));
  });

  test('marks upcoming rooms as "Próximamente" and disabled', async ({ page }) => {
    for (const room of roomsInOrder) {
      const roomDoor = door(page, room.name);
      if (room.status === 'upcoming') {
        await expect(roomDoor).toContainText('Próximamente');
        await expect(roomDoor).toHaveAttribute('aria-disabled', 'true');
      } else {
        await expect(roomDoor).not.toContainText('Próximamente');
        await expect(roomDoor).not.toHaveAttribute('aria-disabled', 'true');
      }
    }
  });

  test('"Próximamente" badges of the same row are aligned', async ({ page }) => {
    const badges = await page.locator('.door__badge').evaluateAll((elements) =>
      elements.map((element) => {
        const badge = element.getBoundingClientRect();
        const door = element.closest('li')!.getBoundingClientRect();
        return { doorTop: Math.round(door.top), badgeTop: Math.round(badge.top) };
      }),
    );
    const rows = new Map<number, number[]>();
    for (const { doorTop, badgeTop } of badges) rows.set(doorTop, [...(rows.get(doorTop) ?? []), badgeTop]);

    for (const tops of rows.values()) {
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
    }
  });

  test('selecting an upcoming room shows a notice and stays in the lobby', async ({ page }) => {
    // aria-disabled mantiene la puerta enfocable y clicable (muestra el aviso); Playwright la trata
    // como deshabilitada, por eso se fuerza el clic.
    await door(page, upcomingRoom.name).click({ force: true });

    await expect(page.getByRole('status')).toContainText(upcomingRoom.name);
    await expect(page.getByRole('status')).toContainText('próximamente');
    await expectInLobby(page);
  });

  test('enters the compute room with a click', async ({ page }) => {
    await door(page, 'Sala de Máquinas').click();

    await expectInComputeRoom(page);
  });

  test('enters the compute room with the keyboard', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Teclado físico: solo escritorio');
    const computeDoor = door(page, 'Sala de Máquinas');

    for (let i = 0; i < 20 && !(await computeDoor.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    await expect(computeDoor).toBeFocused();
    await page.keyboard.press('Enter');

    await expectInComputeRoom(page);
  });
});

test.describe('US1 - Lobby en móvil', () => {
  test('has no horizontal scroll at 375px and opens the room with a tap', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Solo en el proyecto mobile');
    await page.goto('/');
    await expectInLobby(page);

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);

    await door(page, 'Sala de Máquinas').tap();
    await expectInComputeRoom(page);
  });
});
