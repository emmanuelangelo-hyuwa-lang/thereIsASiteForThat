# Product Requirements Document

**Product:** ThereIsASiteForThat.com  
**Version:** 1.0  
**Status:** Draft for build

---

## 1. Overview

**Tagline:** "Need a website to do X? Here's the best one."

**Inspiration:** [There's An AI For That](https://theresanaiforthat.com/), but not limited to AI tools. Any useful website.

**One-line pitch:** A searchable directory and discovery engine for websites, where users describe a task in plain language and get back the best matching site(s), with AI-powered fallback when nothing is explicitly catalogued.

**Core value proposition:** The domain name is self-explanatory marketing. Success depends on (a) high-quality curated entries for common needs, and (b) a search experience that feels smart even for queries that don't map to a stored entry.

---

## 2. Goals

- Help users quickly find the right website for a specific task, without wading through generic search engine results.
- Build a self-sustaining, growing directory via community submissions.
- Rank in search engines for long-tail "website to do X" queries.
- Keep the initial build small, cheap, and shippable by a single developer.

### Non-goals (v1)

- Not building a general web search engine.
- Not limiting scope to AI tools only.
- Not gating anything behind sign-in. Search, browse and voting are all open. Accounts are built but switched off until we can send email.
- Not becoming a news feed, leaderboard mega-portal, or ad-dense marketplace in v1.

---

## 3. Target Users

- People who vaguely know what they want ("convert a PDF", "make a resume") but don't know which website does it best.
- People replacing a tool they've outgrown ("Notion alternatives").
- Students, freelancers, indie hackers, marketers, high-frequency "I need a tool for X" searchers.

---

## 4. Core Features (v1)

### 4.1 Curated Directory

Each entry contains:

| Field | Required | Notes |
|---|---|---|
| Name | Yes | Display name |
| Slug | Yes | URL-safe unique |
| Website URL | Yes | Canonical outbound URL |
| Short description | Yes | 1-2 sentences, task-oriented |
| Category | Yes | Primary category |
| Tags | Yes | 3-8 tags |
| Pricing model | Yes | Free / Freemium / Paid / Free trial |
| Pros | Yes | 2-5 bullets |
| Cons | Yes | 1-4 bullets |
| Rating | Yes | Editor score 1.0 to 5.0, the cold start value |
| Solve rate | Derived | Share of visitors who said the site solved their task. Replaces the editor score once three people have voted |
| Screenshot | No | Deferred; R2 later |
| Status | Yes | draft / pending / published / rejected |

**Seed categories at launch:** PDF tools, background removal, video compression, resume builders, color palettes, icons, fonts, stock photos, screen recording, password managers, URL shorteners, markdown editors, mind mapping, whiteboards, OCR, QR code generators.

**Launch target:** 150-300 high-quality curated entries.

### 4.2 Search-First Homepage

- Single prominent search box, no category grid as the hero.
- Rotating placeholder examples: "resume builder", "youtube downloader", "color picker", "logo maker", "find internships".
- Instant results as you type (client debounce + server search).
- Keyboard shortcut: `Ctrl/⌘ + K`.

### 4.3 Semantic Search + RAG Fallback

Pipeline:

1. User submits query.
2. Run semantic/embedding search against stored entries.
3. If a confident match exists (above similarity threshold), return curated results with confidence scores.
4. If no confident match, fall back to an LLM + RAG to infer closest relevant tools and generate a recommendation, clearly flagged as **AI-inferred**.

Every result shows a confidence percentage:

- Best match (98%), Excalidraw
- Other good matches, tldraw (95%), Miro (91%), FigJam (88%)

### 4.4 Website Detail Page

- Name, score, description, pricing
- Pros / cons
- Alternatives (same task / category)
- Clear outbound CTA ("Visit site")
- Optional later: similar websites carousel

### 4.5 Submission System

- Public form: Name, URL, Description, Category, Tags.
- Lands in moderation queue (`pending`).
- Admin approves / rejects / edits before publishing.
- Rate-limit submissions; basic spam heuristics (duplicate URL, disposable domains).

### 4.6 Curated Collections

SEO landing pages, each indexable:

- Best AI Websites
- Best Student Websites
- Best Productivity Websites
- Best Free Websites
- Best Developer Websites
- Best Design Websites
- Best Startup Websites

### 4.7 Indexable Search / Task Pages

Each unique search query can become `/search/{slug}` (e.g. `/search/compress-a-pdf`) with curated results + short generated intro copy for SEO.

---

## 5. Admin Features (v1)

- Login-gated admin (single admin or small allowlist).
- Moderation queue for submissions.
- Create / edit / unpublish directory entries.
- Trigger re-embedding when entry content changes.
- Collection editor (pick sites for a collection).

---

## 6. Success Metrics

| Metric | Target / signal |
|---|---|
| Curated entries at launch | 150-300 |
| Search → outbound click CTR | Track from day 1 |
| Organic traffic to long-tail pages | Growing week-over-week |
| Submission volume + approval rate | Healthy inflow without quality collapse |
| Repeat visit rate | Bookmark-worthy search UX |

---

## 7. Monetization (not required for v1)

Decide early enough that ranking logic stays honest:

- Prefer: affiliate links (disclosed), optional sponsored placements clearly labeled.
- Avoid: burying the best free tool under paid placements.
- Trust > short-term ad revenue in v1.

---

## 8. Accounts, and why there are none yet

**Built, switched off.** Google OAuth, bookmarks, saved searches and the `/me` hub all work, but sign-in is not exposed. A login that cannot send a confirmation or recover a password is a trap, so it waits for transactional email. See [11-user-accounts-features.md](./11-user-accounts-features.md).

**What replaced it in the meantime:** community verdicts. Anyone can rate a site without an account, because the right to vote is earned by clicking through to it rather than by registering. See [09-decisions.md](./09-decisions.md).

**Still post-v1 / backlog:**

- Upvoting / community ranking
- Side-by-side comparison
- Personalized AI recommendations
- Personal lists, notes, submission history on `/me`
- Browser extension / Chrome search shortcut (`tias <query>`)
- Public API
- "Replace X with Y" pages
- Trending / recently added social feeds
