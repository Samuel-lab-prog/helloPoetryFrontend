# ADR-003: Entry Points Exclusion

## Status

Accepted at 2026-03-14

## Context

Entry points (`main.tsx`, `App.tsx`, routing setup) are volatile and should not contain feature
logic. Mixing responsibilities makes changes risky.

## Decision

- Entry points are limited to composition and wiring.
- Feature logic must live inside features or core modules.
- Entry points should stay thin and declarative.

## Consequences

- Clear separation between bootstrapping and business/UI logic.
- Easier refactors when routing or providers change.
