import { getRoom, getService } from './catalog';
import type { ContentCatalog } from './types';

export type NavigationState =
  | { view: 'lobby' }
  | { view: 'room'; roomId: string }
  | { view: 'card'; roomId: string; serviceId: string };

export type NavigationResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'upcoming' | 'not-in-room' };

export type NavigationListener = (state: NavigationState) => void;

export interface Navigation {
  getState(): NavigationState;
  enterRoom(roomId: string): NavigationResult;
  selectService(serviceId: string): NavigationResult;
  closeCard(): void;
  goToLobby(): void;
  subscribe(listener: NavigationListener): () => void;
}

/** Recorrido lobby → sala → ficha. Solo guarda estado; no sabe nada de Phaser ni del DOM. */
export function createNavigation(catalog: ContentCatalog): Navigation {
  let state: NavigationState = { view: 'lobby' };
  const listeners = new Set<NavigationListener>();

  function setState(next: NavigationState): void {
    state = next;
    for (const listener of listeners) listener(state);
  }

  return {
    getState: () => state,

    enterRoom(roomId) {
      const room = getRoom(catalog, roomId);
      if (!room) return { ok: false, reason: 'not-found' };
      if (room.status === 'upcoming') return { ok: false, reason: 'upcoming' };
      setState({ view: 'room', roomId });
      return { ok: true };
    },

    selectService(serviceId) {
      if (state.view === 'lobby') return { ok: false, reason: 'not-in-room' };
      const service = getService(catalog, serviceId);
      if (service?.roomId !== state.roomId) return { ok: false, reason: 'not-in-room' };
      setState({ view: 'card', roomId: state.roomId, serviceId });
      return { ok: true };
    },

    closeCard() {
      if (state.view === 'card') setState({ view: 'room', roomId: state.roomId });
    },

    goToLobby() {
      if (state.view !== 'lobby') setState({ view: 'lobby' });
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
