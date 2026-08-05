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
| End users | **Auth.js (NextAuth v5) + Google OAuth**, built but switched off |
| Voters | Anonymous signed cookie, no account at all |

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

Visual: editorial atlas home, Instrument Serif + IBM Plex Sans, ink-teal accent, light/dark toggle.

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

---

## 10. Ratings come from people who used the site

**Decided.** Editor stars are a placeholder, not the long term answer, and star ratings from anonymous strangers are noise we cannot police without accounts.

So the product asks one question, **"Did it solve it?"**, and only asks people who clicked through to the site. The right to vote is earned by using the link.

| Rule | Why |
|---|---|
| Vote only on a site you visited from here | Farming a verdict means actually visiting, which is the behaviour we want anyway |
| Identity is a signed cookie, hashed per site | No account, no email, and rows cannot be joined into a browsing history |
| One vote per device per site, revisable | Changing your mind is normal, ballot stuffing is not |
| Under three verdicts, show the editor score | A percentage from one person is noise pretending to be data |

Displayed as a **solve rate**, which suits a design built on large numerals better than five stars ever did.

---

## 11. Accounts wait for email

**Decided.** No sign-in until we can send confirmation and recovery mail. A login that cannot recover an account is a trap.

Everything the product promises today works without one. `/signin` says this in plain language rather than showing a dead button.

---

## 12. The interface has rules, and they are written down

**Decided.** See [06-ux-design.md](./06-ux-design.md). The short version:

| Rule | Effect |
|---|---|
| Black is home, colour is a destination | Each category, collection and site owns one accent colour |
| Progressive disclosure by default | Hide what does not help the next decision |
| No dashes in copy | Full stop, comma or slash instead |
| Nothing performs for attention | No counters, odometers or cycling placeholders |
