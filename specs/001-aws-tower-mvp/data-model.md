# Data Model: Torre AWS MVP

## Entity: Room

**Purpose**: Represents a learning area inside the tower, with a specific AWS family focus.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Stable room identifier | Required, unique |
| name | string | Human-readable room name | Required |
| slug | string | URL-safe identifier for access logic | Required, unique |
| description | string | Introductory explanatory text | Required |
| status | enum | available or upcoming | Required |
| order | number | Display order in the lobby | Required |

**Relationships**: A room contains multiple services (derived from `Service.roomId`; not stored twice) and is selectable from the lobby.

## Entity: Service

**Purpose**: Represents an AWS service in the room and its exam-focused metadata.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Stable service identifier | Required, unique |
| name | string | AWS service name | Required |
| roomId | string | Parent room identifier | Required |
| summary | string | 1-2 sentence plain-language explanation | Required, ≤ 50 words |
| useCases | string[] | Typical scenarios for use | Required |
| examConcepts | string[] | Key SAA-C03 concepts, one concept per item | Required, ≥1 item |
| compareWith | { target: string; difference: string }[] | Alternatives: `target` is a service id from the catalog or an AWS service name; `difference` explains when to prefer one over the other | Required, ≥1 item |
| examTraps | string[] | Common mistakes or misleading clues | Required |
| costNote | string | Cost signal or pricing guidance | Required |
| tags | string[] | Search or grouping tags | Optional |

**Relationships**: A service belongs to exactly one room and may be selected from the room scene or keyboard list.

## Entity: ContentCatalog

**Purpose**: Aggregate structure for loading all room and service definitions from JSON content files.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| rooms | Room[] | Structured room definitions | Required |
| services | Service[] | Structured service definitions | Required |
| version | string | Human-readable content version | Required |
| lastReviewed | string | ISO date of editorial review | Required |

**Relationships**: The content catalog is the canonical source for room and service definitions consumed by the domain layer and UI.

## Validation Rules

- Room and service IDs must be stable and unique.
- Each service must belong to an existing room.
- A room marked as upcoming must not expose active service interaction.
- Every service must include at least one use case, one exam concept, one comparison, one exam trap, and one cost note.
- Each service card must stay readable in under 2 minutes: summary ≤ 50 words and the full card ≤ 350 words.
- Content files must be valid JSON and must pass schema validation before being used in the app.

## State Transitions

- Lobby view: user enters app and sees room list.
- Room view: user selects an available room and enters the scene.
- Service detail: user selects a service and opens the card.
- Return: user navigates back to the room view (closing the card) or to the lobby from any point.
