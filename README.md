# ThereIsASiteForThat

Need a website to do X? Here's the best one.

Searchable directory for useful websites — curated matches first, AI-inferred fallback when the catalog misses.

## Docs

Product and engineering docs live in [`docs/`](./docs/README.md).

| Doc | Purpose |
|---|---|
| [01-prd.md](./docs/01-prd.md) | Product requirements (v1 scope) |
| [02-competitive-analysis.md](./docs/02-competitive-analysis.md) | TAAFT teardown + how we win |
| [03-architecture.md](./docs/03-architecture.md) | Stack, services, folder structure |
| [04-data-model.md](./docs/04-data-model.md) | Postgres schema, indexes, embeddings |
| [05-search-pipeline.md](./docs/05-search-pipeline.md) | Semantic search + RAG fallback |
| [06-ux-design.md](./docs/06-ux-design.md) | UX principles, pages, IA |
| [07-seo-strategy.md](./docs/07-seo-strategy.md) | Long-tail pages, URL design, content |
| [08-roadmap.md](./docs/08-roadmap.md) | Phased build plan |
| [09-decisions.md](./docs/09-decisions.md) | Open questions + recommended defaults |
| [10-setup.md](./docs/10-setup.md) | What you need to configure (Postgres, env, seed) |

**Reading order:** PRD → Competitive analysis → Architecture → Data model → Search → UX → SEO → Roadmap → Decisions → Setup

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Custom Postgres + pgvector
- Drizzle ORM
- Ollama embeddings + chat (`nomic-embed-text`, `llama3.2`)
- Vercel

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database + admin (Phase 2)

Full checklist: [`docs/10-setup.md`](./docs/10-setup.md)

```bash
cp .env.example .env.local
# fill DATABASE_URL + ADMIN_PASSWORD + ADMIN_SESSION_SECRET
# install Ollama + pull nomic-embed-text (and llama3.2)

npm run db:migrate
npm run db:seed
npm run ai:check
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
| `npm run db:embed` | Embed published sites via Ollama |
| `npm run ai:check` | Verify Ollama embeddings + chat |
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
docs/            # Product & engineering docs
```
