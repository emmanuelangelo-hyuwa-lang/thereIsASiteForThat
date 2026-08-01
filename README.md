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

### Database + admin (Phase 2)

Full checklist: [`fdocs/10-setup.md`](./fdocs/10-setup.md)

```bash
cp .env.example .env.local
# fill Supabase + OpenAI + ADMIN_EMAILS

npm run db:migrate
npm run db:seed
npm run db:embed
```

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema without migration files |
| `npm run db:seed` | Seed categories, sites, collections |
| `npm run db:embed` | Embed published sites missing vectors |
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
