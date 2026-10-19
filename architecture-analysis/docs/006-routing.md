# Application composition and routing

The application composition layer lives in `src/app/`. It connects the shared core with feature
public APIs, route page entries, and feature-owned adapters. The root `src/main.tsx` only invokes
the mounting entry point.

## Responsibilities

- `src/app/bootstrap/mountApplication.tsx` registers dependencies, then renders under React Strict
  Mode and the global providers.
- `src/app/bootstrap/registerApplicationDependencies.ts` registers feature adapters in a stable
  sequence and initializes the core event listeners after those ports are available.
- `src/app/providers/AppProviders.tsx` owns provider nesting. The current order is TanStack Query,
  Chakra UI, then the forced-dark color-mode provider.
- `src/app/App.tsx` mounts the router and global toaster.
- `src/app/routes/router.tsx` declares paths, error boundary, and lazy route components.
- `src/app/routes/lazyPage.tsx` pairs each lazy page with the shared page-loading fallback.
- `src/app/routes/prefetch.ts` owns route-chunk and route-data prefetch decisions.
- `src/app/layouts/AppLayout.tsx` owns the navigation shell, profile information, unread count and
  moderation badge.
- `src/app/layouts/PageLoader.tsx` provides the existing Suspense loading state.

## Dependency direction

- App may depend on core.
- App may import feature `public/` APIs and use-case `Page.tsx` entries for composition.
- Only app bootstrap may import feature-owned `adapters/` to register implementations of core ports.
- App must not import feature implementation details outside those entry points.
- Core and features must not depend on app. Features may use core and another feature's public API,
  while cross-feature implementation imports remain blocked.

These boundaries are enforced by dependency-cruiser and covered by positive/negative cases in
`architecture-analysis/src/checks/module-boundaries.test.mjs`. The structure verifier constrains app
folders to `bootstrap/`, `layouts/`, `providers/` and `routes/`.

## Adding a route

1. Add or reuse a `Page.tsx` in the owning feature use case.
2. Add a lazy import and route entry to `src/app/routes/router.tsx`. Preserve existing path shapes
   and parameter names unless product requirements explicitly change them.
3. Add a route matching case to `router.test.ts` for the new path and representative parameters.
4. Add route chunk or data prefetch to `routes/prefetch.ts` only when it is needed and keep the
   existing idle scheduling and user-scoped deduplication behavior.
5. Run architecture checks, router tests, the frontend test suite, typecheck and production build.

## Integrating an adapter

Implement the adapter inside the feature that owns the behavior. Register it in
`registerApplicationDependencies.ts` after importing its core port registration function. Register
all ports before `registerEventListeners(queryClient)` and before React rendering. The listener
registration function guards repeated startup/HMR registration; do not add a second listener path.

## Behavior-preservation notes

The composition extraction preserves the existing route paths, lazy imports, suspense fallback,
prefetch scheduling, current provider order, forced-dark theme, auth-aware navigation, and adapter
registration order. The route tests verify matching for all 18 current route entries. Runtime E2E
navigation and authentication still require a running API environment and are validated separately
when such an environment is available.
