# ADR-012: Keep Source Root Limited to Entry Points

## Status

Accepted at 2026-03-14

## Context

The `src/` root should remain minimal. Excess modules at the root reduce navigability and blur
ownership.

## Decision

- Only the Vite entry (`main.tsx`), global declarations (`vite-env.d.ts`) and explicitly approved
  global setup files may live at the `src/` root.
- The application shell lives in `src/app/`, not at the source root.
- All other modules must live within features or core/shared folders.

## Consequences

- Cleaner project navigation.
- Clearer ownership boundaries.
