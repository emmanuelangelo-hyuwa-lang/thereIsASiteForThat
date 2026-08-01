# Decisions & Open Questions

Locked choices for what we shipped. Revisit with data after soft launch.

---

## 1. Confidence threshold (curated vs AI fallback)

**Default in code:** **0.78** cosine similarity (`SEARCH_CONFIDENCE_THRESHOLD`).

| Score | Behavior |
|---|---|
| ≥ 0.78 | Curated mode; show confidence % |
| Below | RAG over catalog candidates; label `ai_inferred` |

**How to finalize:** Label ~50 queries after seed; tune for Recall@3 vs false-confident rate.

---

## 2. Moderation workload

**Shipped guards:**

- Rate-limit submissions: **8 / IP / hour**
- Auto-reject duplicate URLs (catalog + pending/approved submissions)
- Batch review as needed; quality over volume

**Later if spam rises:** captcha, email required, tighter caps.

---

## 3. Monetization

**v1:** Ad-free results. Optional disclosed affiliates later.

- Never let payment change "Best match".
- Sponsored (post-v1) = separate labeled row, never inside organic ranking.

---

## 4. Spam / low-quality submissions

**In place:** duplicate URL normalize + IP rate limits.  
**Still backlog:** honeypot, Turnstile, disposable-email blocklist.

---

## 5. Auth

| Audience | Mechanism |
|---|---|
| Admin | `ADMIN_PASSWORD` + signed httpOnly cookie |
| End users | **Auth.js (NextAuth v5) + Google OAuth** |

**Shipped:** bookmarks, saved searches, `/me` hub. Guest search/browse ungated.  
**Not used:** Supabase Auth, Clerk, Auth0.  
Admin remains separate from Google sessions. Spec: [11-user-accounts-features.md](./11-user-accounts-features.md).

---

## 6. Embedding + chat models

| Role | Model |
|---|---|
| Embeddings | OpenAI `text-embedding-3-small` (1536 dims) |
| RAG chat | OpenAI `gpt-4o-mini` (weak matches only) |

Keep embedding dimension stable once seeded.

---

## 7. Database / ORM

| Choice | Detail |
|---|---|
| Hosted DB | **Supabase Postgres** (connection string only) |
| Extensions | `vector`, `pg_trgm` |
| Client | Drizzle + `postgres.js`; pooler URI; `prepare: false` |
| Local alt | Optional WSL Postgres (not required) |

No Supabase JS client / Auth SDK.

---

## 8. Indexable search pages

- Admin can pin any slug.
- Auto-promote after **5** successful searches with ≥1 result above threshold.
- Thin/empty pages stay `noindex`.
- Seed ~30 high-intent pages at launch.

---

## 9. Naming / brand display

| Use | Form |
|---|---|
| Domain | thereisasiteforthat.com |
| Short | TIASFT (internal only) |
| Hero | ThereIsASiteForThat |
| Tagline | Need a website to do X? Here's the best one. |

Visual: editorial atlas home — Instrument Serif + IBM Plex Sans, ink-teal accent, light/dark toggle.

---

## 10. Still open

- Whether submitter email is required
- Soft launch channel (PH, Twitter/X, HN, Indie Hackers)
- Analytics (Plausible vs GA4)
- Threshold eval set
- Production deploy env completeness (Google redirect + all secrets on Vercel)

---

## Decision log

| Date | Decision | Status |
|---|---|---|
| 2026-08-01 | Docs-first in `docs/` | Done |
| 2026-08-01 | Stack: Next.js + Postgres + Drizzle + pgvector + OpenAI + Vercel | Done |
| 2026-08-01 | Admin password session (not Supabase Auth / not Google admin) | Done |
| 2026-08-01 | Hosted DB: Supabase Postgres; Drizzle + postgres.js + pooler | Done |
| 2026-08-01 | OpenAI embeddings + `gpt-4o-mini` RAG | Done |
| 2026-08-01 | Threshold default 0.78 | In code |
| 2026-08-01 | No ads in v1 results | Proposed |
| 2026-08-01 | Editorial atlas home UI | Done |
| 2026-08-01 | Auth.js Google + bookmarks + saved searches | Done |
| 2026-08-01 | Submit duplicate URL checks + IP rate limits | Done |
