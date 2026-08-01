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

- [x] `/api/search` embedding + pgvector (keyword fallback if no embeddings)
- [x] Confidence scores in UI
- [x] Instant search on homepage
- [x] `/search/[slug]` SSR pages
- [x] Click event logging (outbound via `POST /api/click`)
- [ ] Apply migrate + seed + embed against your Postgres (**needs you** — pgvector)

**Exit:** Real queries return ranked curated results.

---

## Phase 4 — Detail, Collections, Submit

- [x] `/site/[slug]` with pros/cons/alternatives
- [x] Collection pages (7 launch collections) + category browse
- [x] Public `/submit` + admin moderation queue
- [x] Seed-catalog fallback so browse/search work before migrate/embed
- [x] Rate limits + duplicate URL checks on submit/search
- [ ] Migrate/seed/embed against live Postgres (**needs you**)

**Exit:** Full v1 product loop: search → detail → visit → submit → moderate.

---

## Phase 5 — RAG Fallback + SEO Hardening

- [x] LLM fallback path + AI-inferred labeling (`OPENAI_CHAT_MODEL`, weak matches only)
- [x] Sitemap, robots, metadata, structured data (JSON-LD)
- [x] Promote top queries to indexable search pages (hit ≥ 5 + solid result; seed ~30 launch pages)
- Threshold tuning with eval set
- Soft launch / deploy

**Exit:** No dead-end searches; SEO plumbing live.

---

## Phase 6 — Post-v1 (backlog)

Priority order (suggested):

1. "X alternatives" pages
2. Hybrid keyword + vector search
3. Screenshots via R2
4. Comparison view (guest shortlist OK; signed-in sync later)
5. Browser extension / `tias` search shortcut
6. Public API

---

## Phase 7 — Accounts & personal features (Google OAuth)

**Docs:** [11-user-accounts-features.md](./11-user-accounts-features.md)

- [x] Google sign-in (Auth.js) + `users` table — guest search stays ungated
- [x] Bookmarks + `/me/bookmarks` + thin `/me` hub
- [x] Saved searches + `/me/searches`
- Submission history tied to account
- Personal lists → optional share links
- Notes, compare shortlist, preferences
- Later: follow/digest email, soft votes, light personalization

Admin password auth stays separate from Google user sessions.

---

## Suggested Timeline (aggressive solo)

| Week | Focus |
|---|---|
| 1 | Phase 1–2 scaffolding + schema + admin |
| 2 | Seed content + embeddings + search API |
| 3 | Detail, collections, submit, polish UX |
| 4 | RAG, SEO, soft launch |

Adjust if seed curation takes longer — quality of the first 200 entries matters more than shipping date.
