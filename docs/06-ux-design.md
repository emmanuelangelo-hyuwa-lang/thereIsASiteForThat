# UX Design

**Editorial atlas** of useful websites — calmer and broader than TAAFT, still search-first. Inspired by Railway’s product-grade restraint, not AI-startup chrome.

---

## 1. Design Principles

1. **Search is the product.** First viewport = brand + one line + search (+ quiet example links).
2. **Brand first.** `ThereIsASiteForThat` is hero-level (serif display).
3. **One composition.** Homepage is not a dashboard or live feed.
4. **Atlas below the fold.** Collections and categories are destinations, not admin indexes.
5. **Honest AI.** Curated vs AI-inferred is always labeled.
6. **Outbound is success.** Primary CTA is always “Visit site.”
7. **Light + dark.** First-class theme toggle; persist choice.

---

## 2. Visual Direction (Editorial atlas)

| Trait | Application |
|---|---|
| Cool paper canvas | Light: `#eef0f4`. Dark: `#12141a` ink — not purple-black SaaS |
| Hero stage | Full-bleed wash + subtle grain (`hero-stage`); not nested white panels |
| Serif + sans | Instrument Serif for headlines; IBM Plex Sans for UI |
| Accent | Ink teal (`#2f5d50` / `#7eb8a8`) — quiet, not neon violet |
| Borders | Hairline rules and spacing; fewer stacked `.panel` boxes on home |
| Density | Generous padding; no pill clusters or feed widgets |

**Avoid:** TAAFT-style news feeds, teal “AI SaaS” gradients, cream+terracotta, broadsheet density, glow stacks, emoji, rounded-full pill forests.

### Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#eef0f4` | `#12141a` |
| `--panel` | `#fafafb` | `#1a1d26` |
| `--ink` | `#14161c` | `#eef0f4` |
| `--muted` | `#5c6370` | `#9aa3b2` |
| `--border` | `rgba(20,22,28,0.11)` | `rgba(238,240,244,0.12)` |
| `--accent` | `#2f5d50` | `#7eb8a8` |
| `--accent-strong` | `#244a40` | `#9dcec0` |
| `--surface` | `#f3f4f7` | `#222632` |
| `--hero-wash` | `#e6e9ef` | `#161920` |

**Typography:** Instrument Serif (display) + IBM Plex Sans (UI).

**Motion (2–3):**

1. Placeholder rotate/fade in search.
2. Hero rise-in on load.
3. Collection destination hover lift.

**Cards:** Prefer bordered list rows / destination tiles with descriptions. No decorative card grids in the hero.

---

## 3. Information Architecture

```
/                         Homepage (editorial atlas)
/search/[slug]            Indexable results page
/site/[slug]              Website detail
/collections              Collections index
/collections/[slug]       Collection landing
/submit                   Public submission form
/admin                    Admin home (gated)
```

Nav: Logo · Categories · Collections · Submit · Theme toggle

---

## 4. Page Specs

### 4.1 Homepage

Components under `src/components/home/`:

1. **Hero** (`HomeHero`) — full-bleed `hero-stage`: brand, tagline, search, example query text links (no separate chip panel).
2. **Collections** (`CollectionDestinations`) — 2-col destinations with short descriptions.
3. **Featured picks** (`FeaturedPicks`) — richer catalog rows (name, why, category, rating).
4. **Category map** (`CategoryMap`) — atlas grid of territories + counts.
5. **Submit band** (`SubmitBand`) — short closing CTA.

No “How it works” on home. No TAAFT-style feed.

### 4.2–4.6

Inner pages keep panel language; restyle inherits global tokens.

---

## 5. Theme Toggle

- Modes: `light` | `dark` (cycle in header)
- Persist in `localStorage`
- FOUC-safe: inline script sets `class="dark"` before paint

---

## 6. Explicit Anti-Patterns

- Live news / device / fundraise feed on home
- Dense left icon rail
- Membership banners above search
- Ads as fake result rows (v1)
- Stacked identical white panels with no hierarchy
- Copying TAAFT’s AI-only framing
