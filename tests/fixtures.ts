import type { Room, Service } from '../src/domain/types';

export function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'compute',
    name: 'Sala de Máquinas',
    slug: 'compute',
    description: 'Servicios de cómputo y escalado',
    status: 'available',
    order: 1,
    ...overrides,
  };
}

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: 'ec2',
    name: 'EC2',
    roomId: 'compute',
    summary: 'Máquinas virtuales en la nube con control total del sistema operativo.',
    useCases: ['Aplicaciones que necesitan control del sistema operativo'],
    examConcepts: ['AMI'],
    compareWith: [{ target: 'lambda', difference: 'Lambda para cargas cortas por eventos.' }],
    examTraps: ['Elegir EC2 cuando una opción serverless es suficiente.'],
    costNote: 'On-Demand, Reserved, Savings Plans o Spot.',
    ...overrides,
  };
}

export function makeRoomsFile(rooms: Room[] = [makeRoom()]) {
  return { rooms, version: '1.0.0', lastReviewed: '2026-09-30' };
}

export function makeServicesFile(services: Service[] = [makeService()]) {
  return { services };
}

export function words(count: number): string {
  return Array.from({ length: count }, (_, index) => `palabra${index}`).join(' ');
}
