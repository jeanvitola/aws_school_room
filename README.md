# Torre AWS

Web en pixel art para estudiar la certificación **AWS Certified Solutions Architect – Associate (SAA-C03)**. Exploras una torre de salas; cada sala agrupa una familia de servicios y cada estación es un servicio con:

- **Ficha en dos niveles:** _Normal_ (lenguaje simple, analogías y palabras clave) y _Profundo_ (definición, límites, comparaciones, casos de uso, patrones de arquitectura, trampas del examen y costos).
- **15 preguntas de práctica** (5 normales, 5 medias y 5 difíciles) con explicación de cada opción y la fuente oficial de AWS en que se basan.

Hoy está disponible la **Sala de Máquinas** (EC2, Lambda, ECS, EKS, Fargate, Auto Scaling y Elastic Load Balancing).

## Requisitos

- **Node.js 20 o posterior** para el sitio y los tests.
- **Python 3 con Pillow** (`pip install pillow`), solo si vas a convertir arte.

## Comandos

| Comando                           | Qué hace                                                             |
| --------------------------------- | -------------------------------------------------------------------- |
| `npm install`                     | Instala las dependencias                                             |
| `npx playwright install chromium` | Instala el navegador de los tests E2E (una sola vez)                 |
| `npm run dev`                     | Servidor de desarrollo en http://localhost:5173                      |
| `npm run build`                   | Compila el sitio estático en `dist/`                                 |
| `npm run preview`                 | Sirve `dist/` en http://localhost:4173                               |
| `npm test`                        | Tests unitarios y de contenido (Vitest)                              |
| `npm run test:e2e`                | Tests de punta a punta, accesibilidad y rendimiento (Playwright)     |
| `npm run lint`                    | ESLint                                                               |
| `npm run art`                     | Convierte las ilustraciones de `art/` en sprites del juego           |
| `npm run art:placeholders`        | Genera dibujos provisionales para los sprites que aún no tienen arte |

## Cómo está organizado

```text
src/
├── domain/      Reglas de negocio puras (catálogo, navegación, intento de preguntas). Sin Phaser ni DOM.
├── content/     Contenido en JSON (salas, fichas, preguntas) y sus esquemas de validación (Zod).
├── scene/       Sala isométrica con Phaser. Se carga recién al entrar a una sala.
├── ui/          Interfaz en HTML (lobby, fichas, preguntas, modo texto).
└── styles/
art/             Ilustraciones originales, manifest.json de conversión y palette.gpl (Aseprite).
scripts/         Conversión de arte y placeholders.
specs/           Especificaciones (Spec-Driven Development con spec-kit).
tests/           unit/, content/ y e2e/.
```

El dominio no puede importar Phaser ni tocar el DOM: ESLint lo impide (constitución, principio III).

## Especificaciones

El proyecto se desarrolla con **Spec-Driven Development** ([spec-kit](https://github.com/github/spec-kit)). Las reglas generales están en la [constitución](.specify/memory/constitution.md): calidad antes que velocidad, tests obligatorios (primero el test que falla), lógica separada de la interfaz, simplicidad y cambios pequeños.

| Spec                                                                   | Qué agrega                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| [001 · MVP](specs/001-aws-tower-mvp/spec.md)                           | Lobby, Sala de Máquinas, fichas, modo texto                    |
| [002 · Niveles de profundidad](specs/002-content-depth-levels/spec.md) | Normal / Profundo y patrones de arquitectura                   |
| [003 · Preguntas de práctica](specs/003-practice-questions/spec.md)    | 15 preguntas por servicio, verificadas contra la documentación |
| [004 · Pipeline de arte](specs/004-art-pipeline/spec.md)               | Conversión del arte propio, resolución ×2 y animaciones        |

## Contenido y vigencia

- Las fichas viven en `src/content/services.json` y las preguntas en `src/content/questions.json`. Los esquemas validan su estructura y sus límites (por ejemplo, Normal ≤ 250 palabras, Profundo ≤ 900, 5/5/5 preguntas por servicio).
- Cada pregunta cita una **fuente oficial de AWS** y la fecha en que se verificó (`verifiedOn`).
- `tests/content/verified-facts.test.ts` protege datos verificados que cambian seguido (límites y precios). Si AWS cambia uno, re-verifícalo y actualiza el test y el contenido.
- Antes de publicar contenido nuevo, revísalo contra la [guía oficial del examen SAA-C03](https://aws.amazon.com/certification/certified-solutions-architect-associate/).

## Cómo agregar una sala nueva

1. **Sala:** en `src/content/rooms.json`, cambia su `status` a `available`.
2. **Fichas:** agrega sus servicios en `src/content/services.json` con `roomId` de la sala, siguiendo el [contrato v2](specs/002-content-depth-levels/contracts/service-content-contract-v2.md).
3. **Preguntas:** agrega 15 por servicio en `src/content/questions.json` según el [contrato de preguntas](specs/003-practice-questions/contracts/questions-contract.md).
4. **Distribución:** crea `src/scene/layouts/<sala>.ts` con la posición de cada estación (y su decoración) y regístralo en `ROOM_LAYOUTS` de `src/main.ts`.
5. **Arte:** declara los sprites nuevos en `src/scene/sprite-sizes.json`, agrega las piezas a `art/manifest.json` y corre `npm run art`.
6. **Tests:** `npm test` valida el contenido, el layout y los sprites; agrega E2E para lo que sea propio de la sala.

## Arte

Todo el arte es de **Jean Vitola**. Las ilustraciones originales están en `art/public/assets/sprites/`; `npm run art` las recorta, quita el fondo magenta, las reduce al tamaño del juego y las ajusta a una paleta común de 32 colores (`art/palette.gpl`, para retocar en Aseprite). Ver [créditos](public/assets/CREDITS.md).
