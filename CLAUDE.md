# CLAUDE.md — Launchpad MVP guardrails

## What this repo is
Internal MVP for ProofBridge Launchpad. Two users only (James and Cory). Intentionally lean.

## Stack
Next.js 14 App Router · TypeScript · Tailwind · Supabase Auth/Postgres/Storage

## Hard rules
- Do not push to GitHub
- Do not rename product language: Launchpad, Library, Decisions, New Drop, James, Cory
- Do not rewrite architecture or add new frameworks
- Keep edits minimal and practical
- Preserve existing Supabase schema — all migrations must be backward-compatible with schema.sql and seed.mjs
- Do not add dependencies without a clear reason

## Auth
- Two demo users only: james@proofbridge.io and cory@proofbridge.io
- Auth is Supabase password login via signInAs server action
- Session refresh happens in middleware.ts — do not remove it
- requireCurrentUser() in lib/data/queries.ts is the single auth gate for all (app) routes

## Supabase
- Schema source of truth: supabase/schema.sql
- Seed source of truth: scripts/seed.mjs
- Admin client (lib/supabase/admin.ts) is for server-only use — never expose service role key client-side
- Storage bucket: library-files (public)
- All column names use snake_case in DB; TypeScript types use camelCase — the mappers in queries.ts bridge them

## Env vars
All four vars must be present in .env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- DEMO_USER_PASSWORD (default: launchpad-demo)

The seed script loads .env.local automatically via `node --env-file=.env.local`.

## Known hardcoded two-user assumptions
These are intentional and should not be abstracted until a third user is actually needed:
- UserSlug type: "james" | "cory"
- color_token DB check constraint: ('james', 'cory')
- Tailwind tokens: --james, --cory
- Login card: two hardcoded LoginButton entries

## Next.js version note
- Pinned to Next.js 14.2.28 — do NOT move `serverActions.bodySizeLimit` out of `experimental`. Top-level `serverActions` config is Next.js 15+ only. Keep it under `experimental.serverActions.bodySizeLimit`.

## Known non-functional UI elements (do not fix without a task)
- Sidebar "Docs" and "Settings" items are visual placeholders — no routes behind them
- Focus items are now DB-backed (focus_items table). Roadmap phases remain static in lib/data/constants.ts.

## What to check before any edit
1. Does it touch auth? → Verify requireCurrentUser() and middleware still work
2. Does it touch the DB? → Check schema.sql and confirm column names match
3. Does it touch file upload? → Confirm library-files bucket and 10mb body limit are intact
4. Does it add a dependency? → Confirm it is actually needed and not already solved in the codebase
