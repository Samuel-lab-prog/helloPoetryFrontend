# HelloPoetry Frontend

This repository contains the **frontend application** of a poetry sharing platform. It is
responsible for the user interface, client-side routing, form handling, animations, and data
consumption from the backend API.

The project follows a **feature-first architecture** focused on performance, scalability, type
safety, and developer experience.

---

## Tech Stack

- **TypeScript** main programming language
- **React** component-based UI library
- **Vite** fast bundler and dev server

---

## Main Dependencies

- **React Router DOM** client-side routing
- **React Hook Form** form state management
- **TanStack React Query** server state management
- **Zod** schema validation
- **Framer Motion** animations
- **React Markdown** Markdown rendering
- **Chakra UI** UI components and theming
- **Zustand** client state management

---

## Architecture Documentation

Practical guides:

- [Architecture overview](architecture-analysis/docs/001-architecture.md)
- [Features](architecture-analysis/docs/002-features.md)
- [Core layer](architecture-analysis/docs/003-core.md)
- [API layer](architecture-analysis/docs/004-api.md)
- [State and data flow](architecture-analysis/docs/005-state.md)
- [Routing and entry points](architecture-analysis/docs/006-routing.md)
- [Tests](architecture-analysis/docs/007-tests.md)

ADRs (decisions and enforcement):

- [ADR index](architecture-analysis/adrs/READEME.md)

---

## Project Structure (Overview)

The project follows a **feature-based architecture** for better scalability and separation of
concerns.

```text
src/
  features/              # Feature modules (auth, poems, moderation...)
  core/                  # Shared infrastructure (api, stores, events)
  components/            # Shared UI components
  themes/                # Design tokens and recipes
  App.tsx                # App shell
  main.tsx               # Entry point
```

---

## How to Run Locally

1. Install dependencies:

```bash
bun install
```

2. Run the dev server:

```bash
bun run dev
```

---

## Code Quality & Best Practices

- Strong typing with TypeScript
- Feature-based folder organization
- Clear separation between UI, logic, and data layers
- Controlled side effects with React Query and custom hooks
- Predictable state management and data flow

---

## Commit Message Guidelines

This repository follows **Conventional Commits**.

Commit prefixes:

- `feat:` new features
- `fix:` bug fixes
- `refactor:` refactoring without behavior change
- `docs:` documentation updates
- `style:` formatting or stylistic changes
- `test:` tests
- `chore:` tooling or maintenance tasks

Example:

```
fix: resolve login issue on Safari
```

---

## Notes

- This repository contains **only the frontend** of the application.
- The backend is maintained in a **separate repository**.
- Contributions, suggestions, and improvements are welcome.
