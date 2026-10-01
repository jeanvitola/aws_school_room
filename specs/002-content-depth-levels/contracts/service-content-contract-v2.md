# Service Content Contract v2

Reemplaza la sección `services.json` del [contrato de 001](../../001-aws-tower-mvp/contracts/service-content-contract.md). `rooms.json` no cambia.

```json
{
  "services": [
    {
      "id": "lambda",
      "name": "AWS Lambda",
      "roomId": "compute",
      "normal": {
        "whatIs": "AWS Lambda ejecuta tu código sin que tengas que preparar servidores...",
        "analogy": "Es como la luz con sensor de movimiento...",
        "glossary": [{ "term": "Serverless", "definition": "Tú no administras servidores; AWS se encarga." }],
        "examKeyPoints": ["Cada ejecución dura como máximo 15 minutos."],
        "quickComparison": { "target": "ec2", "rule": "Tareas cortas por eventos → Lambda; programas todo el día → EC2." },
        "costInOneLine": "Pagas por ejecución y por duración; si no se usa, no pagas."
      },
      "deep": {
        "definition": "...",
        "keyConcepts": ["Tiempo máximo: 15 minutos"],
        "compareWith": [{ "target": "ec2", "difference": "..." }],
        "useCases": [{ "scenario": "Procesar archivos al subirlos", "example": "Crear miniaturas cuando se sube una foto a S3." }],
        "patterns": [
          {
            "name": "Procesamiento de archivos por eventos",
            "problem": "...",
            "whenToUse": "...",
            "whenNotToUse": "...",
            "steps": [
              { "target": "Amazon S3", "role": "Recibe el archivo y emite el evento" },
              { "target": "lambda", "role": "Procesa el archivo" },
              { "target": "Amazon DynamoDB", "role": "Guarda el resultado" }
            ]
          }
        ],
        "examTraps": ["..."],
        "costs": "..."
      }
    }
  ]
}
```

## Validation requirements

- Todo lo del contrato 001 que sigue aplicando: ids únicos, `roomId` existente, sin servicios en salas `upcoming`.
- `normal`: ≤ 250 palabras; `glossary` 1–4; `examKeyPoints` 1–3; todos los textos no vacíos.
- `deep`: ≤ 900 palabras; `keyConcepts`, `compareWith`, `useCases`, `patterns`, `examTraps` con ≥ 1 elemento.
- Cada patrón: 2–6 `steps`; al menos un paso con `target` igual al `id` del servicio.
- `target` (en `quickComparison`, `compareWith` y `steps`): id de un servicio del catálogo o nombre de un servicio de AWS.
- Cambios de contenido: subir `version` y `lastReviewed` en `rooms.json` tras revisión editorial.
