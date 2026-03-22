# ADR-015: Prohibition of Circular Dependencies

## Status

Accepted at 2026-03-14

## Context

Circular dependencies obscure module boundaries and increase runtime risk.

## Decision

- Circular dependencies are forbidden.
- Violations are detected and enforced through tooling.

## Consequences

- More predictable module initialization.
- Cleaner dependency graphs.
