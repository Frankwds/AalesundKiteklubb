# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Ålesund Kiteklubb — a Next.js 16 + Supabase full-stack web app for a Norwegian kitesurfing club. Single project (not a monorepo). See `package.json` for available npm scripts.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| Next.js dev server | `pnpm dev` | 3000 |
| Local Supabase | `npx supabase start` | API: 54321, DB: 54322, Studio: 54323, Mailpit: 54324 |

### Running Supabase locally

Docker must be running before `npx supabase start`. The Docker socket must be accessible (`sudo chmod 666 /var/run/docker.sock` if needed after daemon restart). Supabase start pulls ~15 containers and takes ~60s on first run.

After Supabase starts, the `.env.local` file must exist with the local Supabase URL and keys. Use `npx supabase status -o env` to retrieve `ANON_KEY`, `SERVICE_ROLE_KEY`, and `API_URL`.

Migrations are applied automatically by `supabase start`. If you add new migrations, run `npx supabase db push --local` to apply them.

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in values. For local dev with Supabase:
- `NEXT_PUBLIC_SUPABASE_URL` → `http://127.0.0.1:54321`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → from `npx supabase status -o env`
- `SUPABASE_SERVICE_ROLE_KEY` → from `npx supabase status -o env`
- `RESEND_API_KEY` → any dummy value for local dev (emails won't send)
- `NEXT_PUBLIC_SITE_URL` → your local dev origin (e.g. port 3000)

### Key commands

- **Lint**: `pnpm lint` (ESLint 9, flat config)
- **Build**: `pnpm build`
- **Dev**: `pnpm dev`
- **No test framework** is configured — there are no automated tests.

### Gotchas

- The root layout (`src/app/layout.tsx`) calls `getCurrentUser()` on every request, which connects to Supabase. The dev server will fail to render pages if Supabase is unreachable or env vars are missing.
- `pnpm install` emits a warning about msw build scripts being ignored — this is expected due to `pnpm.onlyBuiltDependencies` in `package.json`.
- Auth uses Google OAuth only; local login flow redirects to Google. For local testing without real OAuth, use Supabase Studio (port 54323) to create test users directly.
