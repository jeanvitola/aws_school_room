# Feature Specification: Torre AWS

**Feature Branch**: `001-aws-tower-mvp`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Quiero una aplicación web educativa con estética pixel art (vista isométrica estilo juego retro/RPG) que enseñe el contenido de la certificación AWS Certified Solutions Architect – Associate (SAA-C03) de forma clara, sencilla y entretenida.

Concepto: el usuario explora un edificio (\"La Torre AWS\") formado por habitaciones. Cada habitación representa una familia de servicios de AWS (Compute, Storage, Databases, Networking, Security, etc.). Dentro de cada habitación hay objetos y personajes interactivos; cada uno representa un servicio de AWS.

Alcance de esta primera entrega (MVP):
- Un lobby desde donde el usuario puede ver y entrar a las habitaciones disponibles; las que todavía no tienen contenido se muestran como \"próximamente\".
- Una habitación completa: \"Sala de Máquinas\" (Compute) con EC2, Lambda, ECS, EKS, Fargate, Auto Scaling y Elastic Load Balancing.
- Al interactuar con un servicio, el usuario ve una ficha con: qué es (en 1-2 frases), para qué casos se usa, conceptos clave que pregunta el examen, comparación con servicios similares (por ejemplo, \"¿EC2 o Lambda?\"), errores típicos/trampas del examen y un dato de costos.
- El usuario puede moverse por la habitación y volver al lobby en cualquier momento.
- El sitio debe sentirse dinámico: animaciones de personajes y objetos, respuesta visual al pasar el cursor o al seleccionar algo.
- El contenido está en español; los nombres de los servicios se mantienen en inglés.

Usuarios: personas que se preparan para el examen SAA-C03, desde principiantes en AWS hasta quienes solo necesitan repasar.

Objetivo: que el usuario entienda cada servicio en menos de 2 minutos de lectura y sepa distinguir cuándo usar uno u otro, que es lo que más evalúa el examen.

Fuera de alcance por ahora: cuentas de usuario, quizzes o simulacros de examen, el resto de las habitaciones y el modo multijugador."

## Clarifications

### Session 2026-09-30

- Q: Which navigation pattern should the room use for the MVP so the interaction is clear and testable? → A: Click-to-travel between service hotspots and a direct return-to-lobby action.
- Q: What primary platform should the MVP target for the first release? → A: Desktop-first with responsive support for smaller screens.
- Q: Should the app include a text-only or keyboard-accessible alternative for users who cannot use the visual room interaction? → A: Text-based fallback with room and service summaries, plus keyboard navigation for the visual experience.
- Q: Should the MVP remember which AWS services a learner has opened or explored between visits? → A: Session-only progress; remembers viewed services during the current visit. **Update 2026-09-30**: progress tracking is deferred out of the MVP and will be specified in a later feature.
- Q: ¿Cómo debe validarse y actualizarse la precisión del contenido de AWS en el MVP? → A: Revisión editorial centralizada y actualización manual por el equipo, basada en la guía SAA-C03 y en validación de contenido antes de publicación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el lobby y elegir una habitación (Priority: P1)
Un estudiante que prepara la certificación AWS SAA-C03 entra a la aplicación y ve un lobby visual con habitaciones disponibles y otras marcadas como "próximamente". Puede identificar la Sala de Máquinas y acceder a ella sin confusión. La experiencia transmite de inmediato que la plataforma está organizada por familias de servicios y que cada habitación representa una temática concreta.

**Why this priority**: Este flujo es la puerta de entrada al producto y define si el usuario puede comenzar a aprender de forma orientada y sin frustración.

**Independent Test**: Se puede probar completando la ruta de entrada al lobby y validando que la sala disponible se abre y las habitaciones no disponibles se muestran como bloqueadas o futuras.

**Acceptance Scenarios**:

1. **Given** el usuario accede al lobby de la aplicación, **When** observa la vista principal, **Then** ve la lista de habitaciones disponibles y aquellas que aún no tienen contenido marcadas como “próximamente”.
2. **Given** una habitación está disponible, **When** el usuario selecciona su entrada, **Then** la aplicación abre la sala correspondiente en la vista del edificio.
3. **Given** una habitación aún no está disponible, **When** el usuario intenta acceder a ella, **Then** la interfaz lo informa claramente sin permitir una experiencia incompleta.

---

### User Story 2 - Entender una habitación de servicios con navegación y contenido (Priority: P1)
Un usuario entra a la Sala de Máquinas y se desplaza visualmente por la habitación para explorar servicios como EC2, Lambda, ECS, EKS, Fargate, Auto Scaling y Elastic Load Balancing. Cada servicio puede abrirse en una ficha de estudio con información resumida, útil para repasar antes del examen.

**Why this priority**: La sala completa es el núcleo del MVP, porque allí se entrega la mayor parte del valor educativo y la distinción entre servicios es la base de la preparación para el examen.

**Independent Test**: La historia puede validarse entrando a la sala, seleccionando varios servicios y verificando que cada ficha presenta el contenido requerido y se puede volver al lobby sin perder la navegación.

**Acceptance Scenarios**:

1. **Given** el usuario está en la Sala de Máquinas, **When** explora la habitación, **Then** puede identificar cada servicio y su representación visual dentro del entorno mediante puntos de interacción clicables.
2. **Given** el usuario selecciona un servicio, **When** abre su ficha, **Then** la aplicación muestra una descripción breve, casos de uso, conceptos clave del examen, comparación con servicios similares, trampas frecuentes y un dato de costos.
3. **Given** el usuario desea regresar, **When** usa la navegación disponible, **Then** vuelve al lobby con una acción explícita y sin perder la estructura general del recorrido.

---

### User Story 3 - Repasar la diferencia entre servicios antes del examen (Priority: P2)
Un estudiante que ya conoce conceptos básicos quiere reforzar rápidamente la diferencia entre EC2, Lambda y otros servicios de compute para decidir cuándo usar cada uno. La plataforma le permite comparar servicios y memorizar patrones de examen sin leer largas referencias técnicas.

**Why this priority**: El objetivo del producto es ayudar a distinguir cuándo usar cada servicio y preparar al usuario para las preguntas del examen, no solo mostrar definiciones sueltas.

**Independent Test**: Se puede probar abriendo varias fichas de servicios y confirmando que cada una incluye su comparación directa con alternativas relevantes y la trampa común del examen.

**Acceptance Scenarios**:

1. **Given** el usuario revisa dos servicios similares, **When** lee sus fichas, **Then** identifica claramente los casos de uso clave y los motivos para elegir uno u otro.
2. **Given** un servicio incluye una trampa típica del examen, **When** el usuario la consulta, **Then** puede reconocer la diferencia conceptual y evitar errores comunes.
3. **Given** el usuario necesita volver al inicio, **When** finaliza la lectura, **Then** puede salir de la habitación y regresar al lobby con una navegación simple y evidente.

---

### Edge Cases

- ¿Qué sucede si el usuario intenta entrar a una habitación futura sin contenido? La interfaz debe mostrar un estado “próximamente” y bloquear la navegación hacia ese espacio.
- ¿Cómo responde la aplicación si el usuario selecciona varios servicios en rápida sucesión? La vista debe actualizar la ficha del servicio activo sin romper la navegación del entorno.
- ¿Qué ocurre si el usuario quiere volver al lobby desde cualquier punto de la habitación? La navegación debe estar disponible de forma constante y visible.
- ¿Qué pasa cuando un servicio no tiene una comparación clara con otro servicio? La ficha debe seguir entregando una explicación útil basada en casos de uso y diferencias conceptuales.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST present a lobby that shows available rooms and clearly marks rooms without content as “próximamente”.
- **FR-002**: The application MUST include a first interactive room named “Sala de Máquinas” covering compute services for the SAA-C03 curriculum.
- **FR-003**: The application MUST show service elements in the compute room for EC2, Lambda, ECS, EKS, Fargate, Auto Scaling, and Elastic Load Balancing.
- **FR-004**: Users MUST be able to interact with each service element to open a study card with a focused explanation.
- **FR-005**: Each service card MUST describe the service in 1-2 sentences, explain its primary use cases, and summarize key exam concepts.
- **FR-006**: Each service card MUST include a comparison with similar alternatives, such as EC2 versus Lambda, to help users decide when to use one service over another.
- **FR-007**: Each service card MUST include typical exam traps or common mistakes that students should avoid.
- **FR-008**: Each service card MUST include a cost-related detail or practical pricing signal that supports the decision-making process.
- **FR-009**: The user MUST navigate the room by selecting service hotspots or room elements, and MUST be able to return to the lobby at any time without losing orientation.
- **FR-010**: The interface MUST include visual feedback for hover, selection, and navigation states to create a dynamic and responsive experience.
- **FR-011**: The educational content MUST be written in Spanish, while the AWS service names remain in English.
- **FR-012**: The room and service content MUST be designed for learners preparing for the AWS Certified Solutions Architect – Associate exam, from beginners to quick revision users.
- **FR-013**: The application MUST clearly distinguish between available content and not-yet-built content so the MVP remains easy to understand and within scope. Each room has exactly one status:

  | Status | Lobby display | Selecting it |
  |--------|---------------|--------------|
  | `available` | Normal, interactive | Opens the room |
  | `upcoming` | Visible, dimmed, labeled "Próximamente" | Shows an informational notice; does not navigate |
- **FR-014**: The product MUST exclude user accounts, progress tracking, quizzes, additional rooms, and multiplayer features from the MVP scope.
- **FR-015**: The MVP MUST prioritize a desktop-first experience while supporting responsive layouts for smaller screens and preserving the core learning flow.
- **FR-016**: The application MUST provide a text-based fallback and keyboard navigation so users can access the room structure, service list, and core learning content without relying solely on pointer interaction.
- **FR-017**: *(Deferred — out of MVP scope, see FR-014 and Clarifications.)* Progress tracking of opened services will be specified in a later feature.
- **FR-018**: The educational content MUST be reviewed and validated against the official SAA-C03 study guidance before release, and any updates to AWS service explanations or exam distinctions MUST be versioned and reviewed by the content owner.

### Key Entities *(include if feature involves data)*

- **Lobby**: The main entry view of the tower; it groups available rooms and marks future rooms as “próximamente”.
- **Room**: A learning area inside the tower representing a family of AWS services, starting with the compute room.
- **Service**: An AWS capability represented visually in a room; each service has a study card and exam-oriented guidance.
- **Service Card**: A compact learning object summarizing what a service is, how it is used, what matters for the exam, and when it is better than a similar service.
- **User**: The learner preparing for the AWS SAA-C03 certification who explores the tower and consumes study content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can open the lobby and enter the compute room within 60 seconds without guidance.
- **SC-002**: A user can understand the purpose of a service and decide whether it is a fit for a scenario in under 2 minutes of reading.
- **SC-003**: At least 80% of users can correctly identify the main distinction between two related compute services after reviewing their cards in a short session. Validated before public release through a moderated usability session with at least 5 learners preparing for SAA-C03.
- **SC-004**: The product delivers a dynamic, interactive experience with visible hover and selection feedback on all primary interactive elements.
- **SC-005**: The content supports learners at different levels by combining beginner-friendly explanations with exam-oriented distinctions and common traps.
- **SC-006**: The MVP remains clearly scoped to a single available room, available lobby flow, and curated compute content without introducing out-of-scope features.

## Assumptions

- The MVP is designed as a single-page educational experience with a guided exploration flow rather than a multi-room full game structure.
- The platform is intended for learners studying for the SAA-C03 exam and not for production operational use or enterprise training management.
- Content quality is prioritized over exhaustive AWS coverage; the first room focuses on the compute family to deliver immediate value.
- The project does not require user accounts, saved progress, or social features in this phase.
- The environment will support a visually rich, interactive presentation while keeping the learning experience readable and understandable for beginners.
- Additional rooms and assessment features are intentionally deferred until a later release, while the compute room provides the minimum viable pedagogical value.
