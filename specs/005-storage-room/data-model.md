# Data Model: Bodega (sala de almacenamiento)

Los contratos de contenido no cambian: las fichas siguen el [contrato v2](../002-content-depth-levels/contracts/service-content-contract-v2.md) y las preguntas el [contrato de preguntas](../003-practice-questions/contracts/questions-contract.md).

## Cambios de datos

| Archivo                      | Cambio                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/rooms.json`     | `storage.status` → `available`; `version` → `0.3.0`                                                                                   |
| `src/content/services.json`  | +9 servicios con `roomId: "storage"`                                                                                                  |
| `src/content/questions.json` | Se divide en `src/content/questions/compute.json` (105 preguntas actuales, sin cambios) y `src/content/questions/storage.json` (+135) |

## Servicios nuevos

| id                | name                | sprite                    |
| ----------------- | ------------------- | ------------------------- |
| `s3`              | Amazon S3           | `service-s3`              |
| `glacier`         | Amazon S3 Glacier   | `service-glacier`         |
| `ebs`             | Amazon EBS          | `service-ebs`             |
| `efs`             | Amazon EFS          | `service-efs`             |
| `fsx`             | Amazon FSx          | `service-fsx`             |
| `storage-gateway` | AWS Storage Gateway | `service-storage-gateway` |
| `backup`          | AWS Backup          | `service-backup`          |
| `datasync`        | AWS DataSync        | `service-datasync`        |
| `transfer-family` | AWS Transfer Family | `service-transfer-family` |

## Comparaciones obligatorias (en ambos sentidos)

`s3`↔`glacier`, `s3`↔`ebs`, `ebs`↔`efs`, `efs`↔`fsx`, `s3`↔`storage-gateway`, `storage-gateway`↔`datasync`, `datasync`↔`transfer-family`, `backup`↔`ebs`.

## Distribución de sala

```ts
interface RoomLayout {
  stations: Record<string, ServicePlacement>; // serviceId → { col, row, sprite }
  decor: DecorPlacement[];
  /** Filas de estaciones esperadas (orden del recorrido). */
  rows: number;
}
// src/scene/layouts/index.ts
export const ROOM_LAYOUTS: Record<string, RoomLayout>;
```

## Reglas nuevas de validación

- Un archivo de preguntas de sala solo puede contener preguntas de servicios de esa sala.
- Cada servicio de una sala disponible tiene su archivo de preguntas con 15 por servicio (test de contenido).
