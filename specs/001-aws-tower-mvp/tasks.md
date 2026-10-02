---

description: "Task list for Torre AWS MVP"
---

# Tasks: Torre AWS MVP

**Input**: Design documents from `/specs/001-aws-tower-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/service-content-contract.md, quickstart.md

**Tests**: Incluidos y obligatorios (Constitución, Principio II). En cada fase, los tests se escriben PRIMERO y deben FALLAR antes de implementar.

**Organization**: Tareas agrupadas por user story para implementarlas y probarlas de forma independiente.

**Fuera de alcance**: seguimiento de progreso, cuentas, quizzes, otras habitaciones con contenido, multijugador (FR-014).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: User story a la que pertenece (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el proyecto estático Vite + TypeScript con las herramientas de test

- [X] T001 Inicializar el proyecto Vite + TypeScript (plantilla `vanilla-ts`) en la raíz del repo, con `package.json` y scripts `dev`, `build`, `preview`, `test` (Vitest), `test:e2e` (Playwright) y `lint`
- [X] T002 Instalar dependencias: `phaser`, `zod`; dev: `vitest`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `prettier`, `typescript-eslint` (actualiza `package.json`)
- [X] T003 [P] Configurar TypeScript en modo `strict` (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"resolveJsonModule": true`) en `tsconfig.json`
- [X] T004 [P] Configurar Vitest para `tests/unit/**` y `tests/content/**` en `vitest.config.ts`
- [X] T005 [P] Configurar Playwright para `tests/e2e/**` con `webServer` apuntando a `npm run preview` y proyectos `desktop` (1280×720) y `mobile` (375×812, touch) en `playwright.config.ts`
- [X] T006 [P] Configurar ESLint + Prettier en `eslint.config.js` y `.prettierrc`
- [X] T007 Crear la estructura de carpetas del plan: `src/domain/`, `src/content/`, `src/scene/layouts/`, `src/ui/`, `src/styles/`, `public/assets/sprites/`, `tests/unit/`, `tests/content/`, `tests/e2e/`
- [X] T008 Crear `index.html` con un contenedor `#game` (canvas de Phaser) y un contenedor `#ui` (overlay DOM), `lang="es"`, y `src/styles/main.css` base con fuente pixel (p. ej. "Press Start 2P" vía Google Fonts), `image-rendering: pixelated` y paleta de colores en variables CSS
- [X] T009 [P] Agregar sprites pixel art placeholder (tileset isométrico de piso/paredes y 7 objetos de servicio) en `public/assets/sprites/`, usando assets con licencia libre (p. ej. CC0) y registrando autor/licencia en `public/assets/CREDITS.md` — *Implementado con sprites propios generados por `scripts/generate-placeholder-sprites.mjs` (ver research.md, Decision 8)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contenido validado, dominio puro y arranque de la app; todas las user stories dependen de esto

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase

### Tests (escribir primero, deben fallar)

- [X] T010 [P] Test de esquema del contenido en `tests/content/schema.test.ts`: acepta un catálogo válido y rechaza: room sin `id`/`name`/`slug`/`description`/`status`/`order`; `status` distinto de `available` | `upcoming`; IDs de room o service duplicados; service con `roomId` inexistente; service que referencia una room `upcoming`; listas vacías en `useCases`, `examConcepts`, `compareWith`, `examTraps`; `costNote` vacío; `compareWith` sin `target` o `difference` no vacíos; `summary` > 50 palabras; ficha completa (todos los campos de texto) > 350 palabras; falta `version` o `lastReviewed` (fecha ISO)
- [X] T011 [P] Test del catálogo en `tests/unit/catalog.test.ts`: `listRooms()` devuelve salas ordenadas por `order`; `getRoom(id)` devuelve la sala o `undefined`; `isRoomAvailable(id)`; `getServicesByRoom(roomId)` deriva los servicios desde `Service.roomId`; `getService(id)`
- [X] T012 [P] Test de navegación en `tests/unit/navigation.test.ts`: estado inicial `lobby`; `enterRoom(id)` pasa a `room` solo si la sala está `available` y devuelve un resultado de rechazo para `upcoming`/inexistente; `selectService(id)` pasa a `card` solo para servicios de la sala actual; seleccionar otro servicio estando en `card` reemplaza el servicio activo; `closeCard()` vuelve a `room`; `goToLobby()` funciona desde `room` y `card`; los listeners suscritos reciben cada cambio de estado

### Implementation

- [X] T013 Implementar el esquema Zod y `loadCatalog(rooms, services)` que valida y devuelve un `ContentCatalog` tipado (lanza error descriptivo si es inválido) en `src/content/schema.ts` — hace pasar T010
- [X] T014 [P] Crear `src/content/rooms.json` según el contrato: `compute` ("Sala de Máquinas", `available`, order 1) y salas `upcoming`: `storage` ("Bodega"), `databases` ("Biblioteca"), `networking` ("Sala de Correo"), `security` ("Bóveda"), `integration` ("Oficina de Mensajería"), `monitoring` ("Sala de Control"), `costs` ("Tesorería"); con `version` y `lastReviewed`
- [X] T015 Implementar consultas del catálogo en `src/domain/catalog.ts` (sin imports de Phaser ni DOM) — hace pasar T011
- [X] T016 Implementar la máquina de estados de navegación (`lobby` → `room` → `card`) con suscripción a cambios en `src/domain/navigation.ts` (sin imports de Phaser ni DOM) — hace pasar T012
- [X] T017 Configurar Phaser (`pixelArt: true`, `Scale.FIT`, `autoCenter`, parent `#game`) y precarga de sprites en `src/scene/game.ts`
- [X] T018 Implementar el arranque en `src/main.ts`: carga `rooms.json` y `services.json` con `loadCatalog`, crea la navegación, inicia Phaser y monta el overlay `#ui`; muestra un mensaje de error legible si el contenido es inválido
- [X] T019 Crear `src/content/services.json` inicial con `{ "services": [] }` para que la app arranque antes de US2

**Checkpoint**: `npm run test` pasa; `npm run dev` arranca sin errores con el contenido validado

---

## Phase 3: User Story 1 - Explorar el lobby y elegir una habitación (Priority: P1) 🎯 MVP

**Goal**: El usuario ve el lobby con la Sala de Máquinas disponible y las demás salas "Próximamente", y puede entrar a la sala disponible.

**Independent Test**: Abrir la app → se ven 8 salas, 7 marcadas "Próximamente"; seleccionar una "Próximamente" muestra un aviso y no navega; seleccionar "Sala de Máquinas" abre la vista de la sala.

### Tests for User Story 1 ⚠️

- [X] T020 [P] [US1] Test E2E en `tests/e2e/lobby.spec.ts`: el lobby lista todas las salas de `rooms.json` en orden; las `upcoming` muestran la etiqueta "Próximamente" y tienen `aria-disabled="true"`; activarlas muestra un aviso visible y la URL/vista sigue en el lobby; activar "Sala de Máquinas" con clic y con teclado (Tab + Enter) muestra la vista de la sala
- [X] T021 [P] [US1] Test E2E en el proyecto `mobile` (mismo archivo `tests/e2e/lobby.spec.ts`): el lobby es usable sin scroll horizontal a 375px y la sala se abre con tap

### Implementation for User Story 1

- [X] T022 [US1] Implementar `renderLobby(catalog, navigation)` en `src/ui/lobby.ts`: una "puerta" por sala como `<button>`; las `available` llaman a `navigation.enterRoom`; las `upcoming` usan `aria-disabled="true"`, etiqueta "Próximamente" y muestran un aviso (región `aria-live="polite"`) sin navegar
- [X] T023 [P] [US1] Estilos pixel art del lobby en `src/styles/lobby.css`: grilla responsive (desktop-first), puertas con animación de hover/focus (FR-010), estado atenuado para "Próximamente", foco visible
- [X] T024 [US1] Implementar `RoomScene` mínima en `src/scene/RoomScene.ts`: dibuja el piso y las paredes isométricas de la sala a partir del tileset; se inicia/detiene según el estado `room` de la navegación
- [X] T025 [US1] Conectar en `src/main.ts` el cambio de estado: `lobby` muestra `#ui` con el lobby y oculta la escena; `room` oculta el lobby e inicia `RoomScene` — hace pasar T020 y T021

**Checkpoint**: US1 funcional y probada de forma independiente (lobby → entrar a la sala)

---

## Phase 4: User Story 2 - Entender una habitación de servicios con navegación y contenido (Priority: P1)

**Goal**: En la Sala de Máquinas, el usuario identifica los 7 servicios, abre la ficha de cada uno y vuelve al lobby en cualquier momento.

**Independent Test**: Entrar a la sala → 7 servicios visibles e interactivos; abrir cualquier ficha muestra las 6 secciones; seleccionar otro servicio reemplaza la ficha; Escape cierra la ficha; "Volver al lobby" siempre visible y funcional.

### Tests for User Story 2 ⚠️

- [X] T026 [P] [US2] Test de contenido en `tests/content/compute-services.test.ts`: `services.json` contiene exactamente `ec2`, `lambda`, `ecs`, `eks`, `fargate`, `autoscaling`, `elb`, todos con `roomId: "compute"` y pasan `loadCatalog`
- [X] T027 [P] [US2] Test de layout en `tests/unit/compute-layout.test.ts`: `src/scene/layouts/compute.ts` define posición y sprite para cada servicio de la sala `compute`, sin IDs sobrantes ni posiciones duplicadas
- [X] T028 [P] [US2] Test E2E en `tests/e2e/room.spec.ts`: en la sala se listan los 7 servicios; al seleccionar uno (clic en la lista accesible y clic en el hotspot del canvas) se abre un `role="dialog"` con las secciones "Qué es", "Casos de uso", "Conceptos clave del examen", "Comparación", "Trampas del examen" y "Costos"; seleccionar otro servicio rápidamente deja solo la ficha del último; Escape cierra la ficha y devuelve el foco al servicio; el botón "Volver al lobby" es visible en sala y ficha y regresa al lobby
- [X] T029 [P] [US2] Test E2E de teclado en `tests/e2e/keyboard.spec.ts`: flujo completo lobby → sala → ficha → cerrar → lobby usando solo Tab/Enter/Escape (SC: completar el loop sin puntero)

### Implementation for User Story 2

- [X] T030 [US2] Redactar en `src/content/services.json` las fichas de EC2, Lambda, ECS, EKS, Fargate, Auto Scaling y Elastic Load Balancing en español (nombres de servicio en inglés, FR-011), basadas en la guía oficial SAA-C03: `summary` 1–2 frases (≤ 50 palabras), ≥1 `useCases`, ≥1 `examConcepts` (un concepto por ítem), ≥1 `compareWith` `{ target, difference }`, ≥1 `examTraps`, `costNote`; ficha completa ≤ 350 palabras — hace pasar T026
- [X] T031 [P] [US2] Definir en `src/scene/layouts/compute.ts` la posición isométrica y la clave de sprite de cada servicio por `id` — hace pasar T027
- [X] T032 [US2] Agregar a `src/scene/RoomScene.ts` los hotspots de servicios desde el layout: sprite por servicio, animación idle, resaltado en hover y en selección (FR-010); al hacer clic/tap llama a `navigation.selectService(id)`; resalta el hotspot cuando su ítem de la lista accesible recibe foco
- [X] T033 [P] [US2] Implementar la lista accesible de servicios de la sala en `src/ui/roomServiceList.ts`: un `<button>` por servicio (orden del catálogo) que llama a `navigation.selectService(id)`; es la vía de teclado/lector de pantalla equivalente a los hotspots
- [X] T034 [P] [US2] Implementar `renderServiceCard(service)` en `src/ui/serviceCard.ts`: `role="dialog"` con `aria-labelledby`, las 6 secciones con encabezados, botón cerrar, Escape cierra (`navigation.closeCard`), foco al abrir y retorno del foco al cerrar
- [X] T035 [P] [US2] Implementar la barra de navegación persistente con "Volver al lobby" (`navigation.goToLobby`) y el nombre de la sala actual en `src/ui/navBar.ts`
- [X] T036 [P] [US2] Estilos pixel art de la ficha, la lista de servicios y la barra en `src/styles/room.css`: ficha legible (tipografía de lectura para el cuerpo, fuente pixel solo en títulos), transiciones de apertura, layout responsive (ficha como panel lateral en desktop y hoja inferior en móvil)
- [X] T037 [US2] Conectar en `src/main.ts` los estados `room` y `card` con `RoomScene`, `roomServiceList`, `serviceCard` y `navBar` — hace pasar T028 y T029
- [X] T038 [US2] Implementar la vista alternativa en texto en `src/ui/textFallback.ts` y un toggle "Modo texto" en `src/ui/navBar.ts`: muestra todas las salas (con estado) y, para la sala disponible, todas las fichas de servicio completas como HTML semántico; agregar el caso al test `tests/e2e/room.spec.ts`

**Checkpoint**: US1 y US2 funcionan de forma independiente; el loop de aprendizaje completo es usable con mouse, tap y teclado

---

## Phase 5: User Story 3 - Repasar la diferencia entre servicios antes del examen (Priority: P2)

**Goal**: Desde una ficha, el usuario compara con servicios similares y salta directamente a la ficha del servicio comparado.

**Independent Test**: Abrir la ficha de EC2 → la sección "Comparación" muestra "Lambda" con su diferencia y un enlace; activarlo abre la ficha de Lambda; las trampas del examen se ven destacadas.

### Tests for User Story 3 ⚠️

- [X] T039 [P] [US3] Test unitario en `tests/unit/catalog.test.ts`: `resolveComparisons(serviceId)` devuelve cada `compareWith` con `service` resuelto cuando `target` es un id del catálogo y `service: undefined` cuando es solo un nombre de AWS
- [X] T040 [P] [US3] Test E2E en `tests/e2e/compare.spec.ts`: en la ficha de EC2, la comparación con Lambda es un enlace que abre la ficha de Lambda (clic y teclado); una comparación sin servicio en el catálogo se muestra como texto sin enlace; la sección "Trampas del examen" tiene un estilo destacado identificable

### Implementation for User Story 3

- [X] T041 [US3] Implementar `resolveComparisons(serviceId)` en `src/domain/catalog.ts` — hace pasar T039
- [X] T042 [US3] Actualizar `src/ui/serviceCard.ts` para renderizar la sección "Comparación" con `resolveComparisons`: enlace (`<button>`) a `navigation.selectService(target)` si existe en el catálogo, texto plano si no; siempre muestra `difference`
- [X] T043 [P] [US3] Destacar visualmente la sección "Trampas del examen" (ícono pixel de alerta + color de advertencia con contraste AA) en `src/styles/room.css` — junto con T042 hace pasar T040
- [X] T044 [US3] Revisar `src/content/services.json` para que cada par de servicios relacionados (EC2↔Lambda, ECS↔EKS, ECS/EKS↔Fargate, Auto Scaling↔ELB) tenga comparaciones recíprocas con `difference` orientada a "cuándo elegir cada uno"

**Checkpoint**: Las 3 user stories funcionan de forma independiente

---

## Phase 5b: Ajustes por feedback — Sala de informática

**Purpose**: Sala más grande, estaciones organizadas sin superposición y viaje de cámara (research.md, Decision 9)

- [X] T053 [US2] Tests de geometría en `tests/unit/iso.test.ts` (sala centrada, cabe completa con el zoom general y ocupa > 85% del ancho; `cameraCenterFor`) y de layout en `tests/unit/compute-layout.test.ts` (2 filas de laboratorio, separación ≥ 3 baldosas, lejos de las paredes)
- [X] T054 [US2] Grilla 12×10, origen centrado y zoom calculado en `src/scene/iso.ts`; estaciones reubicadas en `src/scene/layouts/compute.ts`
- [X] T055 [P] [US2] Sprites de laboratorio (piso, paredes y estación con monitor) en `scripts/generate-placeholder-sprites.mjs`
- [X] T056 [US2] Estaciones con ícono flotante, brillo de pantalla y viaje de cámara a la estación seleccionada en `src/scene/RoomScene.ts`; posición junto a la ficha calculada en `src/main.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accesibilidad, rendimiento, revisión editorial y despliegue

- [X] T045 [P] Test E2E de accesibilidad automática con axe en lobby, sala, ficha y modo texto (sin violaciones serias/críticas) en `tests/e2e/a11y.spec.ts`
- [X] T046 [P] Respetar `prefers-reduced-motion`: desactivar animaciones no esenciales en `src/styles/main.css` y en `src/scene/RoomScene.ts`
- [X] T047 Verificar metas de rendimiento del plan (carga inicial < 3 s, 60 fps en desktop): cargar Phaser de forma diferida solo al entrar a una sala (import dinámico en `src/main.ts`) y revisar el tamaño del bundle con `npm run build`
- [ ] T048 Revisión editorial del contenido contra la guía oficial SAA-C03: checklist por servicio en `specs/001-aws-tower-mvp/checklists/content-review.md`; actualizar `version` y `lastReviewed` en `src/content/rooms.json`
- [X] T049 [P] Configurar despliegue estático (GitHub Pages o Netlify): `base` en `vite.config.ts` y workflow/config de despliegue correspondiente
- [X] T050 [P] Crear `README.md` con descripción, scripts, cómo agregar una sala nueva (contenido en `src/content/`, layout en `src/scene/layouts/`, sprites en `public/assets/sprites/`) y créditos de assets
- [ ] T051 Sesión de validación con al menos 5 estudiantes de SAA-C03 (SC-003): cada uno revisa las fichas de 2 pares de servicios relacionados (p. ej. EC2/Lambda, ECS/EKS) y responde una pregunta de escenario por par; registrar guion y resultados (meta ≥ 80% de aciertos) en `specs/001-aws-tower-mvp/checklists/usability-sc003.md`
- [ ] T052 Ejecutar la validación completa de `specs/001-aws-tower-mvp/quickstart.md` (`npm run test`, `npm run test:e2e`, chequeos manuales de accesibilidad) y corregir lo que falle

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las user stories
- **US1 (Phase 3)**: depende de Foundational
- **US2 (Phase 4)**: depende de Foundational; para el E2E necesita entrar a la sala, así que usa el lobby de US1 (T022, T024, T025)
- **US3 (Phase 5)**: depende de la ficha de US2 (T034) y del contenido (T030)
- **Polish (Phase 6)**: depende de las user stories que se vayan a publicar

### Within Each Phase

- Tests primero; deben FALLAR antes de implementar (Constitución, Principio II)
- Dominio (`src/domain/`) antes que escena y UI
- Contenido y layout antes que los hotspots
- Conexión en `src/main.ts` al final de cada historia

### Parallel Opportunities

- Setup: T003, T004, T005, T006, T009
- Foundational: tests T010, T011, T012 en paralelo; luego T014 en paralelo con T015/T016
- US1: T020 y T021 en paralelo; T023 en paralelo con T022
- US2: tests T026–T029 en paralelo; T031, T033, T034, T035 y T036 en paralelo tras T030
- US3: T039 y T040 en paralelo; T043 en paralelo con T042
- Polish: T045, T046, T049 y T050 en paralelo

---

## Parallel Example: User Story 2

```bash
# Tests de US2 en paralelo (deben fallar):
Task: "Test de contenido en tests/content/compute-services.test.ts"
Task: "Test de layout en tests/unit/compute-layout.test.ts"
Task: "Test E2E en tests/e2e/room.spec.ts"
Task: "Test E2E de teclado en tests/e2e/keyboard.spec.ts"

# Tras el contenido (T030), UI en paralelo:
Task: "Layout en src/scene/layouts/compute.ts"
Task: "Lista accesible en src/ui/roomServiceList.ts"
Task: "Ficha en src/ui/serviceCard.ts"
Task: "Barra de navegación en src/ui/navBar.ts"
Task: "Estilos en src/styles/room.css"
```

---

## Implementation Strategy

### MVP First

1. Phase 1: Setup
2. Phase 2: Foundational (CRÍTICA)
3. Phase 3: US1 → **validar**: lobby y entrada a la sala
4. Phase 4: US2 → **validar**: el loop de aprendizaje completo. Este es el primer punto realmente útil para estudiar (US1 + US2 son ambas P1)

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 → demo del lobby
3. + US2 → MVP publicable (sala + fichas)
4. + US3 → comparaciones navegables
5. + Polish → accesibilidad verificada, revisión editorial y despliegue

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- Hacer commit por tarea o grupo lógico (Constitución, Principio V)
- Nada de texto de servicios hardcodeado en la escena ni en la UI: todo sale de `src/content/`
- `src/domain/` nunca importa Phaser ni toca el DOM (Constitución, Principio III)
- Seguimiento de progreso: diferido a una feature posterior
