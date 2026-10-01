---

description: "Task list for Preguntas de práctica por servicio"
---

# Tasks: Preguntas de práctica por servicio

**Input**: Design documents from `/specs/003-practice-questions/`

**Tests**: Obligatorios (Constitución, Principio II). Se escriben primero y deben fallar.

**Depends on**: features 001 y 002 implementadas.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational (contrato de preguntas y dominio)

### Tests (primero, deben fallar)

- [X] T001 [P] Tests del esquema en `tests/content/questions-schema.test.ts`: acepta un set válido de 15 preguntas; rechaza ids duplicados; `serviceId` inexistente; `single` sin 4 opciones o sin exactamente 1 correcta; `multiple` sin 5 opciones, sin exactamente 2 correctas o sin "(Elige 2)" en el enunciado; opción sin explicación; `source.url` que no es https o no es de un dominio oficial de AWS; `verifiedOn` no ISO; servicio con distinto de 5/5/5; menos de 2 `multiple` entre las `hard`; la correcta de las `single` en menos de 3 posiciones distintas
- [X] T002 [P] Tests de la máquina de estados en `tests/unit/quiz.test.ts`: ordena normal → medium → hard; `select` reemplaza en `single` y alterna sin superar 2 en `multiple`; `canSubmit` según el tipo; `submit` evalúa (en `multiple` solo correcta si son las 2) y devuelve los índices correctos; no se puede seleccionar ni responder dos veces; `next` avanza y termina tras la 15; `summary` cuenta total y por dificultad; `restart` vuelve al inicio

### Implementation

- [X] T003 Tipos en `src/domain/types.ts`: `Difficulty`, `QuestionType`, `QuestionOption`, `Question`, `CardView` (`'normal' | 'deep' | 'quiz'`) y `DEFAULT_CARD_VIEW`
- [X] T004 Esquema y reglas en `src/content/questionSchema.ts` (`loadQuestions(file, catalog)` → preguntas agrupadas por servicio) — hace pasar T001
- [X] T005 Máquina de estados `createQuizAttempt` en `src/domain/quiz.ts` — hace pasar T002

**Checkpoint**: `npm run test` en verde

---

## Phase 2: User Story 1 - Responder las preguntas de un servicio (Priority: P1) 🎯

### Tests ⚠️

- [X] T006 [P] [US1] E2E en `tests/e2e/quiz.spec.ts`: la pestaña "Preguntas" muestra "Pregunta 1 de 15 · Normal"; Responder deshabilitado sin elección; respuesta incorrecta → "Incorrecto", correcta resaltada, explicación de cada opción y enlace a la fuente; respuesta correcta → "Correcto"; Siguiente avanza; cambiar a Normal y volver conserva la pregunta; cerrar la ficha reinicia; recorrido solo con teclado
- [X] T007 [P] [US1] Tests de contenido en `tests/content/questions-content.test.ts`: AWS Lambda tiene 15 preguntas válidas con fuente oficial y `verifiedOn`

### Implementation

- [X] T008 [US1] Redactar las 15 preguntas de **AWS Lambda** en `src/content/questions.json`, verificando límites y precios contra la documentación oficial vigente — hace pasar T007
- [X] T009 [US1] Generalizar `src/ui/depthSelector.ts` a pestañas de la ficha ("Contenido de la ficha": Normal / Profundo / Preguntas) y actualizar `tests/e2e/helpers.ts`
- [X] T010 [US1] Vista de preguntas en `src/ui/quizView.ts`: avance, enunciado, opciones como radios (`single`), botón Responder, región `aria-live` con el resultado, explicaciones y fuente, botón Siguiente
- [X] T011 [US1] Integrar en `src/ui/serviceCard.ts` (intento por ficha, se conserva entre pestañas) y en `src/main.ts` (carga de preguntas, pestaña activa durante la visita); la pestaña Preguntas solo aparece si el servicio tiene preguntas
- [X] T012 [P] [US1] Estilos en `src/styles/room.css`: opciones, estados correcto/incorrecto, explicaciones, barra de avance — hace pasar T006

**Checkpoint (usuario)**: revisar estilo y dificultad de las 15 preguntas de Lambda antes de redactar el resto

---

## Phase 3: User Story 2 - Preguntas "Elige 2" (Priority: P1)

- [X] T013 [P] [US2] E2E en `tests/e2e/quiz.spec.ts`: en una "Elige 2" no se puede responder con 1, no se marca una tercera, y una respuesta con 1 correcta + 1 incorrecta cuenta como incorrecta mostrando las 2 correctas
- [X] T014 [US2] Opciones como casillas para `multiple` en `src/ui/quizView.ts` con indicación "Elige 2" — hace pasar T013

---

## Phase 4: User Story 3 - Resultado final (Priority: P2)

- [X] T015 [P] [US3] E2E en `tests/e2e/quiz.spec.ts`: tras la 15, "Ver resultado" muestra total sobre 15 y cada dificultad sobre 5; "Reintentar" vuelve a la 1; "Repasar el servicio" abre Profundo
- [X] T016 [US3] Resumen final en `src/ui/quizView.ts` — hace pasar T015

---

## Phase 5: Contenido del resto de la sala

- [ ] T017 Extender `tests/content/questions-content.test.ts` a los 7 servicios (SC-001)
- [ ] T018 Redactar y verificar 15 preguntas para cada uno de: Amazon EC2, Amazon ECS, Amazon EKS, AWS Fargate, Amazon EC2 Auto Scaling y Elastic Load Balancing — hace pasar T017

---

## Phase 6: Polish

- [ ] T019 Revisión editorial de las 105 preguntas — **responsable del contenido**
- [ ] T020 Sesión SC-005 con al menos 5 estudiantes — **responsable del producto**
- [ ] T021 Ejecutar `specs/003-practice-questions/quickstart.md` completo

---

## Dependencies & Execution Order

- Phase 1 bloquea todo. US1 depende de Phase 1. US2 y US3 dependen de la vista de US1.
- Phase 5 depende de la aprobación del checkpoint de US1 (estilo de las preguntas).
- Dentro de cada fase: tests primero; dominio antes que UI.
