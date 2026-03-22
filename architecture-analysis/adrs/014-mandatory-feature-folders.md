# ADR-014: Mandatory Feature Folders

## Status

Accepted at 2026-03-14

## Context

Inconsistent feature layouts make navigation and onboarding harder.

## Decision

- Features should use a consistent internal structure:
  - `pages/`, `components/`, `hooks/`, `use-cases/`, `index.ts`
- A feature may omit a folder if not needed, but structure should be respected.

## Consequences

- Faster navigation and onboarding.
- Lower cognitive overhead across features.
