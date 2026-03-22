# ADR-004: Change Amplification Thresholds

## Status

Accepted at 2026-03-14

## Context

Changes that regularly touch many files signal architectural fragility and excessive coupling.

## Decision

- Track change amplification metrics in CI.
- Investigate modules that consistently require high file churn for small changes.

## Consequences

- Hotspots are identified earlier.
- Encourages modular, localized change.
