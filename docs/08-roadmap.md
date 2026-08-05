# Roadmap

Solo-developer phases. Status reflects what is **in the repo / wired to Supabase locally**. Production Vercel env + soft launch still need a human deploy pass.

---

## Phase 0, Docs & Foundations

- [x] PRD, competitive analysis, architecture, data model, search, UX, SEO
- [x] Repo scaffolding locked

**Exit:** Docs approved; scaffold ready.

---

## Phase 1, Skeleton App

- [x] Next.js App Router + Tailwind + TypeScript
- [x] Drizzle + Postgres schema + pgvector
- [x] Base layout, design tokens, homepage shell → editorial atlas home
- [ ] Deploy to Vercel with production env (**ops**, see [10-setup.md](./10-setup.md))

**Exit:** Live homepage on preview/prod URL.

---

## Phase 2, Directory CRUD + Seed

- [x] Schema migrations (`sites`, `categories`, `collections`, …)
- [x] Admin auth (password + signed session cookie)
- [x] Admin create/edit/publish sites
- [x] Seed (~70 sites + 12 categories + 7 collections)
- [x] Batch embedding (`npm run db:embed`) against Supabase
- [ ] Confirm prod DB has migrate/seed/embed (**ops**)

**Exit:** Published catalog with embeddings.

---

## Phase 3, Search v1

- [x] `/api/search` embedding + pgvector (keyword fallback if needed)
- [x] Confidence scores + instant homepage search
- [x] `/search/[slug]` SSR pages
- [x] Click event logging (`POST /api/click`)
- [x] Rate limit search API (60/min/IP)

**Exit:** Real queries return ranked curated results.

---

## Phase 4, Detail, Collections, Submit

- [x] `/site/[slug]` with pros/cons/alternatives
- [x] Collection + category browse
- [x] Public `/submit` + admin moderation queue
- [x] Duplicate URL checks + submit rate limit (8/hr/IP)
- [x] Seed-catalog fallback for browse before migrate (dev convenience)

**Exit:** Full loop: search → detail → visit → submit → moderate.

---

## Phase 5, RAG Fallback + SEO Hardening

- [x] LLM fallback + AI-inferred labeling (`OPENAI_CHAT_MODEL`)
- [x] Sitemap, robots, metadata, JSON-LD
- [x] Auto-promote search pages (hit ≥ 5 + solid result); seed ~30 pages
- [ ] Threshold tuning with eval set
- [ ] Soft launch / production cutover (**ops**)

**Exit:** No dead-end searches; SEO plumbing live.

---

## Phase 6, Design system and community verdicts

Shipped after the first working loop, in response to the interface feeling generic.

- [x] Monolith design system: black canvas, per-entity accent colour, one radius scale, see [06](./06-ux-design.md)
- [x] Typography: Geist for the interface, Instrument Serif for lead lines
- [x] Motion: staggered reveals, sliding nav pill, colour cross-fade between themes, shared-element page transitions
- [x] Progressive disclosure pass: home page cut from roughly 4,460px to 3,460px, search tail and alternatives behind one press
- [x] Community verdicts: vote earned by clicking through, no account, `site_votes` table
- [x] Approve on a submission now creates a prefilled draft site
- [ ] Run `npm run db:migrate` on production for `site_votes` (**ops**)

**Exit:** The product looks like itself, and sites are judged by people who used them.

---

## Phase 7, Post-v1 (backlog)

1. "X alternatives" pages  
2. Hybrid keyword + vector search  
3. Screenshots via R2  
4. Comparison view (guest shortlist; signed-in sync later)  
5. Browser extension / `tias` search shortcut  
6. Public API  

---

## Phase 8, Accounts, currently switched off

**Docs:** [11-user-accounts-features.md](./11-user-accounts-features.md)

Blocked on transactional email for confirmation and recovery. The backend is done; turning it on is a UI job.

- [x] Google sign-in (Auth.js) + `users` table, guest search ungated
- [x] Bookmarks + `/me/bookmarks` + `/me` hub
- [x] Saved searches + `/me/searches`
- [ ] Transactional email provider (**blocker**)
- [ ] Restore the header entry point and the save-search button
- [ ] Submission history on `/me`
- [ ] Personal lists → optional share links
- [ ] Notes, compare shortlist, preferences
- [ ] Later: follow/digest email, soft votes, light personalization

Admin password auth stays separate from Google user sessions.

---

## What is actually left

| Item | Type | Notes |
|---|---|---|
| Production deploy with env vars | Ops | See [10-setup.md](./10-setup.md) |
| `db:migrate` for `site_votes` | Ops | Safe to deploy before running it; reads are wrapped |
| Threshold tuning with an eval set | Product | Needs real query logs first |
| Transactional email | Blocker | Gates accounts entirely |

Quality of the first 200 catalog entries matters more than shipping date.
