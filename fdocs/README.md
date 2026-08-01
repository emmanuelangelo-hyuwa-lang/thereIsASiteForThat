# ThereIsASiteForThat — Docs Index

Product and engineering docs for **ThereIsASiteForThat.com**.

> Tagline: *Need a website to do X? Here's the best one.*

## Docs

| Doc | Purpose |
|---|---|
| [01-prd.md](./01-prd.md) | Product requirements (v1 scope) |
| [02-competitive-analysis.md](./02-competitive-analysis.md) | TAAFT teardown + how we win |
| [03-architecture.md](./03-architecture.md) | Stack, services, folder structure |
| [04-data-model.md](./04-data-model.md) | Postgres schema, indexes, embeddings |
| [05-search-pipeline.md](./05-search-pipeline.md) | Semantic search + RAG fallback |
| [06-ux-design.md](./06-ux-design.md) | UX principles, pages, IA |
| [07-seo-strategy.md](./07-seo-strategy.md) | Long-tail pages, URL design, content |
| [08-roadmap.md](./08-roadmap.md) | Phased build plan |
| [09-decisions.md](./09-decisions.md) | Open questions + recommended defaults |

## Product in one sentence

A searchable directory where users describe a task in plain language and get the best matching website(s) — curated first, AI-inferred when the catalog has no confident match.

## Stack (v1)

Next.js · Supabase (Postgres + pgvector) · Drizzle ORM · OpenAI embeddings · Vercel · Cloudflare R2 (later)

## Reading order

1. PRD → 2. Competitive analysis → 3. Architecture → 4. Data model → 5. Search → 6. UX → 7. SEO → 8. Roadmap → 9. Decisions
