# Implementation Plan: Preguntas de práctica por servicio

**Branch**: `003-practice-questions` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-practice-questions/spec.md`

## Summary

Cada ficha suma una tercera pestaña, **Preguntas**, con 15 preguntas tipo examen del servicio (5 Normales, 5 Medias, 5 Difíciles, en ese orden), de respuesta única o "Elige 2", con explicación por opción, fuente oficial y fecha de verificación, y un resumen final por dificultad.

Enfoque técnico: sin dependencias nuevas. Contenido en `src/content/questions.json` validado con Zod; el intento es una máquina de estados pura en `src/domain/quiz.ts`; la UI generaliza el selector de 002 a tres pestañas y agrega `src/ui/quizView.ts`.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), igual que 001/002

**Primary Dependencies**: Sin cambios (Phaser 3, Vite, Zod)

**Storage**: `src/content/questions.json`; el intento solo en memoria mientras la ficha está abierta

**Testing**: Vitest (esquema de preguntas, reglas por servicio, máquina de estados del intento), Playwright (flujo de responder, "Elige 2", resumen, teclado, persistencia entre pestañas)

**Target Platform**: Igual que 001

**Project Type**: Web app estática (frontend)

**Performance Goals**: Respuesta visual al responder < 100 ms

**Constraints**: Fuentes solo de dominios oficiales de AWS; el dominio sin DOM ni Phaser; accesible con teclado y lector de pantalla

**Scale/Scope**: 7 servicios × 15 preguntas = 105 preguntas

## Constitution Check

| Principio | Cómo lo cumple el plan | Estado |
|-----------|------------------------|--------|
| I. Calidad antes que velocidad | Contrato de preguntas tipado y validado; vista de preguntas en un módulo propio | ✅ Pass |
| II. Tests obligatorios | Tests de esquema, reglas de contenido y máquina de estados antes de implementar; E2E por user story | ✅ Pass |
| III. Lógica separada de interfaces | Evaluación, orden y puntaje en `src/domain/quiz.ts`; la UI solo dibuja | ✅ Pass |
| IV. Simplicidad | Orden fijo de opciones, sin persistencia ni aleatoriedad; reutiliza el selector de 002 | ✅ Pass |
| V. Cambios pequeños y revisables | Motor + preguntas de Lambda primero (punto de control con el usuario); resto del contenido después | ✅ Pass |

**Re-check post-diseño**: ✅ Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/003-practice-questions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/questions-contract.md
└── tasks.md
```

### Source Code (archivos que cambian o se agregan)

```text
src/
├── domain/
│   ├── types.ts              # + Question, QuestionOption, Difficulty, CardView
│   └── quiz.ts               # NUEVO: createQuizAttempt (máquina de estados)
├── content/
│   ├── questionSchema.ts     # NUEVO: esquema y reglas de preguntas
│   └── questions.json        # NUEVO: preguntas por servicio
├── ui/
│   ├── depthSelector.ts      # Generalizado a pestañas de la ficha (Normal / Profundo / Preguntas)
│   ├── quizView.ts           # NUEVO: pregunta, opciones, resultado y resumen
│   └── serviceCard.ts        # Tercera pestaña; intento por ficha
├── styles/room.css           # Estilos de preguntas
└── main.ts                   # Carga de preguntas; pestaña activa durante la visita

tests/
├── unit/quiz.test.ts                      # NUEVO
├── content/questions-schema.test.ts       # NUEVO
├── content/questions-content.test.ts      # NUEVO
└── e2e/quiz.spec.ts                       # NUEVO
```

**Structure Decision**: Mismo proyecto único. El esquema de preguntas va en un archivo propio para no mezclarlo con el del catálogo.

## Complexity Tracking

> Sin violaciones de la constitución que justificar.
