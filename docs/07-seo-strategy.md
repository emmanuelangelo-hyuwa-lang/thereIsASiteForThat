# SEO Strategy

Win long-tail intent: "website to do X", not head terms against Google.

---

## 1. Target Query Patterns

| Pattern | Example |
|---|---|
| website to {task} | website to compress pdf |
| site to {task} | site to remove watermark |
| best free {tool} | best free qr code generator |
| website to {verb} {object} | website to edit audio |
| {tool} alternatives | notion alternatives (post-v1 page type) |

---

## 2. Page Types That Rank

| URL | Content |
|---|---|
| `/search/{slug}` | Task page: intro + ranked sites + confidence |
| `/site/{slug}` | Entity page: pros/cons/rating/alternatives |
| `/collections/{slug}` | Curated listicles |
| `/` | Brand + search (limited SEO value; brand queries) |

TAAFT equivalent: `/s/compress-pdf/`. We use clearer `/search/compress-a-pdf`.

---

## 3. URL Rules

- Slugify: lowercase, hyphenated, strip stopwords carefully (`a`, `the` may stay if natural: `compress-a-pdf`).
- Canonicalize synonyms (`pdf compressor` → same page as `compress pdf` via redirect or alias table later).
- Only mark `search_pages` indexable when:
  - Admin-pinned, **or**
  - Hit count ≥ N (e.g. 5) and has ≥ 1 solid result

`robots.txt` / `noindex` for thin empty search pages.

---

## 4. On-Page Template (`/search/[slug]`)

```
Title: Best websites to {query} | ThereIsASiteForThat
H1: {Humanized query}
Intro: 40-80 words answering the intent
Results: ranked list (server-rendered)
FAQ (optional later): 2-3 short Q&As
```

SSR/SSG required, do not hide results behind client-only fetch for indexable pages.

---

## 5. Content Ops

**Launch set (manual):** ~30 high-intent search pages + 7 collections + 150-300 site pages.

**Ongoing:**

1. Log queries from `/api/search`.
2. Promote popular queries to indexable `search_pages`.
3. Weekly: fill gaps where fallback rate is high (catalog holes).

---

## 6. Technical SEO Checklist

- [x] Unique titles/descriptions per page
- [x] Sitemap.xml including sites, collections, indexable search pages (`src/app/sitemap.ts`)
- [x] Canonical tags (search / site / collection)
- [x] `robots.txt` with admin/api disallow (`src/app/robots.ts`)
- [x] Thin search pages `noindex` until `isIndexable`
- [ ] Fast LCP (search hero image optional; don't block)
- [x] Structured data: `ItemList` on search/collection pages; `WebApplication` on site pages
- [ ] Outbound links: `noopener`; use `sponsored`/`nofollow` only when paid/affiliate
- [x] Mobile-friendly layout

---

## 7. Link Acquisition (lightweight)

- Product Hunt / indie launch posts
- Submit-a-site loop (creators link back when listed)
- Collections shareable as "best of" posts

Avoid spammy directory blasts that tank trust.

---

## 8. Metrics

- Impressions/clicks on `/search/*` and `/collections/*`
- Query → page → outbound CTR
- Index coverage in Search Console
- Cannibalization watch: site page vs search page for same head term
