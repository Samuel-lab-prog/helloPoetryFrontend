# ADR-007: Feature Tests

## Status

Accepted at 2026-03-14

## Context

Complex user flows are best validated at the feature level to protect critical behavior.

## Decision

- Use integration tests for feature flows with meaningful business impact.
- Keep tests focused on user-visible behavior rather than internal structure.

## Consequences

- Higher confidence in critical user paths.
- Reduced brittleness compared to snapshot-heavy approaches.
