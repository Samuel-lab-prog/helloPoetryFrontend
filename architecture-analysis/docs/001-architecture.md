# Frontend architecture and governance

This guide documents the Hello Poetry frontend as it exists today and the rules enforced by the
local architecture checks. It does not require moving existing code to match another project.

## Current structure and responsibilities

The source tree uses `src/core/` for shared frontend infrastructure and `src/features/` for product
capabilities. Feature names and use-case directory names use kebab-case.

- `src/core/` owns shared API clients, components, events, pages, ports, query infrastructure,
  stores, themes, generic testing helpers and utilities. Core does not import feature
  implementations.
- `src/features/<feature>/` owns the UI and behavior for one product capability. Existing feature
  roots use `adapters/`, `internal/`, `public/` and `use-cases/` as needed. Adapters remain owned by
  the feature that implements the integration.
- `src/features/<feature>/use-cases/<flow>/` contains flow-specific pages and implementation. A
  `Page.tsx` file is common but is not required by the structure check.
- `src/features/<feature>/internal/` is private to that feature. Code may be shared inside the
  feature without becoming a cross-feature API.
- `src/features/<feature>/public/` is the feature's importable contract surface. Hello Poetry
  currently exposes modules within that tree directly; it does not require every feature to provide
  one `public/index.ts` barrel.
- `src/main.tsx` is the Vite entry and delegates to `src/app/bootstrap/mountApplication.tsx`.
  `src/app/` owns bootstrap, provider order, layouts, lazy routes and route prefetch. Core and
  feature code must not depend on app composition.
- `src/test-support/` owns test fixtures that intentionally exercise feature state across test
  suites. Production source files must not import from this directory; dependency-cruiser blocks
  those imports while allowing test modules and files under `tests/` to use the fixtures.
- `src/contracts/` is a permitted future root directory but does not currently exist. No
  contract-layer rules are claimed as implemented.

## Dependency rules

The resolved dependency graph is checked with dependency-cruiser using `tsconfig.app.json`, which
provides the TypeScript aliases. The checker requires a nonempty set of analyzed TypeScript source
modules and a complete summary whose reported violation counts match the violation list.

| Rule                                                        | Enforced behavior                                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `core-is-independent`                                       | `core/` must not import `app/` or `features/`.                                                                                                   |
| `cross-feature-*-uses-public`                               | A feature may import another feature only from its `public/` tree. Imports within the same feature remain private and unrestricted by this rule. |
| `features-do-not-import-app-composition`                    | Feature code may not import `src/app/`.                                                                                                          |
| `app-uses-feature-entrypoints`                              | App code may import feature `public/` APIs, use-case `Page.tsx` route entries, and feature adapters only.                                        |
| `only-bootstrap-imports-feature-adapters`                   | Feature adapters may be imported from `src/app/bootstrap/` only.                                                                                 |
| `test-support-is-private-to-tests`                          | Production modules cannot import `src/test-support/`; test files and files under `tests/` may use those fixtures.                                |
| `no-circular`                                               | Circular dependencies are reported at the existing warning severity.                                                                             |
| `no-orphans`                                                | Orphan modules are reported at the existing warning severity.                                                                                    |
| `not-to-unresolvable`, `no-non-package-json`, `not-to-spec` | Existing dependency-cruiser resolution, package declaration and test-import rules remain in effect.                                              |

The structure check allows `src/app/` folders `bootstrap/`, `layouts/`, `providers/` and `routes/`,
plus `src/app/App.tsx`. It allows these feature-level directories: `adapters/`, `internal/`,
`public/` and `use-cases/`. Feature and use-case directory names must use kebab-case. The check does
not impose file layouts inside feature folders, require every feature to contain every folder, or
require page files for use cases.

### Cross-feature contracts

Importing another feature's `public/` tree is allowed. Importing that feature's `internal/`,
`adapters/` or `use-cases/` is prohibited. A public module can be imported by path because the
current project has public modules that are not re-exported by a central index. Adding or changing
an export barrel is not required by this governance step.

The app layer may compose core modules, feature public APIs, lazy route page entries and feature
adapters during bootstrap. App modules cannot depend on arbitrary feature internals, and only
bootstrap may import feature adapters. Neither core nor features can depend on app modules.

### Session integration and composition

The `core-is-independent` rule is an error. The legacy-edge registry is currently empty; any new
`core/` to `features/` edge fails the gate. Exact exceptions, if ever needed, must be justified and
removed as soon as their corresponding import disappears.

`src/core/ports/authSession.ts` defines the narrow session integration used by the HTTP client and
event handlers: reading the current identity/cache scope, updating unread notification count, and
clearing the client. `src/features/auth/adapters/authSessionPort.ts` implements that contract using
the auth store and cache-scope rule. `src/app/bootstrap/registerApplicationDependencies.ts`
registers the adapters before listeners, and `mountApplication.tsx` invokes that setup before React
renders. The order follows the existing feature-owned port pattern used for poems, users and
friends. Registration replaces the current adapter on HMR; the existing event-listener guard avoids
duplicate subscriptions, including when startup is repeated.

`src/core/pages/Error.tsx` now owns generic error-page rendering and telemetry. The auth feature's
`AuthRouteErrorPage` and `routeErrorPresentation.ts` own authentication-specific 401/403/expired
session messages and recovery behavior; the feature wrapper injects those callbacks into the core
view. The copy, recovery navigation and `userLoggedOut` event remain covered by the auth feature's
route-error tests.

`src/app/providers/AppProviders.tsx` owns the existing provider sequence: TanStack Query, Chakra UI,
then the forced-dark color-mode provider. `src/app/layouts/AppLayout.tsx` owns the authenticated
navigation shell and moderation badge. `src/app/routes/router.tsx` owns the route table and lazy
page declarations; `routes/prefetch.ts` preserves route chunk and data prefetch behavior. The router
tests characterize all 18 existing route matches and an unmatched path.

`src/test-support/authClientStore.ts` contains the shared auth fixtures used by feature tests. The
test-support dependency rule permits tests while preventing production imports, so this testing
convenience does not create a runtime route around the feature boundary.

## Resolved dependency-cruiser warnings

The six warnings from the previous architecture baseline are resolved without changing their
configured severities. Four cycles disappeared after the shared UI imports were narrowed to leaf
modules and the auth public barrel was bypassed in the moderation action hook. Two verified
unreferenced files were removed: `features/feed/use-cases/home/utils/index.ts` had no static or
dynamic consumers, and `features/poems/use-cases/manage-poem/Page.tsx` was an unreferenced
placeholder that returned `null`. The current dependency graph reports no `no-circular` or
`no-orphans` findings.

The prior seven auth edges are eliminated. Dependency-cruiser reports zero `core-is-independent`
findings, zero circular dependencies and zero orphans; no severity was reduced.

## Validation and exceptions

- `bun run check:structure` checks the source tree.
- `bun run test:check-deps` tests the empty-graph guard, error handling and warning classification.
- `bun run test:architecture` tests positive and negative dependency policy examples and structure
  validation, including a nonzero result for invalid trees.
- `bun run check-deps` runs dependency-cruiser and applies the exact legacy-edge policy.
- `bun run check:architecture` runs all architecture-specific checks.
- `bun run check:static` includes lint, formatting, architecture checks and typecheck.

`bun run test:run` includes characterization tests for session refresh/401 behavior, per-user
comment cache scope, login notification counts, logout cleanup, route-error recovery, and repeated
listener registration.

Architecture exceptions are not general patterns. A new exception requires an exact source-target
edge, an explanation, a test that confirms the exception cannot authorize a neighboring edge, and a
documentation update. Remove the exception entry when the edge is removed.

## Adding a feature or use case

1. Add a kebab-case directory under `src/features/` for a new capability; keep the current product
   boundaries rather than splitting a feature for naming consistency.
2. Add a kebab-case directory under that feature's `use-cases/` for a new flow when appropriate.
3. Keep single-flow code within its use case. Use `internal/` only for code shared by multiple flows
   in the same feature.
4. Keep integrations in feature-owned `adapters/` unless there is a demonstrated cross-feature
   technical responsibility.
5. A feature may depend on `core/` and on another feature's `public/` modules. It must not import
   another feature's private implementation or `app/` composition.
6. For a new route, add a lazy `Page.tsx` entry in the owning feature use case, register it in
   `src/app/routes/router.tsx`, and characterize the route in `router.test.ts`. Put associated
   chunk/data prefetch behavior in `src/app/routes/prefetch.ts`.
7. Register feature adapters only in `src/app/bootstrap/registerApplicationDependencies.ts`, before
   global listeners and React rendering. Preserve the provider sequence in `AppProviders.tsx`.
8. Do not add a public module, barrel or abstraction solely for symmetry. Add a public contract when
   another feature or app composition has a real consumer.
9. Add or update positive and negative policy tests when changing a boundary, and update this guide
   to match what the checks actually enforce.

## Scope not adopted from AGias

Hello Poetry adopts `src/app/` because startup, providers, route declarations and navigation have
distinct responsibilities and testable dependency boundaries. It does not adopt `src/contracts/`,
`public/index.ts` as the only feature entry, only `internal/`, `public/` and `use-cases/` at a
feature root, API registry/OpenAPI drift checks, direct-fetch adapter policy, query-cache
invalidation rules or AGias-specific report/metric catalogs. Those policies lack a demonstrated
Hello Poetry need in this step.
