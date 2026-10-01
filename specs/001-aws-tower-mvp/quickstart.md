# Quickstart Validation Guide

## Prerequisites

- Node.js 20 LTS or later
- npm
- A modern browser (latest Chrome, Firefox, Safari or Edge)

## Setup

```bash
npm install
```

## Local development

```bash
npm run dev
```

Open the local Vite preview URL and verify these flows:

1. The lobby renders with available and upcoming rooms.
2. Clicking an available room opens the compute room.
3. Service hotspots are visible and selectable in the room.
4. A service card opens with summary, use cases, exam concepts, comparison, traps, and cost note.
5. The user can return to the lobby using the persistent navigation action.
6. Keyboard navigation works with Tab, Enter, and Escape.
7. Text fallback mode exposes the same service and room information in a readable list.

## Validation commands

```bash
npm run test
npm run test:e2e
```

## Expected outcomes

- Domain tests pass for room/service selection and navigation state.
- Content validation confirms that JSON files are complete and correctly structured.
- Playwright verifies the main journey: lobby → room → service card → return.
- The app remains usable without a backend and without account creation.

## Accessibility checks

- Confirm that focus moves visibly through interactive elements.
- Confirm screen-reader text is available for the service list and room navigation.
- Verify that the user can complete the core learning loop without a pointer.
