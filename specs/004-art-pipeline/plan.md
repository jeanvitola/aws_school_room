# Implementation Plan: Pipeline de arte propio

**Branch**: `004-art-pipeline` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

## Summary

Un script convierte las ilustraciones del autor (fondo magenta, alta resolución) en sprites transparentes al tamaño del juego con una paleta común, guiado por un manifiesto. La resolución interna del juego se duplica (480×270 → 960×540) para conservar detalle. Piloto: estación de trabajo, ícono de Lambda y baldosa del piso.

## Technical Context

**Language/Version**: TypeScript (juego); Python 3 + Pillow (script de conversión de arte, herramienta de autor que no se ejecuta en el build del sitio)

**Primary Dependencies**: Sin cambios en el sitio. Pillow solo en la máquina del autor.

**Storage**: Fuentes en `art/`, sprites en `public/assets/sprites/`, manifiesto en `art/manifest.json`, paleta en `art/palette.gpl`

**Testing**: Vitest valida cada sprite del juego (existe, PNG con alfa, tamaño declarado); los E2E existentes validan que la sala sigue funcionando a la nueva resolución.

**Constraints**: Escala entera de los sprites (sin deformar píxeles); misma apariencia de tamaño en pantalla.

## Constitution Check

| Principio | Cómo lo cumple | Estado |
|-----------|----------------|--------|
| I. Calidad | Manifiesto declarativo; tamaños en un solo lugar (`src/scene/sprites.ts`) | ✅ |
| II. Tests | Test de contrato de sprites antes de convertir; E2E existentes como red de seguridad | ✅ |
| III. Separación | El pipeline de arte no toca dominio ni UI | ✅ |
| IV. Simplicidad | Pillow (resize + quantize) en lugar de herramientas nuevas en el sitio | ✅ |
| V. Cambios pequeños | Piloto de 3 piezas con aprobación antes del resto | ✅ |

## Design Decisions

1. **Doble resolución**: `GAME_WIDTH/HEIGHT` ×2 y baldosas de 64×32. Toda la geometría deriva de `src/scene/iso.ts`, así que la escena y los tests se ajustan solos.
2. **Tamaños declarados**: `src/scene/sprites.ts` pasa a declarar el tamaño de cada sprite; el test de contrato y los scripts lo usan como fuente de verdad.
3. **Conversión**: recorte por zona del manifiesto → quitar magenta y halos (por tono, no solo por color exacto) → recorte ajustado → reducción por promedio (BOX) → cuantización a la paleta común sin tramado → alfa binaria.
4. **Convivencia**: los placeholders se regeneran a doble tamaño y omiten los nombres que define el manifiesto.

## Project Structure

```text
art/
├── public/assets/sprites/*.png   # Ilustraciones originales del autor (fuente)
├── manifest.json                 # NUEVO: piezas a convertir
└── palette.gpl                   # NUEVO: paleta para Aseprite (generada)
scripts/
├── convert-art.py                # NUEVO
└── generate-placeholder-sprites.mjs  # Doble tamaño; omite piezas del manifiesto
src/scene/
├── iso.ts                        # Resolución ×2
├── sprites.ts                    # + tamaños declarados
└── RoomScene.ts                  # Ajustes de escala (íconos, etiquetas, marcador)
tests/content/sprites.test.ts     # NUEVO: contrato de sprites
```
