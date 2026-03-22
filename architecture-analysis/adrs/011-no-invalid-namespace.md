# ADR-011: No Invalid Namespaces

## Status

Accepted at 2026-03-14

## Context

Uncontrolled import paths lead to brittle dependencies and unclear ownership.

## Decision

- All imports must use valid, approved namespaces.
- Invalid or ad-hoc aliases are not allowed.

## Consequences

- Consistent module boundaries.
- Easier refactoring and tooling support.
