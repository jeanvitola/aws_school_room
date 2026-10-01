# Service Content Contract

## Purpose

This contract defines the structure of the JSON content that drives the room and service cards in the AWS Tower MVP. The content is intentionally decoupled from the visual scene and from the runtime rules.

## File contract

### rooms.json

```json
{
  "rooms": [
    {
      "id": "compute",
      "name": "Sala de Máquinas",
      "slug": "compute",
      "description": "Servicios de cómputo y escalado",
      "status": "available",
      "order": 1
    },
    {
      "id": "storage",
      "name": "Bodega",
      "slug": "storage",
      "description": "Almacenamiento de objetos, bloques y archivos",
      "status": "upcoming",
      "order": 2
    }
  ],
  "version": "1.0.0",
  "lastReviewed": "2026-09-30"
}
```

### services.json

```json
{
  "services": [
    {
      "id": "ec2",
      "name": "EC2",
      "roomId": "compute",
      "summary": "Máquinas virtuales bajo tu control.",
      "useCases": ["Aplicaciones con requisitos de control del sistema operativo", "Sistemas legacy o de larga duración"],
      "examConcepts": ["Tipos de instancia", "AMI", "Volúmenes EBS", "Security Groups"],
      "compareWith": [
        { "target": "lambda", "difference": "Lambda para cargas cortas (≤15 min) y por eventos sin gestionar servidores; EC2 para procesos largos o control total del SO." }
      ],
      "examTraps": ["No usar EC2 cuando la carga es bursty y serverless es más eficiente"],
      "costNote": "Pago por capacidad reservada o bajo demanda, según el modelo elegido.",
      "tags": ["compute", "virtual-machine"]
    }
  ]
}
```

## Validation requirements

- All JSON files must parse successfully.
- Each service must reference an existing room.
- Required fields must be present and non-empty.
- Readability (≈2 minutes): `summary` ≤ 50 words; the full card (all text fields) ≤ 350 words.
- Room–service membership is defined only by `Service.roomId`.
- Each `compareWith.target` must be either an existing service id or a non-empty AWS service name; `difference` must be non-empty.
- Scene positions and sprites are NOT part of this content contract; they live in `src/scene/layouts/` keyed by service id.
- Rooms with `status: "upcoming"` must have no services referencing them.
- Content must be reviewed against the SAA-C03 guidance before release.
- Any content change must be accompanied by a version bump and editorial review note.

## Consumer expectations

The app must treat content files as the source of truth for room and service descriptions. Rendering logic must not hardcode service text or room definitions into the Phaser scene or UI components.
