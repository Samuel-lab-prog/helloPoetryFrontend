# ADR-002: Fan-Out Limits

## Status

Accepted at 2026-03-14

## Context

Modules with excessive outgoing dependencies become hard to understand and change safely. Fan-out is
a proxy for complexity and coupling.

## Decision

- Define acceptable fan-out thresholds for frontend modules.
- Flag modules that exceed thresholds as architectural risks.
- Prefer composition and delegation over adding new direct dependencies.

## Consequences

- Overly connected modules are surfaced early.
- Refactoring focuses on reducing coupling.
