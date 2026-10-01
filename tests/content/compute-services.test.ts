import { describe, expect, it } from 'vitest';
import { loadCatalog } from '../../src/content/schema';
import roomsFile from '../../src/content/rooms.json';
import servicesFile from '../../src/content/services.json';

const COMPUTE_SERVICE_IDS = ['ec2', 'lambda', 'ecs', 'eks', 'fargate', 'autoscaling', 'elb'];

describe('compute room content', () => {
  const catalog = loadCatalog(roomsFile, servicesFile);
  const computeServices = catalog.services.filter((service) => service.roomId === 'compute');

  it('contains exactly the seven compute services of the MVP', () => {
    expect(computeServices.map((service) => service.id)).toEqual(COMPUTE_SERVICE_IDS);
  });

  it('keeps AWS service names in English', () => {
    expect(computeServices.map((service) => service.name)).toEqual([
      'Amazon EC2',
      'AWS Lambda',
      'Amazon ECS',
      'Amazon EKS',
      'AWS Fargate',
      'Amazon EC2 Auto Scaling',
      'Elastic Load Balancing',
    ]);
  });

  it.each([
    ['ec2', 'lambda'],
    ['ecs', 'eks'],
    ['ecs', 'fargate'],
    ['eks', 'fargate'],
    ['autoscaling', 'elb'],
  ])('compares %s and %s in both directions', (first, second) => {
    const targetsOf = (id: string) =>
      computeServices.find((service) => service.id === id)?.compareWith.map((c) => c.target);

    expect(targetsOf(first)).toContain(second);
    expect(targetsOf(second)).toContain(first);
  });
});
