# Quickstart Validation Guide: Preguntas de práctica

## Validation commands

```bash
npm run test
npm run test:e2e
```

## Manual checks

1. Abrir la ficha de AWS Lambda y elegir **Preguntas**: aparece "Pregunta 1 de 15 · Normal".
2. Intentar responder sin elegir: el botón Responder está deshabilitado.
3. Elegir una opción incorrecta y responder: se marca como incorrecta, se resalta la correcta y cada opción muestra su explicación y la fuente oficial.
4. Avanzar hasta una pregunta "Elige 2": no se pueden marcar 3 opciones; con 1 no se puede responder.
5. Cambiar a Normal y volver a Preguntas: se continúa en la misma pregunta.
6. Terminar las 15: el resumen muestra el total y el puntaje por dificultad; "Reintentar" vuelve a la 1; "Repasar el servicio" abre Profundo.
7. Repetir el recorrido solo con teclado.

## Expected outcomes

- Los tests de contenido fallan si un servicio no tiene 5/5/5, si falta una fuente oficial o una explicación, o si la correcta está siempre en la misma posición.
