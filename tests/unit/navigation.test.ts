import { describe, expect, it, vi } from 'vitest';
import { createNavigation } from '../../src/domain/navigation';
import type { ContentCatalog } from '../../src/domain/types';
import { makeRoom, makeService } from '../fixtures';

const catalog: ContentCatalog = {
  version: '1.0.0',
  lastReviewed: '2026-09-30',
  rooms: [
    makeRoom({ id: 'compute' }),
    makeRoom({ id: 'storage', slug: 'storage', status: 'upcoming', order: 2 }),
  ],
  services: [
    makeService({ id: 'ec2', roomId: 'compute' }),
    makeService({ id: 'lambda', roomId: 'compute' }),
  ],
};

function navigationInRoom() {
  const navigation = createNavigation(catalog);
  navigation.enterRoom('compute');
  return navigation;
}

describe('navigation', () => {
  it('starts in the lobby', () => {
    expect(createNavigation(catalog).getState()).toEqual({ view: 'lobby' });
  });

  describe('enterRoom', () => {
    it('enters an available room', () => {
      const navigation = createNavigation(catalog);

      expect(navigation.enterRoom('compute')).toEqual({ ok: true });
      expect(navigation.getState()).toEqual({ view: 'room', roomId: 'compute' });
    });

    it('rejects an upcoming room and stays in the lobby', () => {
      const navigation = createNavigation(catalog);

      expect(navigation.enterRoom('storage')).toEqual({ ok: false, reason: 'upcoming' });
      expect(navigation.getState()).toEqual({ view: 'lobby' });
    });

    it('rejects an unknown room', () => {
      const navigation = createNavigation(catalog);

      expect(navigation.enterRoom('missing')).toEqual({ ok: false, reason: 'not-found' });
      expect(navigation.getState()).toEqual({ view: 'lobby' });
    });
  });

  describe('selectService', () => {
    it('opens the card of a service in the current room', () => {
      const navigation = navigationInRoom();

      expect(navigation.selectService('ec2')).toEqual({ ok: true });
      expect(navigation.getState()).toEqual({ view: 'card', roomId: 'compute', serviceId: 'ec2' });
    });

    it('replaces the active card when another service is selected', () => {
      const navigation = navigationInRoom();
      navigation.selectService('ec2');
      navigation.selectService('lambda');

      expect(navigation.getState()).toEqual({
        view: 'card',
        roomId: 'compute',
        serviceId: 'lambda',
      });
    });

    it('rejects a service outside the current room', () => {
      const navigation = navigationInRoom();

      expect(navigation.selectService('s3')).toEqual({ ok: false, reason: 'not-in-room' });
      expect(navigation.getState()).toEqual({ view: 'room', roomId: 'compute' });
    });

    it('rejects selecting a service from the lobby', () => {
      const navigation = createNavigation(catalog);

      expect(navigation.selectService('ec2')).toEqual({ ok: false, reason: 'not-in-room' });
      expect(navigation.getState()).toEqual({ view: 'lobby' });
    });
  });

  it('closeCard returns to the room', () => {
    const navigation = navigationInRoom();
    navigation.selectService('ec2');
    navigation.closeCard();

    expect(navigation.getState()).toEqual({ view: 'room', roomId: 'compute' });
  });

  it('goToLobby works from the room and from a card', () => {
    const fromRoom = navigationInRoom();
    fromRoom.goToLobby();
    expect(fromRoom.getState()).toEqual({ view: 'lobby' });

    const fromCard = navigationInRoom();
    fromCard.selectService('ec2');
    fromCard.goToLobby();
    expect(fromCard.getState()).toEqual({ view: 'lobby' });
  });

  it('notifies subscribers on every state change and supports unsubscribing', () => {
    const navigation = createNavigation(catalog);
    const listener = vi.fn();
    const unsubscribe = navigation.subscribe(listener);

    navigation.enterRoom('compute');
    navigation.selectService('ec2');
    navigation.enterRoom('storage'); // rechazado: no notifica
    unsubscribe();
    navigation.goToLobby();

    expect(listener.mock.calls).toEqual([
      [{ view: 'room', roomId: 'compute' }],
      [{ view: 'card', roomId: 'compute', serviceId: 'ec2' }],
    ]);
  });
});
