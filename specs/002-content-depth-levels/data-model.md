# Data Model: Niveles de profundidad

Cambia la entidad **Service** de la feature 001. **Room**, **ContentCatalog** y la navegación no cambian.

## Entity: Service (v2)

| Field | Type | Validation |
|-------|------|------------|
| id, name, roomId, tags | igual que 001 | igual que 001 |
| normal | NormalContent | Requerido; ≤ 250 palabras en total |
| deep | DeepContent | Requerido; ≤ 900 palabras en total |

## Value: NormalContent

| Field | Type | Validation |
|-------|------|------------|
| whatIs | string | Requerido; lenguaje cotidiano |
| analogy | string | Requerido |
| glossary | GlossaryTerm[] | 1 a 4 elementos |
| examKeyPoints | string[] | 1 a 3 elementos |
| quickComparison | { target: string; rule: string } | Requerido; `target` = id del catálogo o nombre de AWS |
| costInOneLine | string | Requerido |

## Value: GlossaryTerm

| Field | Type | Validation |
|-------|------|------------|
| term | string | Requerido |
| definition | string | Requerido; una línea |

## Value: DeepContent

| Field | Type | Validation |
|-------|------|------------|
| definition | string | Requerido; definición y funcionamiento |
| keyConcepts | string[] | ≥ 1; conceptos clave y límites |
| compareWith | { target; difference }[] | ≥ 1 (igual que 001) |
| useCases | { scenario: string; example: string }[] | ≥ 1 |
| patterns | ArchitecturePattern[] | ≥ 1 |
| examTraps | string[] | ≥ 1 |
| costs | string | Requerido |

## Value: ArchitecturePattern

| Field | Type | Validation |
|-------|------|------------|
| name | string | Requerido |
| problem | string | Requerido |
| whenToUse | string | Requerido |
| whenNotToUse | string | Requerido |
| steps | { target: string; role: string }[] | 2 a 6 pasos; al menos uno con `target` = id del propio servicio |

## Value: ResolvedTarget (derivado, no se guarda)

| Field | Type | Meaning |
|-------|------|---------|
| label | string | Nombre a mostrar (nombre del servicio o texto de `target`) |
| service | Service \| undefined | Servicio del catálogo si existe |
| isCurrent | boolean | Es el servicio de la ficha |
| isOpenable | boolean | Existe, está en la misma sala y no es el actual |

## UI state: DepthLevel

`normal` | `deep`, por defecto `normal`. Vive en memoria durante la visita (no persiste).
