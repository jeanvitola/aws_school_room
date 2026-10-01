---

description: "Task list for Niveles de profundidad en las fichas"
---

# Tasks: Niveles de profundidad en las fichas

**Input**: Design documents from `/specs/002-content-depth-levels/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/service-content-contract-v2.md, quickstart.md

**Tests**: Obligatorios (Constitución, Principio II). Se escriben primero y deben fallar.

**Depends on**: feature 001 implementada (fichas, comparaciones navegables, modo texto).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational (Contrato v2 y contenido)

**Purpose**: Migrar el contenido al contrato v2 manteniendo la app funcionando. Bloquea todas las user stories.

### Tests (primero, deben fallar)

- [ ] T001 [P] Actualizar `tests/fixtures.ts` a Service v2 (`makeService` con bloques `normal` y `deep`, `makePattern`)
- [ ] T002 [P] Tests del esquema v2 en `tests/content/schema.test.ts`: acepta v2 válido; rechaza `normal` o `deep` ausentes; `glossary` fuera de 1–4; `examKeyPoints` fuera de 1–3; `quickComparison` sin `target` o `rule`; listas vacías en `keyConcepts`, `compareWith`, `useCases`, `patterns`, `examTraps`; caso de uso sin `example`; patrón con < 2 o > 6 pasos; patrón sin un paso con el `id` del propio servicio; `normal` > 250 palabras; `deep` > 900 palabras; y conserva las reglas de 001 (ids duplicados, `roomId` inexistente, sala `upcoming`, `version`/`lastReviewed`)
- [ ] T003 [P] Tests de `resolveTarget(catalog, target, fromServiceId)` en `tests/unit/catalog.test.ts`: servicio de la misma sala → `isOpenable: true`; el propio servicio → `isCurrent: true`, no abrible; nombre externo → `service: undefined`, `label` = texto; servicio de otra sala → no abrible. `resolveComparisons` lee `deep.compareWith`
- [ ] T004 [P] Tests de contenido en `tests/content/compute-services.test.ts`: los 7 servicios tienen ambos niveles; cada uno tiene ≥ 1 patrón; las comparaciones recíprocas de 001 se mantienen en `deep.compareWith`; `normal.quickComparison.target` existe en el catálogo

### Implementation

- [ ] T005 Tipos v2 en `src/domain/types.ts`: `NormalContent`, `GlossaryTerm`, `DeepContent`, `UseCase`, `ArchitecturePattern`, `PatternStep`, `DepthLevel` (`'normal' | 'deep'`) y `DEFAULT_DEPTH_LEVEL = 'normal'`
- [ ] T006 Esquema v2 y reglas de contenido en `src/content/schema.ts` — hace pasar T002
- [ ] T007 `resolveTarget` y `resolveComparisons` sobre `deep.compareWith` en `src/domain/catalog.ts` — hace pasar T003
- [ ] T008 Redactar el nivel **Normal** de los 7 servicios en `src/content/services.json` con el tono aprobado (ejemplo de Lambda en la conversación del 2026-09-30): lenguaje cotidiano, una analogía, 1–4 palabras clave, 1–3 puntos clave, comparación rápida y costo en una frase; ≤ 250 palabras
- [ ] T009 Redactar el nivel **Profundo** de los 7 servicios en `src/content/services.json`: migrar el contenido de 001 y ampliarlo (definición y funcionamiento, conceptos y límites, comparación detallada, casos de uso con ejemplo, ≥ 1 patrón con flujo, trampas, costos); ≤ 900 palabras — junto con T008 hace pasar T004
- [ ] T010 Adaptar `src/ui/serviceCard.ts` y `src/ui/textFallback.ts` al contrato v2 renderizando provisionalmente el nivel Profundo con las secciones de 001, para que la app y los E2E de 001 sigan pasando

**Checkpoint**: `npm run test` y `npm run test:e2e` en verde con el contenido v2

---

## Phase 2: User Story 1 - Entender un servicio en lenguaje simple (Priority: P1) 🎯 MVP

**Goal**: Las fichas abren en nivel Normal con lenguaje simple y un selector visible.

**Independent Test**: Abrir cualquier ficha → selector con Normal activo y las 5 secciones del nivel Normal.

### Tests ⚠️

- [ ] T011 [P] [US1] E2E en `tests/e2e/depth.spec.ts`: la ficha abre con "Normal" en `aria-pressed="true"`; muestra las secciones "Qué es", "Palabras clave", "Lo clave para el examen", "Comparación rápida" y "Costo en una frase"; la analogía y los términos del glosario de Lambda son visibles; la comparación rápida de Lambda abre la ficha de EC2

### Implementation

- [ ] T012 [P] [US1] Selector `renderDepthSelector(level, onChange)` en `src/ui/depthSelector.ts`: `role="group"` con nombre "Nivel de profundidad", dos `<button>` con `aria-pressed`
- [ ] T013 [US1] Render del nivel Normal en `src/ui/serviceCard.ts` (`renderNormalSections`): analogía destacada, glosario como `<dl>`, comparación rápida "¿X o Y?" con enlace vía `resolveTarget`
- [ ] T014 [US1] Estado del nivel en `src/main.ts`: `DEFAULT_DEPTH_LEVEL` al cargar, se pasa a cada ficha; cambiar de nivel re-renderiza el cuerpo, sube el scroll y mantiene el foco en el selector
- [ ] T015 [P] [US1] Estilos del selector, la analogía y el glosario en `src/styles/room.css`
- [ ] T016 [US1] Actualizar `tests/e2e/helpers.ts`, `room.spec.ts` y `keyboard.spec.ts` a las secciones del nivel Normal — hace pasar T011

**Checkpoint**: US1 funciona; las fichas se entienden sin conocimientos previos

---

## Phase 3: User Story 2 - Profundizar en un servicio (Priority: P1)

**Goal**: El nivel Profundo desglosa el tema; la elección se mantiene durante la visita.

**Independent Test**: Elegir Profundo → 7 secciones; abrir otro servicio → sigue en Profundo; recargar → vuelve a Normal.

### Tests ⚠️

- [ ] T017 [P] [US2] E2E en `tests/e2e/depth.spec.ts`: Profundo muestra "Definición y funcionamiento", "Conceptos clave y límites", "Comparación detallada", "Casos de uso", "Patrones de arquitectura", "Trampas del examen" y "Costos"; abrir otro servicio (lista, sala y comparación) conserva Profundo; volver a Normal sin cerrar la ficha; recargar vuelve a Normal; el cambio de nivel deja el scroll arriba; cambio con teclado (Tab + Enter)
- [ ] T018 [P] [US2] Ajustar `tests/e2e/compare.spec.ts` para cambiar a Profundo antes de verificar comparaciones detalladas y trampas

### Implementation

- [ ] T019 [US2] Render del nivel Profundo en `src/ui/serviceCard.ts` (`renderDeepSections`): definición, conceptos, comparación detallada (enlaces vía `resolveTarget`), casos de uso con ejemplo, trampas destacadas y costos; reemplaza el render provisional de T010
- [ ] T020 [US2] Selector y render por nivel en el modo texto (`src/ui/textFallback.ts`, `src/main.ts`) compartiendo el mismo estado de nivel; agregar el caso a `tests/e2e/room.spec.ts`

**Checkpoint**: US1 y US2 funcionan; ambos niveles completos salvo patrones

---

## Phase 4: User Story 3 - Patrones de arquitectura (Priority: P2)

**Goal**: Cada servicio muestra patrones con flujo de servicios navegable.

**Independent Test**: En Profundo, ficha de Lambda → patrón S3 → Lambda → DynamoDB; Lambda resaltado; un servicio de la sala en otro patrón abre su ficha.

### Tests ⚠️

- [ ] T021 [P] [US3] E2E en `tests/e2e/patterns.spec.ts`: el patrón muestra nombre, "Problema", "Cuándo usarlo", "Cuándo no usarlo" y un flujo `<ol>` en orden; el propio servicio aparece marcado como actual y sin botón; un servicio externo (Amazon S3) es texto; un servicio de la sala (p. ej. Elastic Load Balancing en el patrón de EC2) abre su ficha con clic y teclado

### Implementation

- [ ] T022 [US3] Render de patrones en `src/ui/serviceCard.ts` (`renderPatterns`): encabezado por patrón, problema, cuándo sí/no, flujo como `<ol class="flow">` con chips vía `resolveTarget` — hace pasar T021
- [ ] T023 [P] [US3] Estilos de los flujos en `src/styles/room.css`: chips pixel, flechas entre pasos con CSS, variante vertical en móvil, chip del servicio actual resaltado

**Checkpoint**: Las 3 user stories funcionan de forma independiente

---

## Phase 5: Polish

- [ ] T024 Revisión editorial de los 14 bloques de contenido contra la guía SAA-C03 (FR-015) — **responsable del contenido**
- [ ] T025 Sesión de validación SC-001 con al menos 5 personas sin experiencia en AWS — **responsable del producto**
- [ ] T026 Ejecutar `specs/002-content-depth-levels/quickstart.md` completo y corregir lo que falle

---

## Dependencies & Execution Order

- Phase 1 bloquea todo (cambia el contrato del contenido).
- US1 depende de Phase 1. US2 depende de Phase 1 y reutiliza el selector de US1. US3 depende del nivel Profundo (US2).
- Dentro de cada fase: tests primero; dominio antes que UI.

### Parallel Opportunities

- Phase 1: T001–T004 en paralelo.
- US1: T011, T012 y T015 en paralelo.
- US2: T017 y T018 en paralelo.
- US3: T021 y T023 en paralelo.

## Implementation Strategy

1. Phase 1 → contenido v2 con la app intacta.
2. US1 → publicable: fichas entendibles para principiantes.
3. US2 → estudio profundo.
4. US3 → patrones de arquitectura.
5. Polish → revisión editorial y validación con usuarios.
