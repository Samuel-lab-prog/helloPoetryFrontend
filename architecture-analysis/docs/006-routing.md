# Routing and Entry Points

This document describes how routing and entry points are structured.

---

## Entry Points

The application entry points are:

- `src/main.tsx`
- `src/App.tsx`

These files should only:

- bootstrap providers
- configure routing
- wire top-level layout

They must not contain feature logic.

---

## Routing

Routes are defined centrally but point to feature-owned pages.

Rules:

- feature pages live inside `features/<feature>/pages`
- routing should compose pages, not implement logic

---

## Lazy Loading

When appropriate, feature pages should be lazy-loaded to reduce initial bundle size. The routing
layer is responsible for wiring lazy imports.

---

## Summary

Entry points are **composition roots**. Keep them thin and declarative.
