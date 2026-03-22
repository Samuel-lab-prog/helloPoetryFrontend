# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) that document key architectural
decisions, their rationale, and their enforcement strategy.

These decisions are not merely descriptive: whenever possible, they are designed to be **measurable,
automatable, and enforced through CI tooling**. Together, they define the architectural boundaries,
constraints, and quality signals of the frontend system.

## Index

- [ADR-001 � Feature-based structure](001-feature-structure.md)
- [ADR-002 � Fan-out limits](002-fanout-limits.md)
- [ADR-003 � Entry points exclusion](003-entry-points.md)
- [ADR-004 � Change amplification thresholds](004-change-amplification.md)
- [ADR-005 � Feature isolation rules](005-feature-isolation.md)
- [ADR-006 � Use-case hooks tests](006-usecase-hooks-tests.md)
- [ADR-007 � Feature tests](007-feature-tests.md)
- [ADR-008 � Feature size limits](008-feature-size.md)
- [ADR-009 � Distance from entry points](009-entry-distance.md)
- [ADR-010 � No cross-feature calls](010-no-cross-feature-calls.md)
- [ADR-011 � No invalid namespaces](011-no-invalid-namespace.md)
- [ADR-012 � Root entry points only](012-only-entrypoints-at-root.md)
- [ADR-013 � Directional dependencies](013-directional-deps.md)
- [ADR-014 � Mandatory feature folders](014-mandatory-feature-folders.md)
- [ADR-015 � Prohibition of circular dependencies](015-circular-deps.md)
- [ADR-016 � Linting rules](016-linting.md)
- [ADR-017 � Mandatory code formatting](017-formatting.md)
- [ADR-018 � Reproducible and deterministic builds](018-build.md)
- [ADR-019 � CI as a gatekeeper](019-ci-as-gatekeeper.md)
- [ADR-020 � Architectural metrics](020-arch-metrics.md)
