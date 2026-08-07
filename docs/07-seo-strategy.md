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
- [x] Sitemap.xml including sites, categories, collections, indexable search pages (`src/app/sitemap.ts`)
- [x] Canonical tags on every indexable page type (home, categories, collections, search, site, submit)
- [x] `robots.txt` with admin/api/account disallow (`src/app/robots.ts`)
- [x] Thin search pages `noindex` until `isIndexable`
- [x] `googlebot` directives: `max-image-preview:large`, `max-snippet:-1` (root layout)
- [x] Search Console verification via `GOOGLE_SITE_VERIFICATION` (optional; DNS works too)
- [x] Web manifest (`src/app/manifest.ts`); favicon, apple icon, OG and Twitter images in `src/app`
- [ ] Fast LCP (search hero image optional; don't block)
- [x] Structured data: `ItemList` on search/category/collection pages; `WebApplication` on site
      pages; `BreadcrumbList` on all four; `WebSite` + `SearchAction` and `Organization` on home
- [x] Outbound links: `noopener noreferrer`; use `sponsored`/`nofollow` only when paid/affiliate
- [x] Mobile-friendly layout

Builders for the shared schema objects live in `src/lib/seo/schema.ts`; `JsonLd`
(`src/lib/seo/json-ld.tsx`) accepts a single object or an array, so a page emits one script tag.

---

## 6a. Getting Indexed (one-time, manual)

Crawling starts only once Google knows the domain exists. In order:

1. Add the property in [Search Console](https://search.google.com/search-console) as a **Domain**
   property (covers `www` and both schemes) and verify by DNS TXT record. If DNS is not available,
   use the HTML-tag method and put the token in `GOOGLE_SITE_VERIFICATION`.
2. Submit `https://thereisasiteforthat.com/sitemap.xml` under **Sitemaps**.
3. Use **URL Inspection → Request indexing** on the home page and a handful of the strongest
   `/search/*` pages. This seeds the crawl; the rest arrives through the sitemap.
4. Confirm rendering with the [Rich Results Test](https://search.google.com/test/rich-results) on
   one `/site/*` and one `/search/*` URL — it reports the structured data Google actually parsed.

Indexing takes days to weeks, and brand queries land before long-tail ones. Nothing in the codebase
speeds this up; only pages worth ranking and links pointing at them do.

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
