# Research: Preguntas de práctica por servicio

## Decision 1: Archivo de contenido separado (`questions.json`)

**Decision**: Las preguntas viven en `src/content/questions.json`, cada una con `serviceId`. No se agregan a `services.json`.

**Rationale**: Son 105 preguntas con explicaciones por opción; dentro de `services.json` lo harían difícil de revisar. Separarlas permite revisarlas y versionarlas por su cuenta y validarlas con reglas propias.

**Alternatives considered**: Un archivo por servicio: descartado por ahora (7 archivos con la misma validación); se puede dividir más adelante si crece.

## Decision 2: El intento es una máquina de estados pura en el dominio

**Decision**: `src/domain/quiz.ts` expone `createQuizAttempt(questions)` con `select`, `canSubmit`, `submit`, `next` y `summary`. La UI solo dibuja su estado.

**Rationale**: Las reglas (cantidad a elegir, evaluación de "Elige 2", orden, puntaje por dificultad) son lógica de negocio y deben probarse sin DOM (Principio III).

## Decision 3: La ficha tiene tres pestañas, no "tres niveles"

**Decision**: Se generaliza el selector de 002: `CardView = 'normal' | 'deep' | 'quiz'`. El grupo pasa a llamarse "Contenido de la ficha". La pestaña activa se mantiene entre servicios durante la visita (igual que el nivel en 002).

**Rationale**: "Preguntas" no es un nivel de profundidad; nombrarlo bien evita confusión para lectores de pantalla. Reutilizar el selector mantiene una sola interacción.

## Decision 4: El intento vive mientras la ficha está abierta

**Decision**: Cada ficha crea su intento al abrir "Preguntas" por primera vez y lo conserva al cambiar de pestaña; al cerrar la ficha o cambiar de servicio se descarta (FR-013).

**Rationale**: Es lo más simple que cumple la spec y coherente con no persistir progreso (001, Decision 4).

## Decision 5: Vigencia verificable por pregunta

**Decision**: Cada pregunta tiene `source: { title, url }` (solo dominios oficiales `docs.aws.amazon.com`, `aws.amazon.com` o `d1.awsstatic.com`) y `verifiedOn` (fecha ISO). Los datos volátiles (límites, precios, descuentos) se contrastan con la documentación al redactar.

**Rationale**: Hace auditable la exigencia de "vigente": la revisión editorial sabe contra qué página y en qué fecha se verificó cada pregunta, y puede re-verificar las más antiguas.

## Decision 6: Reglas de contenido validadas por esquema

**Decision**: Por servicio con preguntas: exactamente 15 (5/5/5); respuesta única = 4 opciones y 1 correcta; "Elige 2" = 5 opciones, 2 correctas y el texto "(Elige 2)" en el enunciado; ≥ 2 "Elige 2" entre las Difíciles; la opción correcta de las preguntas de respuesta única ocupa al menos 3 posiciones distintas; ids únicos; `serviceId` existente; todas las opciones con explicación.

**Rationale**: Convierte FR-002, FR-004, FR-010, FR-012 y SC-003 en tests automáticos.

## Decision 7: Opciones en orden fijo

**Decision**: Las opciones se muestran en el orden del contenido (A–D o A–E), sin barajar.

**Rationale**: Hace los tests deterministas y permite que la explicación hable de "la opción B". FR-012 evita que la correcta sea siempre la misma letra.
