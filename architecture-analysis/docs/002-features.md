# Features

This document describes how **features** are structured and how to add or extend them safely.

A feature is a cohesive unit that owns a slice of product behavior and UI.

---

## What Is a Feature

A feature represents a user-facing capability, such as:

- authentication
- poems
- moderation
- users

A feature typically contains:

- pages (route-level UI)
- components (feature-scoped UI)
- hooks (feature-specific logic)
- use-cases (application-level actions)

---

## Responsibilities

A feature is responsible for:

- presenting UI for its domain
- coordinating local state and server interactions
- exposing hooks/use-cases for reuse inside the feature

A feature is **not** responsible for:

- global infrastructure (API setup, stores)
- shared UI primitives
- cross-feature coordination

Shared logic should move to `core/` or `components/`.

---

## Structure Convention

Typical structure:

```
features/
  poems/
    internal/
    pages/
    components/
    hooks/
    use-cases/
    index.ts
```

Not every folder is mandatory, but feature code must remain self-contained.

### Internal

`internal/` is for **shared code that is private to the feature**. It can be reused across
use-cases, pages, and components inside the same feature, but must not be imported by other
features.

---

## Dependency Rules

Features may depend on:

- `core/` (API, stores, events, shared hooks)
- `components/` (shared UI)
- `themes/`

Features must not:

- import from other features directly
- implement core infrastructure concerns

See:

- ADR-010 � No cross-feature calls
- ADR-014 � Mandatory feature folders

---

## Adding a New Feature

1. Create `src/features/<feature-name>/`.
2. Add pages/components/hooks as needed.
3. Expose a public API via `index.ts`.
4. Wire routes in the app entry (if needed).

Keep feature boundaries clear and avoid leaking internal details across features.
