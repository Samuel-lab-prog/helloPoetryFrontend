# ADR-012: Root Entry Points Only

## Status

Accepted at 2026-03-14

## Context

The `src/` root should remain minimal. Excess modules at the root reduce navigability and blur
ownership.

## Decision

- Only application entry points (`main.tsx`, `App.tsx`) and global setup files may live at the
  `src/` root.
- All other modules must live within features or core/shared folders.

## Consequences

- Cleaner project navigation.
- Clearer ownership boundaries.
