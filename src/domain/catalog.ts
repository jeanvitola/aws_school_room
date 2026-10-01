import type { Comparison, ContentCatalog, Room, Service } from './types';

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

export interface ResolvedComparison extends Comparison {
  /** El servicio comparado si está en el catálogo; undefined si es solo un nombre de AWS. */
  service: Service | undefined;
}

export function resolveComparisons(
  catalog: ContentCatalog,
  serviceId: string,
): ResolvedComparison[] {
  const service = getService(catalog, serviceId);
  if (!service) return [];
  return service.deep.compareWith.map((comparison) => ({
    ...comparison,
    service: getService(catalog, comparison.target),
  }));
}

export interface ResolvedTarget {
  /** Texto a mostrar: nombre del servicio o el texto del target si es externo. */
  label: string;
  service: Service | undefined;
  /** Es el servicio de la ficha desde la que se referencia. */
  isCurrent: boolean;
  /** Existe en la misma sala y no es el actual: se puede abrir su ficha. */
  isOpenable: boolean;
}

/** Resuelve una referencia (id o nombre de AWS) vista desde la ficha de `fromServiceId`. */
export function resolveTarget(
  catalog: ContentCatalog,
  target: string,
  fromServiceId: string,
): ResolvedTarget {
  const service = getService(catalog, target);
  const from = getService(catalog, fromServiceId);
  const isCurrent = service?.id === fromServiceId;
  return {
    label: service?.name ?? target,
    service,
    isCurrent,
    isOpenable: Boolean(service && from && !isCurrent && service.roomId === from.roomId),
  };
}
