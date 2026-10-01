# Feature Specification: Niveles de profundidad en las fichas

**Feature Branch**: `002-content-depth-levels`

**Created**: 2026-09-30

**Status**: Draft

**Depends on**: [001-aws-tower-mvp](../001-aws-tower-mvp/spec.md) (fichas de servicio, comparaciones navegables, modo texto)

**Input**: User description: "Para esta primera sala me gustaría que tengamos lo mismo pero más explicado, por ejemplo: Lambda es un servicio serverless, es decir que no necesita ser aprovisionado. Un lenguaje entendible. Tengamos niveles de profundización como normal o profundo para que desglose el tema de definiciones, comparación con otros servicios, casos de uso, patrones de arquitectura."

## Clarifications

### Session 2026-09-30

- Q: ¿Cómo cambia el usuario entre niveles? → A: Un selector Normal / Profundo en la parte superior de la ficha. El nivel elegido se mantiene al cambiar de servicio.
- Q: ¿Cómo se muestran los patrones de arquitectura? → A: Texto (nombre, problema que resuelve, cuándo usarlo) más un flujo visual de servicios en orden (p. ej. S3 → Lambda → DynamoDB); los servicios del flujo que existen en la sala se pueden abrir.
- Q: ¿Se especifica como feature nueva o ampliando el MVP? → A: Feature nueva (002), construida sobre el MVP (001).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender un servicio en lenguaje simple (Priority: P1)

Una persona que empieza con AWS abre la ficha de AWS Lambda. Por defecto ve el nivel **Normal**: una explicación en lenguaje cotidiano ("Lambda es *serverless*: no tienes que crear, encender ni mantener servidores; no se aprovisionan"), una analogía, las palabras clave explicadas en una línea, lo más importante para el examen y una comparación rápida ("¿Lambda o EC2?"). Entiende qué hace el servicio sin necesitar conocimientos previos.

**Why this priority**: Es la base del aprendizaje. Si la primera lectura no se entiende, el resto del contenido no sirve; además es el nivel por defecto que verá todo usuario.

**Independent Test**: Abrir cualquier ficha de la Sala de Máquinas y verificar que el nivel Normal está seleccionado, que muestra todas sus secciones y que el contenido cumple las reglas de lenguaje simple y extensión.

**Acceptance Scenarios**:

1. **Given** el usuario abre la ficha de un servicio por primera vez, **When** se muestra la ficha, **Then** el nivel Normal está seleccionado y se ven las secciones: Qué es, Palabras clave, Lo clave para el examen, Comparación rápida y Costo en una frase.
2. **Given** la ficha está en nivel Normal, **When** el usuario lee la explicación, **Then** cada término técnico que aparece (p. ej. serverless, aprovisionar) está explicado en la misma frase o en Palabras clave.
3. **Given** la ficha está en nivel Normal, **When** el usuario la lee completa, **Then** la lectura toma 2 minutos o menos.

---

### User Story 2 - Profundizar en un servicio (Priority: P1)

Un estudiante que ya entiende lo básico cambia la ficha a **Profundo**. La ficha desglosa el tema: definición y funcionamiento, conceptos clave y límites, comparación detallada con otros servicios, casos de uso con un ejemplo concreto, patrones de arquitectura, trampas del examen y costos. Al pasar a otro servicio, la ficha se abre directamente en Profundo.

**Why this priority**: Es lo que permite pasar de "entender" a "decidir", que es lo que evalúa el examen; sin este nivel la app no alcanza para estudiar en serio.

**Independent Test**: Cambiar a Profundo en una ficha, verificar las 7 secciones, abrir otro servicio y comprobar que conserva el nivel; volver a Normal y comprobar el cambio.

**Acceptance Scenarios**:

1. **Given** una ficha abierta en Normal, **When** el usuario elige Profundo, **Then** la ficha muestra las secciones: Definición y funcionamiento, Conceptos clave y límites, Comparación detallada, Casos de uso, Patrones de arquitectura, Trampas del examen y Costos.
2. **Given** el usuario eligió Profundo, **When** abre la ficha de otro servicio (desde la sala, la lista o una comparación), **Then** la nueva ficha se abre en Profundo.
3. **Given** el usuario está en Profundo, **When** elige Normal, **Then** la ficha vuelve al nivel Normal sin cerrarse.
4. **Given** el usuario recarga la página, **When** abre una ficha, **Then** vuelve a mostrarse en Normal.

---

### User Story 3 - Ver cómo se combina un servicio en una arquitectura (Priority: P2)

En nivel Profundo, el estudiante ve uno o más **patrones de arquitectura** del servicio (p. ej. "Procesar archivos al subirlos: S3 → Lambda → DynamoDB"). Cada patrón explica qué problema resuelve, cuándo usarlo y cuándo no, y muestra el flujo de servicios en orden con el papel de cada uno. Los servicios del flujo que existen en la sala se pueden abrir directamente.

**Why this priority**: El examen pregunta por soluciones que combinan servicios. Depende del nivel Profundo (US2), por eso va después.

**Independent Test**: En Profundo, abrir la ficha de Lambda, verificar al menos un patrón con flujo ordenado y abrir desde el flujo otro servicio de la sala.

**Acceptance Scenarios**:

1. **Given** una ficha en Profundo, **When** el usuario llega a Patrones de arquitectura, **Then** ve al menos un patrón con nombre, problema que resuelve, cuándo usarlo, cuándo no usarlo y un flujo ordenado de servicios con el papel de cada uno.
2. **Given** un flujo incluye un servicio que existe en la sala, **When** el usuario lo activa (clic o teclado), **Then** se abre la ficha de ese servicio.
3. **Given** un flujo incluye un servicio que no está en la sala (p. ej. Amazon S3), **When** el usuario lo ve, **Then** aparece como texto, sin enlace.

---

### Edge Cases

- El usuario cambia de nivel con la ficha desplazada hacia abajo: la ficha vuelve al inicio del contenido para no dejarlo en medio de una sección distinta.
- El usuario cambia de nivel rápidamente varias veces: solo se muestra el contenido del último nivel elegido.
- El usuario abre el modo texto: el modo texto ofrece el mismo selector y muestra el nivel elegido para todas las fichas.
- Un patrón referencia el mismo servicio de la ficha: aparece resaltado en el flujo como "este servicio", sin enlace.
- Un servicio no tiene un servicio comparable claro: la comparación rápida igual muestra al menos una alternativa con la que se suele confundir en el examen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada ficha de servicio MUST ofrecer un selector de nivel con dos opciones, **Normal** y **Profundo**, visible en la parte superior de la ficha.
- **FR-002**: El nivel por defecto MUST ser Normal.
- **FR-003**: El nivel elegido MUST mantenerse al abrir otras fichas y al volver a la sala o al lobby durante la visita, y MUST volver a Normal al recargar la página (no se guarda entre visitas).
- **FR-004**: El nivel **Normal** MUST incluir: Qué es (lenguaje cotidiano, con una analogía), Palabras clave (1 a 4 términos técnicos con su definición en una línea), Lo clave para el examen (1 a 3 puntos), Comparación rápida (al menos un "¿X o Y?" con la regla para elegir) y Costo en una frase.
- **FR-005**: En el nivel Normal, todo término técnico usado en "Qué es" MUST estar explicado en la misma frase o aparecer en Palabras clave.
- **FR-006**: El nivel Normal de cada servicio MUST leerse en 2 minutos o menos (máximo 250 palabras).
- **FR-007**: El nivel **Profundo** MUST incluir: Definición y funcionamiento, Conceptos clave y límites, Comparación detallada (por cada servicio comparado: cuándo elegir cada uno), Casos de uso (cada uno con un ejemplo concreto), Patrones de arquitectura, Trampas del examen y Costos.
- **FR-008**: El nivel Profundo de cada servicio MUST leerse en 6 minutos o menos (máximo 900 palabras).
- **FR-009**: Cada servicio de la Sala de Máquinas MUST tener al menos un patrón de arquitectura con: nombre, problema que resuelve, cuándo usarlo, cuándo no usarlo y un flujo ordenado de 2 a 6 pasos, donde cada paso indica un servicio y su papel.
- **FR-010**: En un flujo, los servicios que existen en la misma sala MUST poder abrirse (clic, toque o teclado); los que no existen MUST mostrarse como texto; el propio servicio de la ficha MUST mostrarse resaltado sin enlace.
- **FR-011**: Las comparaciones navegables y el resaltado de trampas del examen de la feature 001 MUST seguir funcionando en el nivel Profundo; la Comparación rápida del nivel Normal MUST también permitir abrir el servicio comparado cuando exista en la sala.
- **FR-012**: El selector de nivel MUST poder usarse con teclado e indicar el nivel activo a lectores de pantalla.
- **FR-013**: El modo texto MUST ofrecer el mismo selector de nivel y mostrar el nivel elegido en todas las fichas.
- **FR-014**: Los 7 servicios de la Sala de Máquinas (EC2, Lambda, ECS, EKS, Fargate, Auto Scaling, Elastic Load Balancing) MUST tener contenido completo en ambos niveles, en español y con los nombres de servicio en inglés.
- **FR-015**: Todo el contenido nuevo MUST pasar la revisión editorial contra la guía oficial SAA-C03 antes de publicarse (FR-018 de la feature 001).
- **FR-016**: Esta feature MUST limitarse a la Sala de Máquinas; quedan fuera de alcance otras salas, preguntas de práctica, progreso guardado y avatar.

### Key Entities *(include if feature involves data)*

- **Nivel de profundidad**: Normal o Profundo; preferencia de lectura del usuario durante la visita.
- **Contenido Normal**: Explicación simple con analogía, palabras clave, puntos clave del examen, comparación rápida y costo en una frase.
- **Contenido Profundo**: Definición y funcionamiento, conceptos y límites, comparación detallada, casos de uso con ejemplo, patrones, trampas y costos.
- **Término del glosario**: Palabra técnica y su definición en una línea.
- **Patrón de arquitectura**: Nombre, problema, cuándo usarlo, cuándo no, y flujo ordenado de pasos.
- **Paso del flujo**: Servicio (de la sala o externo) y su papel en el patrón.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Al menos el 80% de personas sin experiencia en AWS pueden explicar con sus palabras qué hace un servicio después de leer su ficha en nivel Normal (validado en una sesión moderada con al menos 5 personas).
- **SC-002**: El nivel Normal de cada servicio se lee en 2 minutos o menos y el nivel Profundo en 6 minutos o menos.
- **SC-003**: Cambiar de nivel requiere una sola acción y el nuevo contenido aparece de inmediato (menos de 1 segundo).
- **SC-004**: El 100% de los servicios de la Sala de Máquinas tiene contenido en ambos niveles y al menos un patrón de arquitectura.
- **SC-005**: El selector de nivel y los enlaces de los flujos se pueden usar completamente con teclado.

## Assumptions

- El contenido actual de las fichas (feature 001) se reorganiza dentro del nivel Profundo y se amplía; el nivel Normal se redacta nuevo.
- Las analogías usan situaciones cotidianas neutras para cualquier país de habla hispana.
- El nivel elegido no se guarda entre visitas, en línea con la decisión de diferir el progreso guardado.
- Los servicios externos a la sala que aparecen en patrones (S3, DynamoDB, API Gateway, SQS, etc.) se muestran por nombre; tendrán ficha cuando se construyan sus salas.
- El borrador del contenido lo redacta el equipo de desarrollo y la revisión editorial la hace el responsable del contenido.
