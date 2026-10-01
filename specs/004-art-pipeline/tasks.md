# Tasks: Pipeline de arte propio

**Tests**: Obligatorios (Constitución, Principio II).

## Phase 1: Contrato de sprites y doble resolución

- [ ] T001 Declarar el tamaño de cada sprite en `src/scene/sprites.ts` (`SPRITE_SIZES`) a doble resolución: floor-tile 64×32, paredes 32×80, workstation 64×64, íconos 48×48
- [ ] T002 [P] Test de contrato en `tests/content/sprites.test.ts`: cada sprite de `SPRITE_KEYS` existe en `public/assets/sprites/`, es PNG RGBA y mide lo declarado — debe fallar
- [ ] T003 Duplicar la resolución en `src/scene/iso.ts` (960×540, baldosas 64×32, pared 64 px) y ajustar escalas en `src/scene/RoomScene.ts` (íconos a escala 1, etiqueta, marcador, sombra, brillo)
- [ ] T004 Regenerar placeholders a doble tamaño en `scripts/generate-placeholder-sprites.mjs`, omitiendo los sprites del manifiesto — hace pasar T002

## Phase 2: Piloto (US1, US2)

- [ ] T005 Crear `art/manifest.json` con las 3 piezas del piloto (workstation, service-lambda, floor-tile)
- [ ] T006 Script `scripts/convert-art.py`: recorte, quitar magenta y halos, reducción, paleta común de ≤ 32 colores, exportación de sprites y `art/palette.gpl`; script `npm run art`
- [ ] T007 Convertir las piezas del piloto y generar una lámina comparativa antes/después para el autor
- [ ] T008 Actualizar `public/assets/CREDITS.md` (arte de Jean Vitola)
- [ ] T009 Verificar en el navegador y con las suites completas (SC-003)

**Checkpoint (autor)**: aprobar el piloto (SC-001) antes de convertir el resto

## Phase 3: Resto del arte (tras aprobación)

- [ ] T010 Agregar al manifiesto los otros 6 íconos, las paredes y el rack
- [ ] T011 Animaciones con los cuadros de la CAPA 5 (US3)
