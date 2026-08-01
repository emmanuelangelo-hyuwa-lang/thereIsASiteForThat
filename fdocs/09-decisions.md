# Decisions & Open Questions

Recommended defaults for v1. Revisit with data after soft launch.

---

## 1. Confidence threshold (curated vs AI fallback)

**Question:** What similarity score triggers curated vs LLM fallback?

**Recommendation:** Start at **0.78** cosine similarity.

| Score | Behavior |
|---|---|
| ≥ 0.78 | Curated mode; show confidence % |
| 0.65–0.77 | Soft band: still show vector hits but prefer RAG summary framing |
| < 0.65 | Full AI-inferred path; be explicit about uncertainty |

**How to finalize:** Label 50 queries after seed; pick threshold maximizing Recall@3 while keeping false-confident rate low.

---

## 2. Moderation workload

**Question:** How much manual review is sustainable solo?

**Recommendation:**

- Cap intake: rate-limit submissions (e.g. 5/IP/day).
- Auto-reject exact duplicate URLs.
- Batch review 2–3×/week, not real-time.
- Target approval rate quality over volume; "no" is fine.
- If queue > ~30 pending for >1 week, tighten form (require email, captcha).

---

## 3. Monetization

**Question:** Affiliate, sponsored, or ad-free?

**Recommendation for v1:** **Ad-free results. Optional disclosed affiliates later.**

- Never let payment change "Best match".
- If sponsored appears post-v1, separate row labeled **Sponsored**, never inside organic ranking.
- Affiliate links OK only with disclosure and when the editor still ranks that site organically.

Trust compounds; ads early destroy the "best one" promise.

---

## 4. Spam / low-quality submissions

**Guards:**

1. Duplicate URL detection (normalize trailing slash, `www`, utm params).
2. Blocklist disposable email domains if email collected.
3. Require real description (≥ 40 chars) and valid category.
4. Honeypot field + Cloudflare Turnstile / hCaptcha on `/submit`.
5. Published entries only affect search (pending never embedded).

---

## 5. Auth scope in v1

**Decision:** No end-user accounts. Admin-only auth via Supabase Auth + email allowlist.

Favorites deferred to post-v1.

---

## 6. Embedding model

**Decision:** OpenAI `text-embedding-3-small` (1536 dims).

Re-evaluate only if cost or quality becomes a problem; keep dimension stable once seeded.

---

## 7. ORM / backend

**Decision:** Drizzle + Supabase Postgres + pgvector (per PRD).

Services/repositories layer in TypeScript; no business logic in React components.

---

## 8. Indexable search pages — when?

**Decision:**

- Admin can pin any slug.
- Auto-promote after **5** successful searches with ≥1 result above threshold.
- Thin/empty pages stay `noindex`.

---

## 9. Naming / brand display

| Use | Form |
|---|---|
| Domain | thereisasiteforthat.com |
| Short | TIASFT (internal only) |
| Hero | ThereIsASiteForThat |
| Tagline | Need a website to do X? Here's the best one. |

Avoid overusing the acronym in UI.

---

## 10. Still open (need founder call)

- Whether submitter email is required
- Soft launch channel (PH, Twitter/X, HN, Indie Hackers)
- Domain DNS / analytics (Plausible vs GA4)

---

## Decision log

| Date | Decision | Status |
|---|---|---|
| 2026-08-01 | Docs-first in `fdocs/` | Done |
| 2026-08-01 | Stack: Next.js + Supabase + Drizzle + pgvector + OpenAI + Vercel | Proposed |
| 2026-08-01 | Threshold default 0.78 | Proposed |
| 2026-08-01 | No ads in v1 results | Proposed |
| 2026-08-01 | Visual system: Railway-inspired panels, Instrument Serif + IBM Plex Sans, violet accent, light/dark toggle | Done |
