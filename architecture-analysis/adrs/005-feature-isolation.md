# ADR-005: Feature Isolation Rules

## Status

Accepted at 2026-03-14

## Context

Features should evolve independently. Direct cross-feature imports create implicit coupling and
ripple effects.

## Decision

- Features must not import from other features directly.
- Shared logic must be moved to `core/` or `components/`.
- Any cross-feature dependency must be explicit and documented.

## Consequences

- Stronger feature boundaries.
- Easier parallel development.
- Reduced unintended side effects.
