# ADR-001: Feature-Based Structure

## Status

Accepted at 2026-03-14

## Context

The frontend needs a structure that scales with product growth while keeping UI and logic cohesive.
Organizing by technical layers alone makes ownership and change locality unclear.

## Decision

- All product code must belong to a **feature** or a **shared/core** module.
- Features own their pages, hooks, and UI.
- Shared infrastructure lives in `core/`, shared UI in `components/`, and design primitives in
  `themes/`.

## Consequences

- Feature boundaries become explicit.
- Cross-feature coupling is reduced.
- Shared logic is centralized and easier to maintain.
