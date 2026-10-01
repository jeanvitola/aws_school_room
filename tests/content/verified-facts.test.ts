import { describe, expect, it } from 'vitest';
import servicesFile from '../../src/content/services.json';

/**
 * Datos verificados contra la documentación oficial de AWS el 2026-09-30 (spec 003) que las fichas
 * deben reflejar. Si AWS cambia un valor, se actualiza aquí y en services.json tras re-verificarlo.
 */
const VERIFIED_FACTS: Record<string, string[]> = {
  lambda: [
    'Lambda MicroVMs', // nuevo tipo de cómputo, hasta 8 horas de vida total
    'Managed Instances', // invocaciones asíncronas de hasta 90 minutos
    '1 MB', // payload de invocación asíncrona (antes 256 KB)
    'SnapStart',
  ],
  ec2: [
    'hasta 72%', // Savings Plans en EC2
    'USD 0,005', // cargo por hora de cada IPv4 pública
  ],
  fargate: [
    '32 vCPU', // tamaño máximo de task en Linux
    '244 GB',
    '200 GiB', // almacenamiento efímero máximo
    'Fargate Spot solo', // no disponible en EKS
  ],
  eks: [
    'USD 0,60', // soporte extendido por clúster y hora
    'Pod Identity',
    'Auto Mode',
  ],
  elb: [
    'al crearlo', // security groups de un NLB solo al crearlo
    'cross-zone',
  ],
};

function deepText(serviceId: string): string {
  const service = servicesFile.services.find((candidate) => candidate.id === serviceId);
  return JSON.stringify(service?.deep ?? {});
}

describe('service cards reflect verified AWS facts', () => {
  it.each(Object.entries(VERIFIED_FACTS))('%s', (serviceId, facts) => {
    const text = deepText(serviceId).toLowerCase();
    for (const fact of facts) expect(text).toContain(fact.toLowerCase());
  });
});
