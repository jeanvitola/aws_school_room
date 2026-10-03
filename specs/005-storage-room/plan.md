# Implementation Plan: Bodega (sala de almacenamiento)

**Branch**: `005-storage-room` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-storage-room/spec.md`

## Summary

La Bodega se abre con 9 estaciones de almacenamiento (S3, S3 Glacier, EBS, EFS, FSx, Storage Gateway, AWS Backup, DataSync y Transfer Family), cada una con ficha Normal/Profunda y 15 preguntas, sobre el mismo motor de la Sala de Máquinas.

Enfoque técnico: sin dependencias nuevas. Dos cambios de base antes del contenido: (1) un registro de distribuciones por sala en lugar de la condición `roomId === 'compute'`, y (2) preguntas divididas por sala y cargadas al entrar, para que el lobby no crezca con cada sala. Luego, contenido verificado contra la documentación oficial, con la muestra de S3 como punto de control.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), igual que 001–004

**Primary Dependencies**: Sin cambios (Phaser 3.90, Vite, Zod)

**Storage**: JSON en `src/content/`; preguntas en `src/content/questions/<roomId>.json`

**Testing**: Vitest (contenido de la Bodega, distribuciones de todas las salas, carga de preguntas por sala), Playwright (recorrido de la Bodega, comparaciones, preguntas, accesibilidad, rendimiento)

**Target Platform**: Igual que 001 (escritorio y móvil, GitHub Pages)

**Project Type**: Web app estática (frontend)

**Performance Goals**: Lobby < 300 KB de JavaScript (se espera ≈ 160 KB tras dividir las preguntas)

**Constraints**: Contenido verificado contra docs oficiales de AWS; la Sala de Máquinas no cambia de comportamiento (FR-013)

**Scale/Scope**: 9 servicios, 135 preguntas, 1 distribución, 2 sprites de decoración

## Constitution Check

| Principio                          | Cómo lo cumple el plan                                                                      | Estado  |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | ------- |
| I. Calidad antes que velocidad     | Contenido verificado contra fuentes oficiales; datos cambiantes protegidos por test         | ✅ Pass |
| II. Tests obligatorios             | Tests de contenido, distribución y carga por sala antes de implementar; E2E por user story  | ✅ Pass |
| III. Lógica separada de interfaces | La validación de preguntas por sala vive en `src/content/`; la escena solo recibe datos     | ✅ Pass |
| IV. Simplicidad                    | Registro de datos en lugar de condiciones por sala; se reutiliza piso, paredes y escritorio | ✅ Pass |
| V. Cambios pequeños y revisables   | Base sin cambio visible → muestra S3 (punto de control) → resto del contenido → decoración  | ✅ Pass |

**Re-check post-diseño**: ✅ Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/005-storage-room/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (archivos que cambian o se agregan)

```text
src/
├── content/
│   ├── rooms.json                 # Bodega disponible
│   ├── services.json              # +9 servicios
│   ├── questionSchema.ts          # Validación de un archivo de preguntas por sala
│   └── questions/
│       ├── compute.json           # MOVIDO desde questions.json
│       └── storage.json           # NUEVO: 135 preguntas
├── scene/
│   ├── sprite-sizes.json          # + shelf, crates
│   └── layouts/
│       ├── index.ts               # NUEVO: ROOM_LAYOUTS
│       ├── compute.ts
│       └── storage.ts             # NUEVO: estaciones y decoración de la Bodega
└── main.ts                        # Usa ROOM_LAYOUTS; carga las preguntas al entrar a la sala

tests/
├── unit/room-layouts.test.ts              # Reemplaza compute-layout.test.ts, recorre todas las salas
├── content/storage-services.test.ts       # NUEVO
├── content/questions-*.test.ts            # Archivos por sala
├── content/verified-facts.test.ts         # + datos de almacenamiento
└── e2e/storage.spec.ts                    # NUEVO
```

**Structure Decision**: Mismo proyecto único. Una sala nueva es datos (contenido, distribución, sprites) más su test; el código de escena y UI no cambia salvo el registro.

## Complexity Tracking

> Sin violaciones de la constitución que justificar.
