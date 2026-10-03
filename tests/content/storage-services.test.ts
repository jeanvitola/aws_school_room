import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/content/schema';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';

/** Las 9 estaciones de la Bodega, en el orden del recorrido (spec 005, FR-002). */
const STORAGE_SERVICES: [id: string, name: string][] = [
  ['s3', 'Amazon S3'],
  ['glacier', 'Amazon S3 Glacier'],
  ['ebs', 'Amazon EBS'],
  ['efs', 'Amazon EFS'],
  ['fsx', 'Amazon FSx'],
  ['storage-gateway', 'AWS Storage Gateway'],
  ['backup', 'AWS Backup'],
  ['datasync', 'AWS DataSync'],
  ['transfer-family', 'AWS Transfer Family'],
];

/** Fichas que aún no se redactan (T014). Debe quedar vacía antes de cerrar la feature. */
const PENDING = new Set([
  'glacier',
  'ebs',
  'efs',
  'fsx',
  'storage-gateway',
  'backup',
  'datasync',
  'transfer-family',
]);

/** Comparaciones obligatorias en ambos sentidos (data-model.md). */
const REQUIRED_COMPARISONS: [string, string][] = [
  ['s3', 'glacier'],
  ['s3', 'ebs'],
  ['ebs', 'efs'],
  ['efs', 'fsx'],
  ['s3', 'storage-gateway'],
  ['storage-gateway', 'datasync'],
  ['datasync', 'transfer-family'],
  ['backup', 'ebs'],
];

describe('storage room content (spec 005)', () => {
  const catalog = loadCatalog(roomsFile, servicesFile);
  const storageServices = catalog.services.filter((service) => service.roomId === 'storage');
  const written = STORAGE_SERVICES.filter(([id]) => !PENDING.has(id));
  const serviceOf = (id: string) => storageServices.find((service) => service.id === id);
  const allIds = new Set(STORAGE_SERVICES.map(([id]) => id));

  it('the storage room is available', () => {
    expect(catalog.rooms.find((room) => room.id === 'storage')?.status).toBe('available');
  });

  it('contains the written storage services in the order of the tour, with English names', () => {
    expect(storageServices.map((service) => [service.id, service.name])).toEqual(written);
  });

  it.each(written.map(([id]) => id))('%s has at least one architecture pattern', (id) => {
    expect(serviceOf(id)?.deep.patterns.length).toBeGreaterThanOrEqual(1);
  });

  it.each(written.map(([id]) => id))('%s quick comparison points to a storage station', (id) => {
    expect(allIds.has(serviceOf(id)?.normal.quickComparison.target ?? '')).toBe(true);
  });

  it.each(REQUIRED_COMPARISONS)('compares %s and %s in both directions', (first, second) => {
    const targetsOf = (id: string) => serviceOf(id)?.deep.compareWith.map((c) => c.target);
    if (!PENDING.has(first)) expect(targetsOf(first)).toContain(second);
    if (!PENDING.has(second)) expect(targetsOf(second)).toContain(first);
  });
});
