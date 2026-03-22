# ADR-013: Directional Dependencies

## Status

Accepted at 2026-03-14

## Context

Without clear dependency direction, shared code can end up depending on product code, making reuse
impossible and coupling high.

## Decision

- Dependencies must flow **inward**:
  - `features -> core -> base/utils`
- Shared UI and theme layers must not depend on features.

## Consequences

- Shared layers remain reusable.
- Feature modules stay independent.
