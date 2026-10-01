import type { ContentCatalog, Room, Service } from './types';

export function listRooms(catalog: ContentCatalog): Room[] {
  return [...catalog.rooms].sort((a, b) => a.order - b.order);
}

export function getRoom(catalog: ContentCatalog, roomId: string): Room | undefined {
  return catalog.rooms.find((room) => room.id === roomId);
}

export function isRoomAvailable(catalog: ContentCatalog, roomId: string): boolean {
  return getRoom(catalog, roomId)?.status === 'available';
}

export function getServicesByRoom(catalog: ContentCatalog, roomId: string): Service[] {
  return catalog.services.filter((service) => service.roomId === roomId);
}

export function getService(catalog: ContentCatalog, serviceId: string): Service | undefined {
  return catalog.services.find((service) => service.id === serviceId);
}
