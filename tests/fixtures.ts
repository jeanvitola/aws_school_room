import type {
  ArchitecturePattern,
  DeepContent,
  NormalContent,
  Room,
  Service,
} from '../src/domain/types';

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

export function makeNormal(overrides: Partial<NormalContent> = {}): NormalContent {
  return {
    whatIs: 'Servidores virtuales que alquilas en la nube.',
    analogy: 'Es como alquilar un computador en lugar de comprarlo.',
    glossary: [{ term: 'Instancia', definition: 'Un servidor virtual.' }],
    examKeyPoints: ['Tú administras el sistema operativo.'],
    quickComparison: { target: 'lambda', rule: 'Tareas cortas por eventos → Lambda.' },
    costInOneLine: 'Pagas por el tiempo que la instancia está encendida.',
    ...overrides,
  };
}

export function makePattern(
  serviceId: string,
  overrides: Partial<ArchitecturePattern> = {},
): ArchitecturePattern {
  return {
    name: 'Aplicación web en capas',
    problem: 'Servir una web con alta disponibilidad.',
    whenToUse: 'Cuando hay tráfico constante.',
    whenNotToUse: 'Cuando la carga es esporádica.',
    steps: [
      { target: 'elb', role: 'Reparte el tráfico' },
      { target: serviceId, role: 'Ejecuta la aplicación' },
    ],
    ...overrides,
  };
}

export function makeDeep(serviceId: string, overrides: Partial<DeepContent> = {}): DeepContent {
  return {
    definition: 'Máquinas virtuales con control total del sistema operativo.',
    keyConcepts: ['AMI'],
    compareWith: [{ target: 'lambda', difference: 'Lambda para cargas cortas por eventos.' }],
    useCases: [{ scenario: 'Migrar servidores', example: 'Mover un ERP on-premises.' }],
    patterns: [makePattern(serviceId)],
    examTraps: ['Elegir EC2 cuando una opción serverless es suficiente.'],
    costs: 'On-Demand, Reserved, Savings Plans o Spot.',
    ...overrides,
  };
}

export function makeService(overrides: Partial<Service> = {}): Service {
  const id = overrides.id ?? 'ec2';
  return {
    id,
    name: 'EC2',
    roomId: 'compute',
    normal: makeNormal(),
    deep: makeDeep(id),
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
