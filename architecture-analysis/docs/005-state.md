# State and Data Flow

This document explains how client state and server state are managed.

---

## Server State

Server data is managed via **React Query**:

- fetching and caching live in `core/api` + feature hooks
- mutations are defined in feature use-cases
- invalidation is scoped to the owning feature

---

## Client State

Client-only state uses **Zustand** stores in `core/stores`.

Rules:

- keep store shape minimal
- avoid duplicating server state
- expose selectors and hooks

---

## Data Ownership

- Features own their local state and UI behavior.
- Core owns global state shared across features.

---

## Side Effects

Side effects should be contained within:

- React Query mutations
- explicit feature hooks

Avoid implicit side effects inside components.

---

## Summary

- React Query for server state
- Zustand for client state
- Keep ownership close to features
