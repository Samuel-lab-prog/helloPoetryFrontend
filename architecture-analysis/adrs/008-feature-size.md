# ADR-008: Feature Size Limits

## Status

Accepted at 2026-03-14

## Context

Oversized features become hard to reason about and slow to change.

## Decision

- Track feature size metrics (LOC, files).
- When a feature exceeds thresholds, split or refactor it.

## Consequences

- Balanced feature granularity.
- Better maintainability over time.
