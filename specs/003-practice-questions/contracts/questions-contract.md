# Questions Content Contract

Archivo: `src/content/questions.json`. Se valida junto con el catálogo (necesita los ids de servicio).

```json
{
  "questions": [
    {
      "id": "lambda-n1",
      "serviceId": "lambda",
      "difficulty": "normal",
      "type": "single",
      "prompt": "¿Cuál es el tiempo máximo que puede ejecutarse una invocación de AWS Lambda?",
      "options": [
        { "text": "5 minutos", "correct": false, "explanation": "Era el límite antiguo; hoy es 15 minutos." },
        { "text": "15 minutos", "correct": true, "explanation": "El timeout máximo configurable es de 900 segundos." },
        { "text": "1 hora", "correct": false, "explanation": "..." },
        { "text": "Sin límite", "correct": false, "explanation": "..." }
      ],
      "source": {
        "title": "Lambda quotas",
        "url": "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html"
      },
      "verifiedOn": "2026-09-30"
    }
  ]
}
```

## Validation requirements

- Ver reglas de [data-model.md](../data-model.md): tipos, cantidad de opciones y correctas, "(Elige 2)", 5/5/5 por servicio, ≥ 2 `multiple` entre las `hard`, posiciones variadas de la correcta, ids únicos, `serviceId` existente.
- `source.url`: https y dominio `docs.aws.amazon.com`, `aws.amazon.com` o `d1.awsstatic.com`.
- `verifiedOn`: fecha ISO; al re-verificar una pregunta se actualiza la fecha.
