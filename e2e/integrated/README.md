# Integrated E2E

The integrated Playwright profile exercises the real frontend and backend against a disposable
PostgreSQL instance. It is separate from the existing frontend E2E profile, whose API responses are
mocked.

## Prerequisites

- Windows PowerShell, Bun, Node.js (used by Prisma CLI), Docker Desktop with Compose, and the
  Playwright Chromium browser.
- The frontend and backend repositories must remain adjacent (`frontend/` beside `backend/`).
- Local ports `4174`, `5101`, and `55432` must be available.
- The generated Prisma client must already exist. The integrated runner does not generate it.

## Run

From the frontend repository:

```powershell
bun run test:e2e:integrated
```

The runner prints the database target and operations, then requires the exact phrase
`START ISOLATED E2E`. It starts only a uniquely named Compose project, applies migrations to its
test database, prepares disposable E2E accounts, runs the integrated Playwright profile, and stops
that project. Declining the prompt exits before starting Docker or touching a database.

The PostgreSQL data directory is configured as a container `tmpfs`, the only published database
address is `127.0.0.1:55432`, and Compose declares no named or bind volume. Because the PostgreSQL
image declares `VOLUME` at the data path, the runner inspects the created container and refuses to
run migrations unless Docker reports the data path as `tmpfs`. Cleanup is scoped to the unique
Compose project, runs `down --remove-orphans --volumes`, then checks project-labeled containers,
networks, and volumes as well as image-declared volumes captured from the container before removal.
No global prune command is used. If cleanup cannot prove that resources are gone, the runner reports
that independently and exits unsuccessfully (while retaining the original test failure code).

The frontend build and Playwright results are written under a unique directory in the OS temporary
directory, not `frontend/dist` or the existing `frontend/test-results`. Existing paths are never
overwritten. Failure traces and result files are retained there for inspection after the run; remove
that exact run directory manually only after reviewing any needed diagnostics. These local artifacts
are outside the repositories and are not included in commits.

The frontend API URL and backend database URL are explicitly set by the integrated profile; they do
not inherit the frontend development API URL or backend development database URL. Existing security
checks remain enabled, including database-name validation, cookie auth, CORS, and CSRF.

No seed, reset, drop, or `ClearDatabase` operation is run. Three fixed test-only accounts (two
authors and one moderator) are prepared idempotently in the isolated E2E database. The integrated
profile covers the authenticated poem journey, public registration, and logout. Registration obtains
a CSRF token from the public `GET /auth/csrf` bootstrap endpoint before any avatar upload or account
creation request. CSRF remains enabled: unsafe requests still require the allowed Origin and a
matching `csrf_token` cookie and `x-csrf-token` header. The registration scenario also verifies
missing/mismatched-token rejection, duplicate email/nickname handling, and that registration does
not create an authenticated session. The logout scenario verifies browser cookie expiration, local
authentication cleanup, blocked authenticated navigation, and refresh rejection after obtaining a
new CSRF token. This proves browser-session closure; it does not prove revocation of copied JWTs.
Published poems from regular authors enter moderation, so the moderator fixture approves the poem
before the second author reads it. Compose cleanup uses only this run's unique project name and
never deletes a host database or persistent data volume.

Run the Docker-mocked cleanup tests without starting Docker using `bun run test:e2e:cleanup`. This
command is intentionally not part of CI. Each integrated run shows the disposable database target
and requires explicit authorization before starting PostgreSQL and applying migrations.

The discovery scenario creates disposable poems through the authenticated API, then checks the
public home and search interface against the real API. It covers title and tag filters, OR matching
across multiple tags, combined title/tag filtering, supported sort orders, the 20-item page
boundary, URL restoration after reload, clicking a poem tag, and the unfiltered recent feed. It also
asserts that private, friends-only, unlisted, pending, and rejected poems do not appear in either
the feed response or filtered search response. The scenario creates 22 pagination poems, two
tag-matching poems, and visibility fixtures in the isolated database; Compose cleanup removes that
database after the run.
