# ThereIsASiteForThat

Need a website to do X? Here's the best one.

Searchable directory for useful websites — curated matches first, AI-inferred fallback when the catalog misses.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase Postgres + pgvector
- Drizzle ORM
- OpenAI embeddings (wired in a later phase)
- Vercel

Product docs live in [`fdocs/`](./fdocs/README.md).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database (when ready)

1. Create a Supabase project.
2. Run `drizzle/0000_extensions.sql` in the SQL editor (`vector`, `pg_trgm`).
3. Set `DATABASE_URL` in `.env.local`.
4. Generate/apply migrations:

```bash
npm run db:generate
npm run db:migrate
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Drizzle Studio |

## Project layout

```
src/
  app/           # Routes + API handlers
  components/    # Shared UI
  features/      # Feature UI (search, …)
  lib/
    db/          # Drizzle client + schema
    repositories/
    services/
    validators/
    utils/
fdocs/           # Product & engineering docs
```
