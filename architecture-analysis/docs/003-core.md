# Core Layer

This document explains the role of the **core** layer and how to work within it.

The core layer contains cross-feature application services and shared infrastructure that should not
live inside any single feature.

---

## What Belongs in Core

Core contains:

- API clients and HTTP utilities (`core/api`)
- global stores (`core/stores`)
- application events (`core/events`)
- shared hooks (`core/hooks`)
- base UI and utility modules (`core/base`)

---

## What Core Must Not Contain

Core must not:

- include feature-specific UI or flows
- depend on feature modules
- contain route-level pages

If code is product-specific, it belongs in a feature.

---

## Dependency Direction

Core may depend on:

- external libraries
- base/shared utilities

Core must not depend on:

- feature modules

This keeps feature modules independent and prevents inversion of ownership.

See:

- ADR-013 � Directional dependencies
- ADR-005 � Feature isolation rules

---

## Base vs Core

`core/base` is intended for low-level building blocks (base components, small utilities) that are
reused widely. It should remain stable and free of product logic.

If a module is broadly useful across features, it belongs in `core/base`.
