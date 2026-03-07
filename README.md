# HelloPoetry — Frontend

This repository contains the **frontend application** of a poetry sharing
platform.  
It is responsible for the user interface, client-side routing, form handling,
animations, and data consumption from the backend API.

The project was built with a strong focus on **performance**, **scalability**,
**type safety**, and **developer experience**, following modern best practices
from the React ecosystem.

---

## Tech Stack

- **TypeScript** — main programming language, ensuring type safety and better DX
- **React** — JavaScript library for building component-based user interfaces
- **Vite** — fast bundler and development server

---

## Main Dependencies

- **React Router DOM** — client-side routing and page navigation
- **React Hook Form** — efficient and scalable form state management
- **TanStack React Query** — data fetching, caching, and server state management
- **Zod** — schema validation with strong TypeScript integration
- **Framer Motion** — animations and transitions
- **React Markdown** — rendering Markdown content as HTML
- **Chakra UI** — accessible, responsive, and composable UI components

---

## Project Structure (Overview)

The project follows a **feature-based architecture**, aiming for better
scalability and separation of concerns.

## How to Run Locally

### 1.Clone the repository

```
git clone https://github.com/yourusername/helloPoetryFrontend.git
cd helloPoetryFrontend
```

### 2.Install dependencies

```
bun install
```

### 3.Run the local development server

```
bun run dev
```

## Code Quality & Best Practices

This project adopts several conventions and patterns to keep the codebase
**clean, maintainable, and easy to scale**.

### General Practices

- Strong typing with TypeScript
- Reusable and composable components
- Feature-based folder organization
- Clear separation between UI, logic, and data layers
- Controlled side effects using React Query and custom hooks
- Predictable state management and data flow
- Consistent naming conventions across the codebase

---

## Commit Message Guidelines

This repository follows a **conventional commit pattern** to maintain a clean,
readable, and meaningful commit history.

### 🔹 Commit Prefixes

Use a prefix for every commit:

- `feat:` — new features
- `fix:` — bug fixes
- `refactor:` — code restructuring without changing behavior
- `docs:` — documentation updates
- `style:` — formatting or stylistic changes (no logic impact)
- `test:` — adding or updating tests
- `chore:` — tooling, configuration, or maintenance tasks

### 🔹 Commit Rules

1. **One purpose per commit**  
   Each commit should solve a single, well-defined problem.

2. **Keep commits small and focused**  
   Avoid large commits that mix unrelated changes.  
   Prefer multiple small commits over one large commit.

3. **Write meaningful commit messages**

   **❌ Bad** fix stuff **✅ Good** fix: resolve issue with user login on Safari

---

## Notes

- This repository contains **only the frontend** of the application.
- The backend is maintained in a **separate repository**.
- Contributions, suggestions, and improvements are welcome.

---
