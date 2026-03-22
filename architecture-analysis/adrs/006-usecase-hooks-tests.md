# ADR-006: Use-Case Hooks Tests

## Status

Accepted at 2026-03-14

## Context

Feature hooks and use-case helpers often contain the majority of frontend behavior. Unchecked, they
become a major source of regressions.

## Decision

- Non-trivial hooks and use-cases should have unit tests.
- Tests must be colocated with the module.

## Consequences

- Core logic remains stable across UI changes.
- Encourages small, deterministic logic units.
