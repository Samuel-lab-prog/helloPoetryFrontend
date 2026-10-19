# ADR-003: Entry Points Exclusion

## Status

Accepted at 2026-03-14

## Context

The Vite entry (`main.tsx`) and application composition (bootstrap, routing and providers) are
volatile and should not contain feature business logic. Mixing responsibilities makes changes risky.

## Decision

- `main.tsx` delegates to the explicit composition layer in `src/app/`.
- App modules are limited to composition and wiring; feature business logic stays inside features.
- Feature logic must live inside features or core modules.
- Entry points should stay thin and declarative.

## Consequences

- Clear separation between bootstrapping and business/UI logic.
- Easier refactors when routing or providers change.
