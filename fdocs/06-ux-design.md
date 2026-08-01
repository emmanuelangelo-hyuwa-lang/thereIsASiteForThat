# UX Design

Inspired by TAAFT's search-first clarity — but calmer, broader, and recommendation-oriented.

---

## 1. Design Principles

1. **Search is the product.** First viewport = brand + one line + search.
2. **Brand first.** `ThereIsASiteForThat` must be hero-level, not a nav whisper.
3. **One composition.** Homepage is not a dashboard or live feed.
4. **Answer, don't scroll.** Ranked matches with confidence beat infinite lists.
5. **Honest AI.** Curated vs AI-inferred is always labeled.
6. **Outbound is success.** Primary CTA is always "Visit site".
7. **Reduce chrome.** No icon-rail mega-nav, no membership banners over the answer.

---

## 2. Visual Direction

Avoid AI-default looks (purple gradients, cream+terracotta, broadsheet).

**Direction:** Clean utility-discovery — light atmospheric base, strong brand type, single accent for CTAs.

| Token | Intent |
|---|---|
| `--bg` | Soft layered gradient / subtle pattern (not flat white) |
| `--ink` | Near-black text |
| `--muted` | Secondary copy |
| `--accent` | One decisive CTA color (e.g. teal or electric blue — pick one) |
| `--surface` | Occasional interactive surfaces only |

**Typography:** Expressive pairing (e.g. display + sharp sans). No Inter/Roboto/Arial stacks.

**Motion (ship 2–3):**

1. Placeholder text rotate/fade in search box.
2. Results list fade/slide in after search.
3. Subtle brand wordmark entrance on first load.

**Cards:** Default none. Use list rows. Cards only when they wrap a real interaction (e.g. admin moderation actions).

---

## 3. Information Architecture

```
/                         Homepage (search hero)
/search/[slug]            Indexable results page
/site/[slug]              Website detail
/collections              Collections index
/collections/[slug]       Collection landing
/submit                   Public submission form
/admin                    Admin home (gated)
/admin/submissions        Moderation queue
/admin/sites              CRUD
```

Minimal global nav: Logo · Collections · Submit · (Admin if logged in)

---

## 4. Page Specs

### 4.1 Homepage (first viewport)

Must contain only:

1. Brand name (hero)
2. One short supporting sentence (tagline)
3. Search box (+ rotating placeholders)
4. Optional tiny secondary link: "Browse collections" / "Submit a site"

No stats strips, category grids, news feeds, or ad banners in the first viewport.

**Below fold (light):** 3–4 example queries as text links, then a short "How it works" (Search → Match → Visit). Not a tool dump.

### 4.2 Search results (`/search/[slug]`)

- H1: humanized query ("Compress a PDF")
- Mode badge: Curated match / AI-inferred
- Ranked list:
  - Best match (98%) — name, one-line description, pricing, rating, Visit
  - Other good matches…
- Empty / weak: clear AI summary + suggestions to refine query
- Footer SEO blurb (1 short paragraph), not wall of text

### 4.3 Site detail (`/site/[slug]`)

- Name + rating + pricing
- Description
- Pros / Cons columns
- Primary CTA: Visit site (new tab, `rel="noopener sponsored"` only if affiliate)
- Alternatives section (same category / embedding neighbors)
- Back to search / related queries

### 4.4 Collections

- Clean H1 + 1 sentence
- Ordered list of sites (same row pattern as search)
- No card grids unless necessary for mobile scan — prefer ranked list consistency

### 4.5 Submit

- Short form, clear expectations ("Reviewed before publish")
- Success state with what happens next

### 4.6 Admin

- Functional, not pretty: queue, approve/reject, edit entry, re-embed button

---

## 5. Result Row Anatomy

```
[Best match · 98%]
Name                         Freemium · ★ 4.6
One-line task-oriented description
[Visit site]   [Details]
```

Secondary matches omit the "Best match" label but keep %.

---

## 6. Mobile

- Search box full width, large tap target
- Sticky search on results page optional
- Pros/cons stack vertically
- Nav collapses to simple top bar

---

## 7. Accessibility

- Visible focus rings
- Search results announced via polite live region
- Contrast AA+
- Escape closes command palette / search overlay if used

---

## 8. Explicit Anti-Patterns (from TAAFT)

- Live feed of unrelated news on home
- Dense left icon rail
- "Join for free" banners above search
- Ads injected as fake result rows in v1
- Dark mode as default (optional later; light first)
