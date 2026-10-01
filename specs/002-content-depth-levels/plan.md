# Implementation Plan: Niveles de profundidad en las fichas

**Branch**: `002-content-depth-levels` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-content-depth-levels/spec.md`

## Summary

Las fichas de la Sala de Máquinas pasan a tener dos niveles: **Normal** (lenguaje cotidiano con analogía, palabras clave, puntos clave del examen, comparación rápida, costo en una frase) y **Profundo** (definición y funcionamiento, conceptos y límites, comparación detallada, casos de uso con ejemplo, patrones de arquitectura con flujo de servicios, trampas, costos). Un selector en la ficha y en el modo texto cambia el nivel; la elección se mantiene durante la visita.

Enfoque técnico: se extiende el stack de 001 sin dependencias nuevas. El contenido de `services.json` pasa al contrato v2 (bloques `normal` y `deep`) validado con Zod; el dominio agrega `resolveTarget`; la UI agrega el selector y el render por nivel; los flujos se dibujan como listas ordenadas con CSS.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), igual que 001

**Primary Dependencies**: Sin cambios (Phaser 3, Vite, Zod)

**Storage**: `src/content/services.json` con el contrato v2; el nivel elegido solo en memoria

**Testing**: Vitest (esquema v2, reglas de contenido, `resolveTarget`), Playwright (selector, persistencia en la visita, flujos, modo texto, teclado)

**Target Platform**: Igual que 001

**Project Type**: Web app estática (frontend)

**Performance Goals**: Cambio de nivel < 100 ms (re-render del cuerpo de la ficha)

**Constraints**: Sin texto hardcodeado en la UI; el dominio sin Phaser ni DOM; accesible por teclado

**Scale/Scope**: 7 servicios × 2 niveles; ≥ 7 patrones de arquitectura

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cómo lo cumple el plan | Estado |
|-----------|------------------------|--------|
| I. Calidad antes que velocidad | Contrato v2 tipado y validado; secciones por nivel con funciones pequeñas | ✅ Pass |
| II. Tests obligatorios | Tests de esquema, contenido y `resolveTarget` antes de implementar; E2E por user story | ✅ Pass |
| III. Lógica separada de interfaces | La regla de "abrible / actual / externo" vive en `src/domain/catalog.ts`; la UI solo la dibuja | ✅ Pass |
| IV. Simplicidad | Sin dependencias nuevas; nivel en memoria; flujos con HTML + CSS, sin librería de diagramas | ✅ Pass |
| V. Cambios pequeños y revisables | Fases por user story; migración del contenido separada del cambio de UI | ✅ Pass |

**Re-check post-diseño**: ✅ Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/002-content-depth-levels/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── service-content-contract-v2.md
└── tasks.md
```

### Source Code (archivos que cambian o se agregan)

```text
src/
├── domain/
│   ├── types.ts               # Service v2: NormalContent, DeepContent, ArchitecturePattern, DepthLevel
│   └── catalog.ts             # + resolveTarget; resolveComparisons usa deep.compareWith
├── content/
│   ├── schema.ts              # Esquema v2 y reglas de contenido (límites, patrones)
│   └── services.json          # Contenido de 7 servicios en ambos niveles
├── ui/
│   ├── depthSelector.ts       # NUEVO: selector Normal / Profundo
│   ├── serviceCard.ts         # Render por nivel; flujos de patrones
│   └── textFallback.ts        # Selector y render por nivel
├── styles/
│   └── room.css               # Selector, analogía, glosario, flujos
└── main.ts                    # Estado del nivel durante la visita

tests/
├── fixtures.ts                # Fixtures v2
├── unit/catalog.test.ts       # + resolveTarget
├── content/schema.test.ts     # Esquema v2
├── content/compute-services.test.ts  # Reglas de contenido v2
└── e2e/
    ├── depth.spec.ts          # NUEVO: selector y persistencia (US1, US2)
    ├── patterns.spec.ts       # NUEVO: flujos de patrones (US3)
    └── room.spec.ts, compare.spec.ts, keyboard.spec.ts  # Ajustes a las secciones nuevas
```

**Structure Decision**: Se mantiene el proyecto único de 001. Solo se agrega `src/ui/depthSelector.ts`; el resto son cambios a módulos existentes.

## Complexity Tracking

> Sin violaciones de la constitución que justificar.
