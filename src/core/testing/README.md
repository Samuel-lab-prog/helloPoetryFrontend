# Testing Conventions

This folder contains shared test helpers. Feature tests should stay close to the module they
exercise, but hooks with non-trivial behavior should use a small `tests/` folder to keep scenarios,
fixtures, and expectations separate.

## Feature Hook Tests

Use this structure for behavior-heavy feature hooks:

```text
hooks/
  useExampleHook.ts
  tests/
    useExampleHook.test.tsx
    makeExampleHookScenario.ts
    fixtures.ts
```

File responsibilities:

- `useExampleHook.test.tsx`: behavior expectations only.
- `makeExampleHookScenario.ts`: fluent scenario builder, hook rendering, API mocks, auth setup,
  cache setup, and other side effects needed by the hook.
- `fixtures.ts`: stable sample data and small cache/key helpers.

Scenario builders should read like backend use-case scenarios:

```ts
const scenario = makeExampleHookScenario()
	.asAuthenticatedUser()
	.withCachedItems()
	.withDeleteFailure();
```

Guidelines:

- Prefer `make<HookName>Scenario()` for the builder name.
- Keep methods fluent by returning the same scenario object.
- Expose spies through `scenario.mocks` when tests need call assertions.
- Use `createTestQueryClient()` and `createQueryClientWrapper()` for React Query hooks.
- Use `setTestAuthClient()` and `clearTestAuthClient()` for auth-dependent hooks.
- Avoid `describe.concurrent` for hook tests because React Query, DOM state, and stores can share
  process-level state.

## Feature Component Tests

Use `renderWithProviders()` for component tests that need the app providers:

- React Query through a fresh test query client.
- Chakra UI and color mode through the shared app provider.
- React Router through a memory router.

Keep component scenario builders close to the component under test:

```text
components/
  ExampleComponent.tsx
  tests/
    ExampleComponent.test.tsx
    makeExampleComponentScenario.tsx
    fixtures.ts
```
