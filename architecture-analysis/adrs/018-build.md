# ADR-018: Reproducible and Deterministic Builds

## Status

Accepted at 2026-03-14

## Context

Frontend builds must be reliable across environments.

## Decision

- Build output should be deterministic given the same inputs.
- Dependency versions are locked.

## Consequences

- More reliable releases.
- Easier debugging of build issues.
