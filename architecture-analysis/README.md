# Frontend architecture analysis

- `src/checks/check-structure.mjs` validates the Hello Poetry source root, app composition folders
  and feature folder conventions.
- `src/checks/check-structure.test.mjs` covers valid and invalid source trees.
- `src/checks/module-boundaries.test.mjs` tests dependency-cruiser rule matching and exact legacy
  exception handling.
- `src/checks/legacy-core-feature-dependencies.json` lists exact preexisting `core/` to `features/`
  edges with their reasons.
- `../.dependency-cruiser.cjs` checks resolved imports and enforces app/core/feature boundaries,
  feature public contracts, route entry points and bootstrap-only adapter registration using
  `tsconfig.app.json` for alias resolution.
- `../../scripts/check-dependencies.mjs` rejects empty or incomplete graphs, applies the exact
  legacy list and fails on other error-severity findings.
- `docs/001-architecture.md` documents current responsibilities, enforced rules, legacy debt,
  exceptions and feature development procedure.
- `src/metrics/` remains informational; generated metrics are not architecture gates.

Run `bun run check:architecture` for structure, verifier tests and dependency graph checks. The
normal static pipeline runs it through `bun run check:static`.
