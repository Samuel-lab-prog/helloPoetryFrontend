# ADR-010: No Cross-Feature Calls

## Status

Accepted at 2026-03-14

## Context

Direct calls between features create implicit dependencies and complicate ownership boundaries.

## Decision

- Features must not import or call other features directly.
- Shared behavior must be promoted to `core/`.

## Consequences

- Clear dependency direction.
- Reduced coupling between feature teams.
