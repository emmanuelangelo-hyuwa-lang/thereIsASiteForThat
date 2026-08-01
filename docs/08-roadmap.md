# Roadmap

Solo-developer, shippable phases. Optimize for a working search experience early.

---

## Phase 0 — Docs & Foundations (this folder)

- [x] PRD
- [x] Competitive analysis (TAAFT)
- [x] Architecture, data model, search, UX, SEO docs
- [x] Repo scaffolding decision locked

**Exit:** Docs approved; ready to scaffold Next.js app.

---

## Phase 1 — Skeleton App

- [x] Next.js App Router + Tailwind + TypeScript
- [x] Drizzle + custom Postgres schema scaffolding
- [x] pgvector extension SQL + embedding column in schema
- [x] Base layout, design tokens, homepage shell (brand + search UI, no real search yet)
- [ ] Env wired to live Postgres + deploy to Vercel preview (**needs you** — see [10-setup.md](./10-setup.md))

**Exit:** Live homepage shell on a preview URL.

---

## Phase 2 — Directory CRUD + Seed

- [x] Schema migrations (`sites`, `categories`, `collections`, …)
- [x] Admin auth (password + signed session cookie)
- [x] Admin create/edit/publish sites
- [x] Seed data (~70 curated sites + 12 categories + 7 collections)
- [x] Batch embedding job (`npm run db:embed`)
- [ ] Run migrate/seed against your Postgres (**needs you**); embed when OpenAI is ready

**Exit:** Published catalog in DB with embeddings.

---

## Phase 3 — Search v1 ← next code phase

- `/api/search` embedding + pgvector
- Confidence scores in UI
- Instant search on homepage
- `/search/[slug]` SSR pages
- Click event logging (outbound)

**Exit:** Real queries return ranked curated results.

---

## Phase 4 — Detail, Collections, Submit

- `/site/[slug]` with pros/cons/alternatives
- Collection pages (7 launch collections)
- Public `/submit` + admin moderation queue
- Rate limits + duplicate URL checks

**Exit:** Full v1 product loop: search → detail → visit → submit → moderate.

---

## Phase 5 — RAG Fallback + SEO Hardening

- Threshold tuning with eval set
- LLM fallback path + AI-inferred labeling
- Sitemap, metadata, structured data
- Promote top queries to indexable search pages
- Soft launch

**Exit:** No dead-end searches; SEO plumbing live.

---

## Phase 6 — Post-v1 (backlog)

Priority order (suggested):

1. Favorites (lightweight accounts)
2. "X alternatives" pages
3. Hybrid keyword + vector search
4. Screenshots via R2
5. Upvotes / community ranking
6. Comparison view
7. Browser extension / `tias` search shortcut
8. Public API

---

## Suggested Timeline (aggressive solo)

| Week | Focus |
|---|---|
| 1 | Phase 1–2 scaffolding + schema + admin |
| 2 | Seed content + embeddings + search API |
| 3 | Detail, collections, submit, polish UX |
| 4 | RAG, SEO, soft launch |

Adjust if seed curation takes longer — quality of the first 200 entries matters more than shipping date.
