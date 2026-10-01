# Implementation Plan: Torre AWS MVP

**Branch**: `001-aws-tower-mvp` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-aws-tower-mvp/spec.md`

## Summary

Aplicación web educativa en pixel art (vista isométrica) para preparar la certificación AWS SAA-C03. El MVP entrega un lobby con habitaciones disponibles y "próximamente", y una habitación completa ("Sala de Máquinas", Compute) con 7 servicios interactivos. Al seleccionar un servicio se abre una ficha de estudio (resumen, casos de uso, conceptos de examen, comparación, trampas y costos).

Enfoque técnico: sitio estático con Vite + TypeScript. Phaser 3 renderiza solo la escena visual (sprites, animaciones, hotspots). El lobby, las fichas, la navegación y la vista alternativa en texto son DOM/HTML/CSS superpuesto. Las reglas (catálogo, navegación) viven en una capa de dominio pura en TypeScript, sin dependencias de Phaser ni del DOM. El contenido se carga desde JSON validado. El seguimiento de progreso queda fuera del MVP (se especificará en una feature posterior).

## Technical Context

**Language/Version**: TypeScript 5.x (modo `strict`), ES2022

**Primary Dependencies**: Phaser 3 (escena y animaciones), Vite (build/dev server), Zod (validación de esquema del contenido JSON)

**Storage**: Archivos JSON estáticos para el contenido (sin backend ni almacenamiento en el navegador)

**Testing**: Vitest (dominio y validación de contenido), Playwright (flujos E2E y accesibilidad por teclado), @axe-core/playwright (chequeo automático de accesibilidad)

**Target Platform**: Navegadores modernos (últimas 2 versiones de Chrome, Firefox, Safari, Edge); escritorio primero, responsive con soporte táctil

**Project Type**: Web app estática de una sola página (frontend únicamente)

**Performance Goals**: 60 fps en la escena en escritorio; carga inicial < 3 s en banda ancha; respuesta visual a hover/clic < 100 ms

**Constraints**: Sin backend ni cuentas; funciona como sitio estático; todo el flujo principal completable solo con teclado (Tab/Enter/Escape); texto de servicios no hardcodeado en la escena ni en la UI

**Scale/Scope**: 1 lobby, 1 habitación disponible + ~8 habitaciones "próximamente", 7 servicios con ficha

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo lo cumple el plan | Estado |
|-----------|------------------------|--------|
| I. Calidad antes que velocidad | TypeScript `strict`, módulos pequeños por responsabilidad (dominio / escena / UI / contenido), nombres explícitos | ✅ Pass |
| II. Tests obligatorios | Test fallido primero para cada regla de dominio y flujo; validación del contenido JSON como test; E2E de los 3 user stories | ✅ Pass |
| III. Lógica separada de interfaces | `src/domain/` es TypeScript puro sin Phaser ni DOM; la escena y la UI solo orquestan y renderizan | ✅ Pass |
| IV. Simplicidad sobre abstracción prematura | Sin framework de UI, sin librería de estado global, sin motor genérico de habitaciones: una sola `RoomScene` que lee la sala desde datos | ✅ Pass |
| V. Cambios pequeños y revisables | Entrega por user story (P1 lobby → P1 sala + fichas → P2 comparación), cada una testeable de forma independiente | ✅ Pass |

**Re-check post-diseño**: ✅ Sin violaciones. Zod es la única dependencia añadida más allá del stack base; se justifica porque la validación del contenido es un requisito (contrato y gobernanza editorial) y escribirla a mano sería más código y menos claro.

## Project Structure

### Documentation (this feature)

```text
specs/001-aws-tower-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html
src/
├── main.ts                    # Arranque: carga contenido, monta UI y escena
├── domain/                    # Lógica pura (sin Phaser ni DOM)
│   ├── catalog.ts             # Consultas sobre salas y servicios
│   └── navigation.ts          # Estados lobby → sala → ficha y transiciones válidas
├── content/
│   ├── rooms.json             # Salas (disponibles y próximamente)
│   ├── services.json          # Fichas de servicios
│   └── schema.ts              # Esquema Zod + carga validada
├── scene/                     # Phaser: solo render e input
│   ├── game.ts                # Configuración de Phaser
│   ├── RoomScene.ts           # Sala isométrica, hotspots, animaciones
│   └── layouts/
│       └── compute.ts         # Posición y sprite de cada servicio (por id), separado del contenido
├── ui/                        # DOM/HTML/CSS
│   ├── lobby.ts               # Lista de salas y estado "próximamente"
│   ├── serviceCard.ts         # Ficha de estudio
│   ├── navBar.ts              # Volver al lobby (siempre visible)
│   └── textFallback.ts        # Vista alternativa en texto
└── styles/
    └── main.css

public/
└── assets/
    └── sprites/               # Sprites y tilesets pixel art

tests/
├── unit/                      # Vitest: domain/
├── content/                   # Vitest: validación de rooms.json y services.json
└── e2e/                       # Playwright: flujos de los user stories + teclado + axe
```

**Structure Decision**: Proyecto único de frontend estático. Se usa la estructura de arriba porque no hay backend; las carpetas separan dominio, contenido, escena y UI para cumplir el principio III y para que agregar habitaciones futuras sea principalmente agregar datos en `src/content/` y sprites en `public/assets/`.

## Complexity Tracking

> Sin violaciones de la constitución que justificar.
