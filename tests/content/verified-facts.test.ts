import { describe, expect, it } from 'vitest';
import servicesFile from '../../src/content/services.json';

/**
 * Datos verificados contra la documentación oficial de AWS (Sala de Máquinas el 2026-09-30, spec 003;
 * Bodega el 2026-10-02, spec 005) que las fichas
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
  s3: [
    '50 TB', // tamaño máximo de objeto (antes 5 TB)
    '5 GB', // máximo de un solo PUT
    'enero de 2023', // cifrado SSE-S3 por defecto
    '3.500', // escrituras por segundo por prefijo
    'en 15 minutos', // SLA de S3 Replication Time Control
    'USD 0,023', // S3 Standard, primeros 50 TB en us-east-1
  ],
  glacier: [
    '15 de diciembre de 2025', // bóvedas de Amazon Glacier sin clientes nuevos
    '3–5 horas', // restauración Standard de Flexible Retrieval
    '48 horas', // restauración Bulk de Deep Archive
    'USD 0,00099',
  ],
  ebs: [
    '80.000 IOPS', // máximo de gp3
    '256.000 IOPS', // máximo de io2 Block Express
    '16 instancias', // Multi-Attach
  ],
  efs: [
    'Elastic', // modo de rendimiento recomendado
    'generación anterior', // Max I/O
    'no se puede usar con instancias Windows',
  ],
  fsx: ['ya no se ofrece a clientes nuevos', 'Scratch'],
  'storage-gateway': ['ya no se ofrece a clientes nuevos'], // FSx File Gateway
  backup: ['72 horas', 'logically air-gapped'],
  datasync: [
    '7 de noviembre de 2025', // Snow Family sin clientes nuevos
    'Data Transfer Terminal',
    'USD 0,0125',
  ],
  'transfer-family': ['endpoint de VPC interno', 'USD 0,30'],
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
