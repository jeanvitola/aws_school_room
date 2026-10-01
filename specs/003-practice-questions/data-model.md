# Data Model: Preguntas de práctica

## Entity: Question

| Field | Type | Validation |
|-------|------|------------|
| id | string | Requerido, único (p. ej. `lambda-n1`) |
| serviceId | string | Requerido; servicio existente del catálogo |
| difficulty | `normal` \| `medium` \| `hard` | Requerido |
| type | `single` \| `multiple` | Requerido |
| prompt | string | Requerido; si `multiple`, contiene "(Elige 2)" |
| options | QuestionOption[] | `single`: 4 opciones, 1 correcta. `multiple`: 5 opciones, 2 correctas |
| source | { title: string; url: string } | Requerido; URL https de un dominio oficial de AWS |
| verifiedOn | string | Fecha ISO (AAAA-MM-DD) |

## Value: QuestionOption

| Field | Type | Validation |
|-------|------|------------|
| text | string | Requerido |
| correct | boolean | Requerido |
| explanation | string | Requerido: por qué es correcta o incorrecta |

## Reglas por servicio (si tiene preguntas)

- Exactamente 15: 5 `normal`, 5 `medium`, 5 `hard`.
- Al menos 2 preguntas `hard` de tipo `multiple`.
- La opción correcta de las preguntas `single` ocupa al menos 3 posiciones distintas.

## State: QuizAttempt (dominio, en memoria)

| Field | Meaning |
|-------|---------|
| questions | Las 15 preguntas ordenadas por dificultad (normal → medium → hard) |
| index | Pregunta actual (0–14) |
| selected | Índices de opciones elegidas en la pregunta actual |
| answers | Resultado de cada pregunta respondida (`correct: boolean`) |
| phase | `answering` → `answered` → (`answering` siguiente) … → `finished` |

### Transiciones

- `select(i)`: solo en `answering`. En `single` reemplaza la selección; en `multiple` alterna, sin superar 2.
- `submit()`: solo si `canSubmit()` (1 o 2 elegidas según el tipo); pasa a `answered` y devuelve `{ correct, correctIndexes }`.
- `next()`: desde `answered`; avanza o pasa a `finished` tras la 15.
- `summary()`: `{ correct, total, byDifficulty: { normal, medium, hard } }`.

## UI state: CardView

`normal` | `deep` | `quiz`; por defecto `normal`; se mantiene entre servicios durante la visita.
