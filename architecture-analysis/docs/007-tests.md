# Tests

This document defines the **testing strategy** adopted in the frontend and how tests relate to
architectural layers.

---

## Testing Principles

- Tests reflect ownership and boundaries.
- Each test validates only the behavior of its module.
- Coverage is a signal, not the goal.

---

## Recommended Test Targets

### Feature Hooks and Use-Cases

- Should be unit-tested when logic is non-trivial.
- Prefer small, deterministic tests.

### Stores

- Test store actions and selectors in isolation.

### UI Pages

- Favor integration tests for complex flows.
- Avoid snapshot-heavy testing.

---

## Location

Tests should live **next to the module they test**.

Example:

```
features/poems/hooks/usePoem.ts
features/poems/hooks/usePoem.test.ts
```

---

## Summary

- Keep tests close to ownership
- Prefer unit tests for logic
- Use integration tests for user flows
