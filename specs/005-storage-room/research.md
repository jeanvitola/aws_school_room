# Research: Bodega (sala de almacenamiento)

## Decision 1: Servicios de la sala

- **Decision**: 9 estaciones: `s3`, `glacier`, `ebs`, `efs`, `fsx`, `storage-gateway`, `backup`, `datasync`, `transfer-family`.
- **Rationale**: La guía oficial SAA-C03 (consultada el 2026-10-02) lista en _Storage_ exactamente AWS Backup, Amazon EBS, Amazon EFS, Amazon FSx (todos los tipos), Amazon S3, Amazon S3 Glacier y AWS Storage Gateway. Además cita AWS DataSync (tareas 3.5 y 4.1) y AWS Transfer Family (tareas 2.1 y 4.1) como ejemplos de almacenamiento híbrido y transferencia de datos. La tarea 4.1 (almacenamiento con costo optimizado) es la más detallada del dominio: clases y ciclo de vida, SSD frente a HDD, Requester Pays, respaldo frente a archivo y la transferencia más barata.
- **Alternatives considered**: Estación para Snow Family (descartada: sin clientes nuevos desde el 2025-11-07; va como comparación en DataSync). Glacier dentro de S3 (descartada: el examen lo lista aparte y sus trampas —tiempos de recuperación, duración mínima— merecen ficha propia). Application Migration Service y DMS (descartados: son migración de servidores y bases de datos, no almacenamiento).
- **Fuentes**: [Servicios en alcance](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/saa-03-in-scope-services.html), [Dominio 4](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain4.html), [Snowball Edge](https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html), [Clases S3 Glacier](https://aws.amazon.com/s3/storage-classes/glacier/).

## Decision 2: Ids y sprites

- **Decision**: Los ids siguen el patrón de la Sala de Máquinas (minúsculas, sin prefijo de proveedor). Cada estación usa `service-<id>`.
- **Rationale**: Jean ya dibujó los 9 íconos (`art/public/assets/sprites/CAPA 6. íconos de servicios 2.png`) y están declarados en `art/manifest.json` y `sprite-sizes.json`; entran por el pipeline de 004 sin cambios de código.

## Decision 3: Distribución por sala

- **Decision**: Un registro `ROOM_LAYOUTS` en `src/scene/layouts/index.ts` con `{ stations, decor, rows }` por sala; `main.ts` deja de preguntar `roomId === 'compute'`. El test de layout de la Sala de Máquinas se generaliza para recorrer todas las salas del registro.
- **Rationale**: Hoy el decorado está atado a `compute` en `main.ts`; con dos salas la condición se vuelve un error esperando a ocurrir. Un registro de datos mantiene la escena genérica (Principio IV).
- **Distribución propuesta (grilla 12×10, distancia mínima 3)**: cuadrícula alineada de 3×3 (columnas 3, 6 y 9; filas 2, 5 y 8) en el orden del recorrido: S3, Glacier, EBS / EFS, FSx, Storage Gateway / Backup, DataSync, Transfer Family. Jean pidió alinearlas (2026-10-03).

## Decision 4: Preguntas por sala, cargadas al entrar

- **Decision**: `src/content/questions.json` se divide en `src/content/questions/<roomId>.json`. Cada archivo se importa de forma diferida al entrar a su sala y se valida en ese momento; los tests de contenido validan todos los archivos en CI.
- **Rationale**: El lobby descarga hoy ≈ 243 KB de JavaScript, de los que ≈ 140 KB son las 105 preguntas de la Sala de Máquinas. Las 135 de la Bodega sumarían ≈ 180 KB y el lobby pasaría a ≈ 420 KB, sobre el presupuesto de 300 KB de 001. Con la carga por sala, el lobby queda en ≈ 160 KB aunque se agreguen más salas.
- **Alternatives considered**: Subir el presupuesto (descartada: crece con cada sala). Cargar también las fichas por sala (descartada por ahora: las fichas pesan ≈ 6 KB por servicio, el modo texto las necesita todas y las comparaciones cruzan salas).
- **Riesgo**: una ficha abierta antes de que lleguen las preguntas no mostraría la pestaña Preguntas. Mitigación: la sala se dibuja después de cargar sus preguntas (son unos pocos KB, ya comprimidos).

## Decision 5: Arte de la Bodega

- **Decision**: Reutilizar piso, paredes y escritorio de estación. Dos sprites nuevos de decoración, `shelf` (estantería, 48×96) y `crates` (cajas apiladas, 64×48), con dibujos provisionales generados por `npm run art:placeholders`. Cuando Jean entregue su arte, entra por `art/manifest.json` y `npm run art` (spec 004).
- **Rationale**: Diferencia visualmente la sala sin bloquear el contenido en el arte.

## Decision 6: Verificación del contenido

- **Decision**: Igual que 002/003: agentes que consultan la documentación oficial vigente antes de redactar; los datos que cambian quedan en `tests/content/verified-facts.test.ts`.
- **Datos a verificar**: clases de S3 (duraciones mínimas, tiempos de recuperación de Glacier, durabilidad y disponibilidad), límites de S3 (tamaño de objeto y de carga en una sola operación), consistencia de S3, tipos de volumen EBS y sus máximos (gp3, io2 Block Express, st1, sc1), Multi-Attach, clases y modos de rendimiento de EFS, tipos de FSx, tipos de Storage Gateway vigentes, capacidades de AWS Backup (Vault Lock, entre cuentas y Regiones), protocolos de Transfer Family y fechas de disponibilidad de Snow Family y de las bóvedas de Glacier.

## Decision 7: Enlaces entre salas

- **Decision**: Sin cambios. `resolveTarget` ya marca como no abribles los servicios de otra sala (se muestran como texto).
- **Rationale**: Navegar entre salas desde una ficha está fuera de alcance (FR-014).

## Datos verificados: Amazon S3 (2026-10-02)

- Objeto máximo **50 TB** con carga multiparte; un solo PUT hasta **5 GB** ([Uploading objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html)).
- Clases, durabilidad (11 nueves), disponibilidad, mínimos de 30/90/180 días y 128 KB ([Storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)).
- Recuperación Glacier: Flexible 1–5 min / 3–5 h / 5–12 h; Deep Archive 12 h / 48 h ([Retrieval options](https://docs.aws.amazon.com/AmazonS3/latest/userguide/restoring-objects-retrieval-options.html)).
- SSE-S3 por defecto desde el 5 de enero de 2023; Block Public Access y ACL deshabilitadas por defecto ([Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html), [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html)).
- Consistencia fuerte de lectura después de escritura ([What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)).
- 3.500 escrituras / 5.500 lecturas por segundo por prefijo ([Performance](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)).
- Replicación: versionado en ambos buckets, solo objetos nuevos, Batch Replication para existentes, RTC 99,99% en 15 min ([Replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html), [Requirements](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication-requirements.html)).
- Object Lock Governance/Compliance, legal hold ([Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)); Requester Pays ([Requester Pays](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html)); URL prefirmadas hasta 7 días ([Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)); Transfer Acceleration ([Transfer Acceleration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html)).
- Precios us-east-1: Standard USD 0,023/GB (primeros 50 TB), Standard-IA USD 0,0125, Deep Archive USD 0,00099; entrada desde internet y salida a CloudFront sin costo ([S3 pricing](https://aws.amazon.com/s3/pricing/)).
