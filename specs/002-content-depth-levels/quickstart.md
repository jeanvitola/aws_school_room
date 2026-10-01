# Quickstart Validation Guide: Niveles de profundidad

## Prerequisites

Los mismos de [001](../001-aws-tower-mvp/quickstart.md) (Node.js 20+, `npm install`, Chromium de Playwright).

## Validation commands

```bash
npm run test
npm run test:e2e
```

## Manual checks

1. Abrir la Sala de Máquinas y la ficha de AWS Lambda: está en **Normal** y muestra Qué es (con analogía), Palabras clave, Lo clave para el examen, Comparación rápida y Costo en una frase.
2. Elegir **Profundo**: aparecen las 7 secciones, incluido Patrones de arquitectura con un flujo S3 → Lambda → DynamoDB.
3. Desde el flujo o una comparación, abrir otro servicio de la sala: se abre en Profundo.
4. Volver a Normal; recargar la página: la ficha vuelve a abrirse en Normal.
5. Usar solo teclado: Tab hasta el selector, Enter para cambiar de nivel, Tab hasta un servicio del flujo, Enter.
6. Modo texto: el selector existe y cambia el nivel de todas las fichas.

## Expected outcomes

- Los tests de contenido fallan si un servicio no tiene ambos niveles, supera 250/900 palabras o un patrón no incluye al propio servicio.
- Los E2E cubren selector, persistencia durante la visita, reinicio al recargar, flujos navegables y modo texto.
