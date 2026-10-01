# Feature Specification: Preguntas de práctica por servicio

**Feature Branch**: `003-practice-questions`

**Created**: 2026-09-30

**Status**: Draft

**Depends on**: [002-content-depth-levels](../002-content-depth-levels/spec.md) (selector de nivel en la ficha)

**Input**: User description: "Ya tenemos normal y profundo. Tengamos otro menú de preguntas: que sean máximo 15 preguntas con selección múltiple. Trata de que las preguntas sean lo más vigentes a la documentación actual: 5 normales, 5 medias, 5 difíciles."

## Clarifications

### Session 2026-09-30

- Q: ¿Las preguntas son por sala o por servicio? → A: Por servicio: una tercera opción "Preguntas" en el selector de cada ficha, junto a Normal y Profundo.
- Q: ¿Qué tipo de selección múltiple? → A: Como el examen real: la mayoría con 4 opciones y 1 correcta; algunas "Elige 2" con 5 opciones y 2 correctas.
- Q: ¿Cuándo se muestra si acertó? → A: Inmediatamente al responder cada pregunta, con la explicación de cada opción.
- Q: ¿Cómo se recorren las dificultades? → A: Siempre las 15 en orden: 5 normales, 5 medias y 5 difíciles.
- Q: ¿Cómo se asegura que estén vigentes? → A: Cada pregunta cita la página oficial de AWS en que se basa y la fecha en que se verificó contra la documentación.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Responder las preguntas de un servicio (Priority: P1)

Un estudiante termina de leer la ficha de AWS Lambda y elige "Preguntas". Ve "Pregunta 1 de 15 · Normal", un enunciado tipo examen y 4 opciones. Elige una y pulsa "Responder": la app le dice si acertó, marca la opción correcta y explica por qué cada opción es correcta o incorrecta. Pulsa "Siguiente" y continúa hasta la 15.

**Why this priority**: Es el núcleo de la feature: practicar decisiones como en el examen, con retroalimentación inmediata.

**Independent Test**: Abrir "Preguntas" en una ficha, responder una pregunta correcta y una incorrecta y verificar el resultado y las explicaciones.

**Acceptance Scenarios**:

1. **Given** una ficha abierta, **When** el usuario elige "Preguntas", **Then** ve la pregunta 1 de 15 con su dificultad, el enunciado y sus opciones.
2. **Given** una pregunta de respuesta única, **When** el usuario no ha elegido ninguna opción, **Then** no puede responder.
3. **Given** el usuario elige una opción y responde, **When** se muestra el resultado, **Then** ve si acertó, la opción correcta resaltada, la explicación de cada opción y la fuente oficial.
4. **Given** una pregunta respondida, **When** pulsa "Siguiente", **Then** pasa a la siguiente pregunta en orden.

---

### User Story 2 - Preguntas "Elige 2" como en el examen (Priority: P1)

Algunas preguntas, sobre todo las difíciles, piden elegir 2 de 5 opciones. El enunciado lo indica ("Elige 2"), la interfaz permite marcar dos opciones y solo se acepta la respuesta como correcta si ambas son correctas.

**Why this priority**: Es un formato frecuente del examen SAA-C03 y exige un razonamiento distinto.

**Independent Test**: En una pregunta "Elige 2", verificar que no se puede responder con 1 opción, que no se pueden marcar 3 y que la evaluación exige las 2 correctas.

**Acceptance Scenarios**:

1. **Given** una pregunta "Elige 2", **When** el usuario marca 1 opción, **Then** no puede responder todavía.
2. **Given** dos opciones marcadas, **When** intenta marcar una tercera, **Then** la tercera no se marca.
3. **Given** el usuario responde con una opción correcta y una incorrecta, **When** se evalúa, **Then** la respuesta cuenta como incorrecta y se muestran las 2 correctas.

---

### User Story 3 - Ver el resultado final (Priority: P2)

Al terminar la pregunta 15, el estudiante ve su puntaje total y por dificultad (p. ej. Normal 5/5, Media 3/5, Difícil 2/5), un mensaje según el resultado y la opción de reintentar o volver a la ficha en nivel Profundo para repasar.

**Why this priority**: Le dice al estudiante dónde está débil; depende de poder responder (US1).

**Independent Test**: Responder las 15 preguntas y verificar el resumen, reintentar y el regreso a Profundo.

**Acceptance Scenarios**:

1. **Given** el usuario respondió la pregunta 15, **When** pulsa "Ver resultado", **Then** ve el total sobre 15 y el puntaje de cada dificultad sobre 5.
2. **Given** el resumen, **When** pulsa "Reintentar", **Then** vuelve a la pregunta 1 sin respuestas.
3. **Given** el resumen, **When** pulsa "Repasar el servicio", **Then** la ficha cambia al nivel Profundo.

---

### Edge Cases

- El usuario cambia a Normal o Profundo a mitad de las preguntas y vuelve a "Preguntas": continúa donde quedó mientras la ficha siga abierta.
- El usuario cierra la ficha o abre otro servicio: las preguntas del servicio anterior se reinician; el nuevo servicio abre en "Preguntas" si esa era la pestaña activa.
- El usuario recarga la página: no se guarda ningún avance (coherente con 001 y 002).
- Una pregunta ya respondida no se puede volver a responder; solo avanzar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El selector de cada ficha MUST tener una tercera opción, **Preguntas**, además de Normal y Profundo.
- **FR-002**: Cada servicio de la Sala de Máquinas MUST tener exactamente 15 preguntas: 5 de dificultad Normal, 5 Media y 5 Difícil.
- **FR-003**: Las preguntas MUST presentarse en orden: primero las Normales, luego las Medias y al final las Difíciles.
- **FR-004**: Cada pregunta MUST ser de uno de dos tipos: **respuesta única** (4 opciones, 1 correcta) o **Elige 2** (5 opciones, exactamente 2 correctas, indicado en el enunciado).
- **FR-005**: El usuario MUST poder responder solo cuando eligió la cantidad de opciones que pide la pregunta (1 o 2) y no MUST poder marcar más de esa cantidad.
- **FR-006**: Al responder, la app MUST indicar si acertó, resaltar las opciones correctas, marcar las elegidas incorrectas y mostrar la explicación de **cada** opción.
- **FR-007**: Una respuesta "Elige 2" MUST contar como correcta solo si las 2 opciones elegidas son las 2 correctas.
- **FR-008**: La app MUST mostrar el avance como "Pregunta N de 15 · Dificultad".
- **FR-009**: Al terminar, la app MUST mostrar el puntaje total (sobre 15) y por dificultad (sobre 5), con las acciones "Reintentar" y "Repasar el servicio" (abre el nivel Profundo).
- **FR-010**: Cada pregunta MUST citar una fuente oficial de AWS (título y enlace a la documentación o a la guía del examen) y la fecha en que su contenido se verificó contra esa fuente.
- **FR-011**: Las preguntas MUST basarse en la documentación vigente de AWS a la fecha de verificación y en el temario de la guía del examen SAA-C03; las preguntas sobre límites, precios o descuentos MUST verificarse contra la documentación oficial.
- **FR-012**: En cada servicio, la opción correcta de las preguntas de respuesta única MUST variar de posición (no siempre la misma letra).
- **FR-013**: El avance de las preguntas MUST mantenerse al cambiar de pestaña dentro de la misma ficha abierta y MUST reiniciarse al cerrar la ficha, cambiar de servicio o recargar la página.
- **FR-014**: Las preguntas MUST poder responderse solo con teclado; las opciones MUST anunciarse a lectores de pantalla como grupo de opción única o de casillas según el tipo, y el resultado MUST anunciarse al responder.
- **FR-015**: Fuera de alcance: guardar puntajes entre visitas, temporizador, preguntas aleatorias y preguntas de otras salas.

### Key Entities *(include if feature involves data)*

- **Pregunta**: Servicio al que pertenece, dificultad, tipo (única o Elige 2), enunciado, opciones, fuente oficial y fecha de verificación.
- **Opción**: Texto, si es correcta y la explicación de por qué lo es o no.
- **Intento**: Avance del usuario en las 15 preguntas de un servicio: respuestas dadas y aciertos por dificultad. Solo existe mientras la ficha está abierta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los servicios de la Sala de Máquinas tiene 15 preguntas (5/5/5), cada una con fuente oficial, fecha de verificación y explicación para todas sus opciones.
- **SC-002**: Un estudiante completa las 15 preguntas de un servicio en 20 minutos o menos.
- **SC-003**: Al menos 2 preguntas Difíciles de cada servicio son de tipo "Elige 2".
- **SC-004**: El flujo completo (elegir, responder, siguiente, resultado) se puede hacer solo con teclado.
- **SC-005**: En una sesión con al menos 5 estudiantes, el 80% considera que las explicaciones le ayudaron a entender por qué se equivocó.

## Assumptions

- Las preguntas se escriben en español con los nombres de servicio en inglés, en el estilo de escenario del examen ("Una empresa necesita…").
- Normal: reconocer qué hace un servicio o un límite clave. Media: elegir el servicio o la configuración adecuada para un escenario. Difícil: escenarios con varias restricciones (costo, operación, disponibilidad) donde más de una opción parece válida.
- El modo texto mantiene solo Normal y Profundo; las preguntas son accesibles desde la ficha, que ya se puede usar con teclado y lector de pantalla.
- La revisión editorial de 002 (FR-015) aplica también a las preguntas.
