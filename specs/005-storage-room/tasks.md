---
description: 'Task list for Bodega (sala de almacenamiento)'
---

# Tasks: Bodega (sala de almacenamiento)

**Input**: Design documents from `/specs/005-storage-room/`

**Tests**: Obligatorios (Constitución, Principio II). Se escriben primero y deben fallar.

**Depends on**: features 001–004 implementadas.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational (sin cambio visible)

### Tests (primero, deben fallar)

- [x] T001 [P] Generalizar `tests/unit/compute-layout.test.ts` a `tests/unit/room-layouts.test.ts`: para cada sala de `ROOM_LAYOUTS`, ubica exactamente los servicios de esa sala, usa sprites existentes, queda dentro de la grilla y lejos de las paredes, respeta la cantidad de filas declarada, distancia mínima 3 entre estaciones y 2 entre decoración y estación
- [x] T002 [P] Tests de preguntas por sala en `tests/content/questions-schema.test.ts`: `loadRoomQuestions(file, catalog, roomId)` rechaza una pregunta de un servicio de otra sala; `tests/content/questions-content.test.ts` valida el archivo de cada sala disponible
- [x] T003 [P] E2E en `tests/e2e/performance.spec.ts`: el lobby no descarga preguntas; al entrar a la Sala de Máquinas se descargan las suyas

### Implementation

- [x] T004 Registro `ROOM_LAYOUTS` en `src/scene/layouts/index.ts` (`{ stations, decor, rows }`); `src/main.ts` lo usa en lugar de `roomId === 'compute'` — hace pasar T001
- [x] T005 Mover `src/content/questions.json` a `src/content/questions/compute.json`; `loadRoomQuestions` en `src/content/questionSchema.ts` — hace pasar T002
- [x] T006 `src/main.ts`: importar de forma diferida las preguntas de la sala al entrar y dibujar la sala cuando estén validadas; error de contenido si no lo están — hace pasar T003

**Checkpoint**: `npm test` y `npm run test:e2e` en verde sin cambios visibles (FR-013)

---

## Phase 2: User Story 1 - Muestra S3 y la sala (Priority: P1) 🎯

### Tests ⚠️

- [x] T007 [P] [US1] Tests de contenido en `tests/content/storage-services.test.ts`: los 9 ids en orden y sus nombres en inglés; cada uno con al menos un patrón; comparación rápida a un servicio del catálogo; comparaciones obligatorias en ambos sentidos (ver data-model) — se marcan `todo` los servicios aún no redactados
- [x] T008 [P] [US1] E2E en `tests/e2e/storage.spec.ts`: la Bodega aparece disponible y se entra con clic y teclado; la lista muestra las 9 estaciones en orden; abrir S3 con Normal y Profundo; modo texto muestra la Bodega; volver y entrar a la Sala de Máquinas muestra sus 7 estaciones

### Implementation

- [x] T009 [US1] Verificar contra la documentación oficial los datos de S3 (clases, duraciones mínimas, límites, consistencia, cifrado por defecto, Requester Pays) y anotarlos en `research.md`
- [x] T010 [US1] Redactar la ficha Normal y Profunda de **Amazon S3** en `src/content/services.json` y sus 15 preguntas en `src/content/questions/storage.json`
- [x] T011 [US1] Distribución `src/scene/layouts/storage.ts` (3 filas: S3 y Glacier; EBS, EFS y FSx; Storage Gateway, Backup, DataSync y Transfer Family) y registro en `ROOM_LAYOUTS`
- [x] T012 [US1] `src/content/rooms.json`: Bodega disponible, versión `0.3.0`

**Checkpoint (usuario)**: revisar la ficha y las 15 preguntas de S3 antes de redactar el resto

- [x] T013 [US1] Verificar en paralelo los datos de los otros 8 servicios (ver research, Decision 6) y anotarlos en `research.md`
- [x] T014 [US1] Redactar las fichas de Glacier, EBS, EFS, FSx, Storage Gateway, Backup, DataSync y Transfer Family, cumpliendo FR-006, FR-007 y FR-008 — hace pasar T007
- [x] T015 [P] [US1] Ampliar `tests/content/verified-facts.test.ts` con los datos cambiantes de almacenamiento y las fechas de Snow Family y de las bóvedas de Glacier

**Checkpoint**: las 9 fichas completas; T007 y T008 en verde

---

## Phase 3: User Story 2 - Decidir entre servicios (Priority: P1)

- [x] T016 [P] [US2] E2E en `tests/e2e/storage.spec.ts`: desde EFS en Profundo se abre FSx desde su comparación; un servicio de otra sala (p. ej. EC2) aparece como texto sin enlace
- [x] T017 [US2] Ajustar comparaciones y patrones si T016 detecta huecos — hace pasar T016

---

## Phase 4: User Story 3 - Preguntas de almacenamiento (Priority: P2)

- [x] T018 [P] [US3] Tests de contenido: los 9 servicios tienen 15 preguntas válidas; cada conocimiento de FR-005 aparece en al menos una pregunta (lista de palabras clave por tema)
- [x] T019 [US3] Redactar las 120 preguntas restantes en `src/content/questions/storage.json`, verificadas contra fuentes oficiales — hace pasar T018
- [x] T020 [P] [US3] E2E en `tests/e2e/storage.spec.ts`: Preguntas en una ficha de la Bodega muestra "Pregunta 1 de 15 · Normal" y llega al resumen

---

## Phase 5: User Story 4 - La sala se ve como una bodega (Priority: P3)

- [ ] T021 [US4] Declarar `shelf` (48×96) y `crates` (64×48) en `src/scene/sprite-sizes.json` y generar provisionales con `npm run art:placeholders` — `tests/content/sprites.test.ts` en verde
- [ ] T022 [US4] Decoración de la Bodega en `src/scene/layouts/storage.ts` con estanterías y cajas — T001 en verde
- [ ] T023 [US4] Lista de piezas de arte para Jean (íconos de los 9 servicios, estantería, cajas) en `art/README` o en el mensaje de entrega

---

## Phase 6: Polish

- [ ] T024 [P] Accesibilidad (axe) y movimiento reducido en la Bodega en `tests/e2e/a11y.spec.ts` y `tests/e2e/reduced-motion.spec.ts`
- [x] T025 [P] README: Bodega disponible, preguntas por sala en "Cómo agregar una sala nueva"
- [ ] T026 Ejecutar `quickstart.md` completo
- [x] T027 Unir a `main` y verificar el sitio publicado
- [ ] T028 Revisión editorial del contenido (usuario)
- [ ] T029 Sesión con al menos 5 estudiantes (SC-005) (usuario)

## Dependencies

- Phase 1 bloquea todo lo demás.
- T009–T012 → punto de control del usuario → T013–T015.
- US2 y US3 dependen de las fichas de US1; US4 solo de T011.
