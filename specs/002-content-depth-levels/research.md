# Research: Niveles de profundidad en las fichas

## Decision 1: Contenido anidado por nivel (`normal` / `deep`)

**Decision**: Cada servicio en `services.json` pasa de campos planos a dos bloques: `normal` y `deep`. Los campos actuales se migran a `deep` (`compareWith` y `examTraps` conservan su nombre; `summary` se amplía a `deep.definition`; `useCases` pasa a objetos `{ scenario, example }`).

**Rationale**: Los niveles tienen secciones distintas (no es "el mismo texto más largo"). Anidar deja explícito qué pertenece a cada nivel, permite validar límites de palabras por nivel y mantiene un solo archivo de contenido (Principio IV).

**Alternatives considered**:
- Dos archivos (`services.normal.json`, `services.deep.json`): rechazado; duplica ids y obliga a validar consistencia entre archivos.
- Campos planos con sufijos (`summaryNormal`, `summaryDeep`): rechazado; ilegible y difícil de validar.

## Decision 2: El nivel elegido es estado de interfaz, no de dominio

**Decision**: El nivel (`normal` | `deep`) vive en `src/main.ts` junto al modo texto; no se guarda en el navegador. El dominio solo define el tipo y el valor por defecto.

**Rationale**: Es una preferencia de lectura sin reglas de negocio (FR-003: se pierde al recargar). Guardarlo en `navigation` mezclaría preferencias con el recorrido.

**Alternatives considered**: `sessionStorage`/`localStorage`: rechazado por FR-003 y por la decisión de diferir la persistencia (001, research Decision 4).

## Decision 3: Una sola función para resolver referencias a servicios

**Decision**: `resolveTarget(catalog, target, fromService)` devuelve `{ label, service, isCurrent, isOpenable }`. La usan la comparación rápida, la comparación detallada y los pasos de los patrones. `resolveComparisons` se mantiene y la usa internamente.

**Rationale**: Las tres secciones aplican la misma regla (FR-010, FR-011): abrir si existe en la sala, resaltar si es el propio servicio, texto si es externo. Una sola regla probada evita divergencias.

## Decision 4: Flujos de patrones como lista ordenada

**Decision**: Cada flujo se renderiza como `<ol>` de "chips" con flechas dibujadas con CSS. Los servicios abribles son `<button>`; el propio servicio es texto resaltado; los externos, texto.

**Rationale**: Una lista ordenada comunica el orden a lectores de pantalla sin depender de las flechas visuales (FR-012), y funciona igual en la ficha y en el modo texto.

**Alternatives considered**: Diagrama en canvas/SVG: descartado en la clarificación (más trabajo, menos accesible).

## Decision 5: Límites de lectura por nivel

**Decision**: Normal ≤ 250 palabras (todo el bloque `normal`); Profundo ≤ 900 palabras (todo el bloque `deep`). Reemplazan los límites de 001 (resumen ≤ 50, ficha ≤ 350). Reglas adicionales: 1–4 palabras clave, 1–3 puntos clave, 2–6 pasos por patrón, ≥ 1 patrón por servicio, y cada patrón incluye al propio servicio en su flujo.

**Rationale**: ~200 palabras por minuto → 250 palabras ≈ 1,25 min (holgura para releer) y 900 ≈ 4,5 min (SC-002). Las reglas se validan en el esquema y fallan en los tests de contenido.

## Decision 6: Cambio de nivel sin cerrar la ficha

**Decision**: Cambiar de nivel re-renderiza solo el cuerpo de la ficha, lleva el scroll al inicio y deja el foco en el botón del selector.

**Rationale**: Cumple el edge case de scroll y SC-003 (una acción, respuesta inmediata) sin pasar por la navegación del dominio.
