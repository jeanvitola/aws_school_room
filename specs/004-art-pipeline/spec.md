# Feature Specification: Pipeline de arte propio

**Feature Branch**: `004-art-pipeline`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Acabo de agregar nuevo arte realizado por mí en `art/public/assets/sprites`." Se eligió el camino **mixto**: conversión automática como primer borrador, retoque manual en Aseprite y mayor resolución del juego.

## Clarifications

### Session 2026-10-01

- Q: ¿Cómo se integra el arte, que viene como ilustraciones grandes con fondo magenta? → A: Camino mixto: un script convierte cada pieza en un sprite transparente al tamaño del juego con una paleta común; el autor la retoca en Aseprite si hace falta.
- Q: ¿Se mantiene la resolución actual del juego? → A: No: se duplica la resolución interna para conservar más detalle del arte.
- Q: ¿Por dónde empezar? → A: Piloto con 3 piezas (estación de trabajo, ícono de Lambda y baldosa del piso); el autor aprueba el resultado antes de convertir el resto.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver el arte propio en la sala (Priority: P1)

El estudiante entra a la Sala de Máquinas y ve el piso, las estaciones y los íconos con el arte del autor en lugar de los dibujos provisionales, nítidos y sin bordes de color del fondo original.

**Why this priority**: Es el objetivo de la feature: que la sala se vea con el estilo propio del proyecto.

**Independent Test**: Abrir la sala y comprobar que las piezas convertidas se ven con transparencia correcta, sin restos del fondo magenta y alineadas con la grilla.

**Acceptance Scenarios**:

1. **Given** una pieza convertida, **When** se muestra en la sala, **Then** su fondo es transparente y no hay píxeles rosados en los bordes.
2. **Given** las piezas convertidas y las provisionales conviven, **When** se ve la sala, **Then** todas respetan la misma escala y se alinean con las baldosas.
3. **Given** el juego a la nueva resolución, **When** se usa la sala, **Then** el clic en las estaciones, la cámara y las fichas funcionan igual que antes.

---

### User Story 2 - Regenerar el arte cuando el autor lo cambia (Priority: P1)

El autor modifica o agrega una ilustración y, con un solo comando, obtiene los sprites listos para el juego y una paleta para retocar en Aseprite.

**Why this priority**: Sin un proceso repetible, cada cambio de arte exige trabajo manual y errores de tamaño.

**Independent Test**: Ejecutar el comando de conversión y verificar que produce los sprites del manifiesto con el tamaño y la transparencia correctos.

**Acceptance Scenarios**:

1. **Given** el manifiesto de piezas, **When** el autor ejecuta el comando, **Then** se generan los sprites declarados en su tamaño final y la paleta compartida.
2. **Given** un sprite convertido, **When** se regeneran los dibujos provisionales, **Then** el sprite convertido no se sobrescribe.

---

### User Story 3 - Animaciones del arte propio (Priority: P2)

Las estaciones y los íconos usan los cuadros de animación dibujados por el autor (pantalla que se enciende, brillo del ícono, luces del rack) en lugar de animaciones programadas.

**Why this priority**: Aporta dinamismo, pero depende de que la conversión de piezas fijas esté aprobada (US1).

**Independent Test**: Seleccionar una estación y comprobar que reproduce la animación correspondiente.

---

### Edge Cases

- Una pieza tiene brillos que se mezclan con el fondo magenta: el borde se limpia sin dejar halo rosado.
- Un ícono viene sobre un recuadro de color y con texto: solo se conserva el dibujo.
- Falta una pieza del manifiesto: el juego usa el dibujo provisional y la validación lo informa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Las piezas convertidas MUST tener fondo transparente y no MUST conservar píxeles del fondo magenta ni halos rosados.
- **FR-002**: Cada pieza MUST generarse en el tamaño declarado para el juego y con una paleta compartida de como máximo 32 colores.
- **FR-003**: La resolución interna del juego MUST duplicarse, manteniendo el mismo comportamiento de la sala (clics, cámara, fichas) y el mismo tamaño en pantalla.
- **FR-004**: Un manifiesto MUST declarar, por pieza: archivo de origen, zona a recortar, tamaño final y nombre del sprite.
- **FR-005**: Un único comando MUST convertir todas las piezas del manifiesto y exportar la paleta en un formato que Aseprite pueda abrir.
- **FR-006**: La generación de dibujos provisionales MUST omitir los sprites que ya provienen del arte del autor.
- **FR-007**: Una validación automática MUST comprobar que cada sprite que usa el juego existe, tiene transparencia y respeta su tamaño declarado.
- **FR-008**: El piloto MUST cubrir la estación de trabajo, el ícono de AWS Lambda y la baldosa del piso; el resto de las piezas se convierte solo tras la aprobación del autor.
- **FR-009**: Los créditos de los assets MUST atribuir el arte a su autor.

### Key Entities

- **Pieza de arte**: Ilustración del autor (o región de una lámina) que se convierte en un sprite.
- **Manifiesto**: Lista de piezas con origen, recorte, tamaño final y nombre.
- **Paleta**: Conjunto común de colores que comparten todos los sprites.

## Success Criteria *(mandatory)*

- **SC-001**: El autor aprueba el resultado visual del piloto antes de convertir el resto.
- **SC-002**: El 100% de los sprites del juego pasa la validación de tamaño y transparencia.
- **SC-003**: Las suites de tests existentes siguen pasando con la nueva resolución.
- **SC-004**: Regenerar todo el arte toma un solo comando y menos de 1 minuto.

## Assumptions

- Las ilustraciones originales se conservan como fuente en `art/` y no se publican en el sitio.
- La conversión automática es un borrador: el retoque fino lo hace el autor en Aseprite.
- La sala completa dibujada (CAPA 1) se usa como referencia visual, no como fondo, porque su distribución no coincide con las estaciones interactivas.
