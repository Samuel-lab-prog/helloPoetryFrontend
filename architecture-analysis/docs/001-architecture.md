# Architecture Overview

This document describes how the frontend codebase is organized and how architectural decisions are
applied in practice.

It is intended as a **practical guide** for understanding, navigating, and extending the system.
Normative rules and enforcement details are documented in ADRs. This document focuses on _how to
work within those decisions_.

---

## Architectural Style

The frontend follows a **feature-first architecture**.

Instead of organizing everything by technical layers alone, the codebase is structured around
**product features** (e.g. auth, poems, moderation). Each feature encapsulates its UI, hooks, and
use-case logic, while shared concerns live in `core/`, `components/`, and `themes/`.

This approach prioritizes:

- explicit feature boundaries,
- reduced cross-feature coupling,
- localized change,
- and long-term maintainability.

See:

- ADR-001 � Feature-based structure
- ADR-005 � Feature isolation rules

---

## High-Level Structure

At a high level, the system is composed of:

- **Features**  
  Product-focused modules containing pages, hooks, and UI for a single area.

- **Core**  
  Cross-feature application services (API clients, stores, events, shared hooks).

- **Shared Components**  
  Reusable UI primitives and composition building blocks.

- **Themes**  
  Design tokens, recipes, and visual primitives.

Each of these has a clearly defined responsibility and a restricted dependency direction.

---

## Dependency Direction

Dependencies must follow a strict direction:

`features -> core -> base/utils`

- Features may depend on core and shared UI.
- Core may depend on base utilities and third-party libraries.
- Shared UI and themes must not depend on specific features.

Violations are detected and enforced automatically.

See:

- ADR-013 � Directional dependencies
- ADR-015 � Prohibition of circular dependencies

---

## Feature Boundaries

Features are treated as **architectural units**, not just folders.

Key principles:

- Avoid cross-feature imports unless explicitly routed through `core/`.
- Feature logic should stay within its own module.
- Shared functionality must live in `core/` or `components/`.

See:

- ADR-010 � No cross-feature calls
- ADR-014 � Mandatory feature folders

---

## Entry Points and Isolation

Entry points (e.g. `main.tsx`, `App.tsx`, routing setup) are considered volatile and must be kept
isolated from feature logic.

Business rules must not leak into:

- entry points,
- framework-specific wiring,
- or configuration bootstrap.

See:

- ADR-003 � Entry points exclusion

---

## Data Flow and State

The frontend follows a **predictable data flow**:

- API communication goes through `core/api`.
- Server state is managed via React Query.
- Client state is managed via lightweight stores (Zustand).
- Feature logic is exposed through hooks and use-cases.

See:

- ADR-004 � Change amplification thresholds
- ADR-006 � Use-case hooks tests

---

## Testing Philosophy

Testing is an architectural concern.

Key principles:

- Prefer unit tests for hooks, stores, and utilities.
- Use integration tests for complex UI flows.
- Keep test ownership close to the module it validates.

See:

- ADR-006 � Use-case hooks tests
- ADR-007 � Feature tests

---

## Automation and Enforcement

Architectural rules are **not advisory**. Where possible, they are:

- measurable,
- automated,
- and enforced through the CI pipeline.

If CI fails due to an architectural rule, the system is considered invalid.

See:

- ADR-016 � Linting rules
- ADR-017 � Mandatory code formatting
- ADR-018 � Reproducible builds
- ADR-019 � CI as a gatekeeper

---

## Architecture as a Living System

Architecture in this system is expected to evolve deliberately.

Changes to architectural rules must be:

- documented as ADRs,
- reviewed explicitly,
- and reflected in tooling when applicable.

Architectural metrics are treated as first-class signals to guide evolution, not as absolute
measures of quality.

See:

- ADR-020 � Architectural metrics
