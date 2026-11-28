# AGENTS.md

Guides AI agents working in this repository.

## Project

Fanyi is a desktop app (Electron) for translating on-screen Chinese text to
English. It is a pnpm monorepo with two apps:

- `apps/fanyi` — Electron + React 19 + TypeScript + Vite.
  - `src/main` — Electron main process (window, IPC handlers, services).
  - `src/main/preload.ts` — `contextBridge` surface exposed as `window.api`.
  - `src/renderer` — React UI (shadcn "new-york" components, Tailwind 4).
  - `src/shared` — types and query helpers used by both main and renderer.
- `apps/python-ocr` — Python 3.11 OCR subprocess (`PaddleOCR` + `jieba`),
  managed with `uv` and packaged with PyInstaller into `fanyi_ocr`.

The Electron main process spawns the packaged OCR executable and talks to it
over extra stdio pipes (fds 3/4, logs on 5) using newline-delimited JSON.
Main-side commands go through `sendCommand` in `src/main/services/ocr.ts`;
the Python process replies through `write_and_send` in `app/ipc.py`.

## Toolchain

- Node 24.22.3 (pinned in `.nvmrc`), pnpm 10.33.0 (`packageManager`); prefer
  the repo's pinned pnpm locally.
- Python 3.11 (pinned in `apps/python-ocr/.python-version`) with `uv` (see
  `apps/python-ocr/pyproject.toml`).
- CI (`.github/workflows/main.yml`) reads both version files: `.nvmrc` for the
  app job and `apps/python-ocr/.python-version` for the python job.

## Commands

Run from the repository root unless noted. `pnpm check` is the one command
that validates a change; `pnpm fix` is the only one that rewrites files.

- `pnpm check` — run the full gate in CI order: `lint`, `format:check`,
  `build:app`, `test`. It never modifies files and must leave a clean tree;
  run it before reporting work done.
- `pnpm fix` — apply mechanical fixes (ESLint autofix + Prettier for `fanyi`,
  `ruff --fix` + `ruff format` for `python-ocr`). Re-run `pnpm check` after.
- `pnpm install` — install all workspaces.
- `pnpm dev` — build the OCR executable if needed, then start Electron + Vite.
- `pnpm build` — build the OCR executable and package the Electron app
  (electron-builder).
- `pnpm build:fanyi` — package the Electron app (`pnpm --filter fanyi build`).
- `pnpm build:ocr` — build the packaged OCR executable.
- `pnpm build:app` — type-check and bundle the app (`tsc && vite build`), no
  electron-builder packaging.
- `pnpm lint` — ESLint (`fanyi`, zero warnings) and `ruff check` (`python-ocr`).
- `pnpm format` — Prettier write (`fanyi`) and `ruff format` (`python-ocr`);
  prefer `pnpm fix` when fixing your changes.
- `pnpm format:check` — Prettier check (`fanyi`) and `ruff format --check`
  (`python-ocr`).
- `pnpm compile` — TypeScript typecheck (`tsc`) for `fanyi`.
- `pnpm test` — Vitest (`fanyi`) and pytest (`python-ocr`) together.
- `pnpm --filter fanyi test` — Vitest in watch mode; `test:ci` for one run.
- `uv sync` in `apps/python-ocr` — install/refresh Python dependencies.

CI (`.github/workflows/main.yml`) runs two jobs. `app` takes its Node version
from `.nvmrc`, installs pnpm from `packageManager` (10.33.0), installs `uv`
(required because `pnpm install` triggers `python-ocr`'s `uv sync --frozen`
lifecycle), then `lint`, `format:check`, `build:app`, `test:ci`. `python` takes
its version from `apps/python-ocr/.python-version` (3.11), runs
`uv sync --frozen`, then `ruff check`, `ruff format --check`, and `pytest`. CI
installs Node deps with `--frozen-lockfile`, so commit lockfile changes.

## Conventions — TypeScript / React

- Prettier: 2 spaces, single quotes, semicolons, `trailingComma: es5`, LF.
  Import order is enforced by `@ianvs/prettier-plugin-sort-imports`:
  relative imports first, then `@shared/*`, `@main/*`, `@renderer/*`.
  Tailwind classes are auto-sorted by the Tailwind Prettier plugin.
- Path aliases: `@main/*`, `@renderer/*`, `@shared/*` (defined in
  `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json`).
- ESLint forbids importing `renderer` from `main` and vice versa. Put anything
  both sides need in `src/shared` (types, zod schemas, shared query hooks).
- Add IPC end-to-end: handler in `src/main/ipc.ts`, typed wrapper on
  `window.api` in `src/main/preload.ts`, shared types in `src/shared/types/*`,
  and a React Query hook for the renderer.
- Data fetching uses TanStack Query with one hook per file under
  `src/renderer/features/<feature>/queries/` (`*.query.ts` / `*.mutation.ts`).
- Client state uses Zustand stores in `src/renderer/stores/useXStore.ts`.
  Hooks use the `*.hook.tsx` suffix; utilities use `*.util.ts`.
- UI primitives live in `src/renderer/components/ui` (shadcn); prefer them
  over new one-off components. Feature components live beside their feature.
- TypeScript is strict (`strict`, `noUnusedLocals`, `noUnusedParameters`).
  Avoid `any`; existing tests use it behind an eslint-disable comment.
- Unit tests are Vitest + Testing Library (`jsdom`), colocated as
  `*.test.ts` next to the source.

## Conventions — Python

- Ruff with 2-space indent, double quotes, LF (`apps/python-ocr/pyproject.toml`).
  Run `pnpm --filter python-ocr lint` and `format` after changes.
- TypedDict payloads live in `app/types.py`; keep IPC message shapes in sync
  with `src/shared/types/ocr.ts`.
- Package-internal imports are relative (`from .types import ...`).
- Tests live in `apps/python-ocr/tests/test_*.py` and use pytest.
- `apps/python-ocr/README.md` still mentions `easyocr`; the current engine is
  PaddleOCR — trust the code and `pyproject.toml` over that README.

## Commit strategy

- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
  messages and pull request titles.
- Format: `<type>(<optional scope>): <summary>`, e.g.
  `feat(dictionary): add bulk import` or `fix: handle empty OCR result`.
- Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`,
  `ci`, `chore`, `style`. Use a scope only when it clarifies the area
  (`dictionary`, `ocr`, `tabs`, `settings`, ...).
- Summary is imperative, lowercase, and short (about 72 characters or less).
  No trailing period.
- Mark breaking changes with `!` after the type/scope and explain them in the
  commit body or PR description.
- Reference issues/PRs with the existing `(#123)` suffix style when relevant,
  e.g. `fix: missing definitions (#72)`.
- Keep commits focused on a single logical change; do not mix unrelated
  refactors, formatting churn, or dependency bumps.
- PR titles must follow the same convention, since commits land on `main` via
  squash-style merges.

## Notes and gotchas

- Do not edit generated or ignored output: `dist`, `dist-electron`, `release`,
  `build`, `node_modules`, and the packaged `fanyi_ocr` executable.
- The OCR executable is platform-specific; rebuild it on the OS you target.
- The Python process is long-lived and spawned at app startup
  (`initPythonOcr`), so dictionary mutations that change lookup words must
  notify it via `sendCommand({ action: 'entry_change', ... })`.
- `apps/python-ocr`'s `build:conditional` script uses `findstr`, so it is
  Windows-oriented; on macOS/Linux build explicitly with
  `pnpm --filter python-ocr build`.
- Dev user data may be written under `apps/fanyi/data`; don't commit it.
- Avoid running `pnpm build` casually — it packages the app via
  electron-builder and is slow.

## Verification before finishing

1. `pnpm check` — run it before reporting work done. It must pass and leave a
   clean tree (`git status --porcelain` empty).
2. `pnpm fix` — run first when the change is mechanical (formatting/lint); it
   rewrites files, so re-run `pnpm check` afterwards.

State which checks you ran and their results. If a check could not run, say
why instead of claiming success.
