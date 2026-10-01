import type {
  ArchitecturePattern,
  DeepContent,
  NormalContent,
  Question,
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

// --- Preguntas (spec 003) ---

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  const type = overrides.type ?? 'single';
  const optionCount = type === 'single' ? 4 : 5;
  const correctIndexes = type === 'single' ? [0] : [0, 1];
  return {
    id: 'ec2-q',
    serviceId: 'ec2',
    difficulty: 'normal',
    type,
    prompt: type === 'single' ? '¿Qué servicio…?' : '¿Qué dos acciones…? (Elige 2)',
    options: Array.from({ length: optionCount }, (_, index) => ({
      text: `Opción ${index + 1}`,
      correct: correctIndexes.includes(index),
      explanation: `Explicación ${index + 1}`,
    })),
    source: { title: 'Amazon EC2', url: 'https://docs.aws.amazon.com/ec2/' },
    verifiedOn: '2026-09-30',
    ...overrides,
  };
}

/** Respuesta única con la opción correcta en la posición indicada. */
export function makeSingleQuestion(correctIndex: number, overrides: Partial<Question> = {}) {
  const base = makeQuestion({ type: 'single', ...overrides });
  return {
    ...base,
    options: base.options.map((option, index) => ({ ...option, correct: index === correctIndex })),
  };
}

/** Set válido de 15 preguntas (5/5/5, 2 "Elige 2" difíciles, correctas en posiciones variadas). */
export function makeQuestionSet(serviceId = 'ec2'): Question[] {
  const difficulties = ['normal', 'medium', 'hard'] as const;
  return difficulties.flatMap((difficulty) =>
    Array.from({ length: 5 }, (_, index) => {
      const id = `${serviceId}-${difficulty}-${index + 1}`;
      if (difficulty === 'hard' && index >= 3) {
        return makeQuestion({ id, serviceId, difficulty, type: 'multiple' });
      }
      return makeSingleQuestion(index % 4, { id, serviceId, difficulty });
    }),
  );
}
