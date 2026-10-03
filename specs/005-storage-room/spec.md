# Feature Specification: Bodega (sala de almacenamiento)

**Feature Branch**: `005-storage-room`

**Created**: 2026-10-02

**Status**: Draft

**Depends on**: [001](../001-aws-tower-mvp/spec.md) (salas y estaciones), [002](../002-content-depth-levels/spec.md) (fichas Normal/Profundo), [003](../003-practice-questions/spec.md) (preguntas), [004](../004-art-pipeline/spec.md) (arte)

**Input**: User description: "Terminamos la Sala de Máquinas, vamos con la Bodega. Que sea acotada al journey de explicación del examen. Verifica e investiga qué debería ir."

## Clarifications

### Session 2026-10-02

- Q: ¿Qué servicios entran en la Bodega? → A: 9 estaciones, a partir de la guía oficial del examen SAA-C03 (verificada el 2026-10-02): los 7 servicios de la categoría _Storage_ (Amazon S3, Amazon S3 Glacier, Amazon EBS, Amazon EFS, Amazon FSx, AWS Storage Gateway, AWS Backup) más AWS DataSync y AWS Transfer Family, que la guía cita como ejemplos de almacenamiento híbrido y transferencia de datos (tareas 2.1, 3.5 y 4.1).
- Q: ¿Snow Family tiene estación? → A: No. Sigue en la lista del examen, pero desde el 7 de noviembre de 2025 AWS no la ofrece a clientes nuevos. Se explica como comparación dentro de DataSync ("¿en línea o físico?"), con esa advertencia.
- Q: ¿Cómo se enseña Glacier? → A: Como las clases de almacenamiento S3 Glacier (Instant Retrieval, Flexible Retrieval y Deep Archive). El servicio original de bóvedas no acepta clientes nuevos desde el 15 de diciembre de 2025; se menciona solo como nota.
- Q: ¿Cuál es el hilo de la sala? → A: Responder la pregunta central del dominio: ¿objeto, bloque o archivo? ¿caliente o frío? ¿en la nube o híbrido? ¿mover o proteger?

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Recorrer la Bodega y estudiar sus servicios (Priority: P1)

Un estudiante entra al lobby y ve la Bodega disponible. Entra y recorre una sala con 9 estaciones ordenadas en tres filas: objetos y archivo (S3, S3 Glacier), bloque y archivos (EBS, EFS, FSx) e híbrido, protección y migración (Storage Gateway, AWS Backup, DataSync, Transfer Family). Al elegir una estación, la cámara viaja hasta ella y se abre su ficha con los niveles Normal y Profundo, igual que en la Sala de Máquinas.

**Why this priority**: Es lo que agrega la feature: el dominio de almacenamiento completo, explicado en los dos niveles.

**Independent Test**: Entrar a la Bodega desde el lobby, abrir cada una de las 9 fichas y leer sus niveles Normal y Profundo, con mouse, con teclado y en modo texto.

**Acceptance Scenarios**:

1. **Given** el lobby, **When** el usuario mira la puerta de la Bodega, **Then** aparece disponible (sin la etiqueta "Próximamente") y puede entrar.
2. **Given** la Bodega, **When** el usuario elige una estación en la sala o en la lista, **Then** la cámara viaja a ella y se abre la ficha del servicio.
3. **Given** una ficha de la Bodega, **When** el usuario cambia entre Normal y Profundo, **Then** ve las mismas secciones que en las fichas de la Sala de Máquinas.
4. **Given** el modo texto en la Bodega, **When** el usuario lo activa, **Then** ve las 9 fichas de la Bodega sin la escena.

---

### User Story 2 - Decidir entre servicios de almacenamiento (Priority: P1)

En el nivel Profundo, cada ficha compara el servicio con sus vecinos de la sala (por ejemplo, EFS frente a FSx for Windows File Server, o DataSync frente a Storage Gateway) y muestra patrones de arquitectura con su flujo de servicios. Desde la comparación, el estudiante puede abrir la ficha del otro servicio de la Bodega.

**Why this priority**: El examen pregunta sobre todo cuál servicio elegir; las comparaciones son el núcleo del aprendizaje de la sala.

**Independent Test**: Desde la ficha de EFS, abrir FSx desde su comparación y volver.

**Acceptance Scenarios**:

1. **Given** la ficha Profunda de un servicio de la Bodega, **When** el usuario elige un servicio comparado que está en la Bodega, **Then** se abre su ficha.
2. **Given** una comparación o un paso de patrón con un servicio de otra sala (p. ej. EC2), **When** el usuario lo ve, **Then** aparece como texto, sin enlace (como hoy con servicios fuera del catálogo).

---

### User Story 3 - Practicar con preguntas de almacenamiento (Priority: P2)

Cada servicio de la Bodega tiene su pestaña Preguntas con 15 preguntas tipo examen (5 normales, 5 medias, 5 difíciles), igual que la Sala de Máquinas.

**Why this priority**: Consolida lo aprendido; depende de que las fichas existan (US1).

**Independent Test**: Abrir Preguntas en una ficha de la Bodega y completar las 15.

**Acceptance Scenarios**:

1. **Given** una ficha de la Bodega, **When** el usuario elige Preguntas, **Then** ve "Pregunta 1 de 15 · Normal" y el flujo de 003 funciona igual.

---

### User Story 4 - La sala se ve como una bodega (Priority: P3)

La Bodega tiene su propia distribución (9 estaciones en 3 filas) y decoración distinta de la Sala de Máquinas, para que el estudiante sienta que cambió de lugar.

**Why this priority**: Mejora la experiencia, pero el contenido se puede estudiar sin ella.

**Independent Test**: Entrar a la Bodega y comprobar que ninguna estación se superpone y que la decoración difiere de la Sala de Máquinas.

**Acceptance Scenarios**:

1. **Given** la Bodega, **When** se dibuja la sala, **Then** las 9 estaciones caben sin superponerse y cada una tiene su ícono.
2. **Given** que aún no existe el arte final de un ícono, **When** se dibuja la sala, **Then** se usa un dibujo provisional del mismo tamaño.

---

### Edge Cases

- El usuario abre una ficha de la Bodega mientras se cargan los dibujos de la sala: la ficha no se cierra (mismo caso que se corrigió en la Sala de Máquinas).
- El usuario vuelve al lobby y entra a la Sala de Máquinas: se dibuja la distribución y decoración de esa sala, no la de la Bodega.
- Un patrón de arquitectura incluye servicios de otra sala (p. ej. Lambda procesando objetos de S3): se muestran como texto.
- Un dato verificado cambia en AWS (precio, límite o disponibilidad): el test de datos verificados falla y obliga a re-verificar.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: La Bodega MUST pasar a estado disponible en el lobby.
- **FR-002**: La Bodega MUST tener exactamente 9 estaciones: Amazon S3, Amazon S3 Glacier, Amazon EBS, Amazon EFS, Amazon FSx, AWS Storage Gateway, AWS Backup, AWS DataSync y AWS Transfer Family.
- **FR-003**: Cada servicio MUST tener ficha Normal y Profunda que cumpla el contrato de contenido de 002 (secciones y límites de palabras).
- **FR-004**: Cada servicio MUST tener 15 preguntas que cumplan el contrato de 003 (5/5/5, tipos, fuente oficial y fecha de verificación).
- **FR-005**: El contenido MUST cubrir los conocimientos de almacenamiento de la guía del examen SAA-C03: tipos de almacenamiento (objeto, bloque, archivo), clases y ciclo de vida de S3, Requester Pays, volúmenes SSD frente a HDD, almacenamiento híbrido, estrategias de respaldo y recuperación ante desastres (RPO/RTO), cifrado en reposo y en tránsito, replicación y durabilidad, y la forma más barata de transferir datos.
- **FR-006**: La ficha de S3 Glacier MUST enseñar las tres clases S3 Glacier y aclarar que el servicio original de bóvedas no acepta clientes nuevos desde el 15 de diciembre de 2025.
- **FR-007**: La ficha de DataSync MUST comparar la transferencia en línea con la física e indicar que Snow Family ya no se ofrece a clientes nuevos desde el 7 de noviembre de 2025.
- **FR-008**: La ficha de EBS MUST incluir Instance Store como comparación (almacenamiento efímero).
- **FR-009**: Los datos que cambian (precios, límites, tiempos de recuperación, disponibilidad) MUST verificarse contra la documentación oficial de AWS vigente y quedar protegidos por el test de datos verificados.
- **FR-010**: Antes de redactar en lote, MUST aprobarse una muestra: la ficha Normal y Profunda de S3 y sus 15 preguntas.
- **FR-011**: La Bodega MUST tener su propia distribución de 9 estaciones en 3 filas, sin superposiciones, y su propia decoración.
- **FR-012**: La navegación, la lista de servicios, el modo texto, el teclado y la accesibilidad de la Bodega MUST funcionar igual que en la Sala de Máquinas.
- **FR-013**: Agregar la Bodega MUST NOT cambiar el comportamiento de la Sala de Máquinas.
- **FR-014**: Fuera de alcance: guardar progreso, estaciones para Snow Family u otros servicios de migración (Application Migration Service, DMS), y enlaces entre fichas de salas distintas.

### Key Entities _(include if feature involves data)_

- **Sala**: La Bodega pasa de "Próximamente" a disponible.
- **Servicio**: 9 nuevos, con fichas en los dos niveles y la Bodega como sala.
- **Pregunta**: 135 nuevas (15 por servicio).
- **Distribución de sala**: Posición de cada estación y decoración propia de la Bodega.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los 9 servicios tiene ficha Normal, ficha Profunda y 15 preguntas válidas según los contratos.
- **SC-002**: Cada conocimiento de almacenamiento listado en FR-005 aparece en al menos una ficha y en al menos una pregunta.
- **SC-003**: Todas las pruebas existentes de la Sala de Máquinas siguen pasando.
- **SC-004**: Un estudiante puede ir del lobby a cualquier ficha de la Bodega en 3 interacciones o menos.
- **SC-005**: En una sesión con al menos 5 estudiantes, el 80% sabe elegir entre S3, EBS, EFS y FSx para un escenario tras recorrer la sala.

## Assumptions

- **Arte**: mientras Jean no entregue arte propio de la Bodega, la sala reutiliza el piso y las paredes de la Sala de Máquinas, con decoración y dibujos provisionales para los íconos nuevos; el arte final entra con el pipeline de 004 sin cambiar la distribución.
- El contenido se escribe en español con los nombres de servicio en inglés, con el mismo tono aprobado en la Sala de Máquinas.
- Los temas de bases de datos (RDS, DynamoDB), redes (CloudFront, VPC endpoints) y seguridad (KMS) se mencionan solo cuando el servicio de almacenamiento los necesita para explicarse; su detalle va en sus propias salas.
- La guía del examen es no exhaustiva y puede cambiar; se toma la versión vigente al 2026-10-02.
