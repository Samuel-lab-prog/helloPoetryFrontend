# ADR-019: CI as a Gatekeeper

## Status

Accepted at 2026-03-14

## Context

Architecture rules and quality checks must be enforced consistently.

## Decision

- CI is the source of truth for architectural validity.
- A failing check blocks merge.

## Consequences

- Consistent enforcement of standards.
- Reduced manual review burden.
