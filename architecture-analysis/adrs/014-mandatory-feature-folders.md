# ADR-014: Mandatory Feature Folders

## Status

Accepted at 2026-03-14

## Context

Inconsistent feature layouts make navigation and onboarding harder.

## Decision

- Features may only contain these first-level folders:
  - `api/`, `public/`, `use-cases/`
- Any other folders or files at the feature root are violations.

## Consequences

- Faster navigation and onboarding.
- Lower cognitive overhead across features.
