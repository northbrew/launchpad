# Launchpad MVP

Internal MVP for ProofBridge Launchpad. This project is intentionally lean and keeps the original Launchpad product shape and language (`Launchpad`, `Library`, `Decisions`, `New Drop`, `James`, `Cory`).

## Scope (current MVP)

- James/Cory auth
- Launchpad shell
- Library with search, filters, and detail panel
- New Drop with file upload or URL submission
- Decisions with status, detail, and vote/take flows
- Supabase-backed data + seed data

Out of scope by design: notifications, comments, realtime, integrations, advanced permissions, and extra workspace features.

## Tech stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Auth, Postgres, Storage)

## 1) Local setup

From this folder:

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DEMO_USER_PASSWORD=launchpad-demo
```

## 2) Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql` (full file contents).
3. Confirm the `library-files` bucket exists (the schema creates it).

## 3) Seed demo data

Run:

```bash
npm run seed
```

This seeds:

- Auth users: `james@proofbridge.io`, `cory@proofbridge.io`
- Profile rows, tags, library items, decisions, and decision positions

## 4) Run app

```bash
npm run dev
```

Optional production check:

```bash
npm run build
```

Open [http://localhost:3000](http://localhost:3000), then sign in as:

- `james@proofbridge.io` / `launchpad-demo` (or your `DEMO_USER_PASSWORD`)
- `cory@proofbridge.io` / `launchpad-demo` (or your `DEMO_USER_PASSWORD`)

## 5) Quick flow check (end-to-end)

After login, verify:

1. Launchpad loads.
2. `New Drop` creates an item via file upload or URL.
3. Library search and filters narrow results.
4. Library detail panel opens an item.
5. Decisions list loads.
6. Opening a decision allows submitting a vote/take.

## Troubleshooting

- **Missing env error**: re-check `.env.local` values.
- **Seed fails on auth admin calls**: service role key is missing/incorrect.
- **Upload fails**: verify `library-files` storage bucket exists and schema policies were applied.

## Notes

- File uploads are stored in Supabase Storage bucket `library-files`.
- Library detail links open either the provided URL or uploaded storage file.
