# ADR-009: Distance From Entry Points

## Status

Accepted at 2026-03-14

## Context

When feature logic leaks into entry points, the system becomes harder to evolve and test.

## Decision

- Measure proximity of feature code to entry points.
- Keep application logic away from `main.tsx` and routing composition.

## Consequences

- Entry points remain stable and low-risk.
- Feature logic remains isolated and testable.
