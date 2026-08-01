# UX Design

Inspired by [Railway](https://railway.com/) (marketing + `/domains` utility) — architectural, product-grade, not “AI startup.”

Search-first clarity from the PRD remains; the visual language is Railway-like.

---

## 1. Design Principles

1. **Search is the product.** First viewport = brand + one line + search.
2. **Brand first.** `ThereIsASiteForThat` is hero-level (serif display).
3. **One composition.** Homepage is not a dashboard or live feed.
4. **Panel architecture.** Content lives in thin-bordered, large-radius panels on a calm canvas — like Railway’s main stage.
5. **Honest AI.** Curated vs AI-inferred is always labeled.
6. **Outbound is success.** Primary CTA is always “Visit site.”
7. **Light + dark.** First-class theme toggle; respect system preference; persist choice.

---

## 2. Visual Direction (Railway-inspired)

Borrow Railway’s *feel*, not their brand assets:

| Trait | Application |
|---|---|
| Deep canvas | Dark: `#13111c`-ish purple-black. Light: cool off-white `#f4f3f7` |
| Panel stage | Large rounded container, 1px border, soft inner atmosphere |
| Serif + sans | Display serif for headlines; sharp sans for UI |
| Accent | Single violet/purple CTA (`#6e56cf` family) — decisive, not neon glow |
| Borders | Hairline, low-contrast; grids over soft shadows |
| Density | Generous padding, few elements, no pill clusters |

**Avoid:** teal “AI SaaS” gradients, cream+terracotta, broadsheet rules, glow stacks, emoji, rounded-full pill forests.

### Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#f4f3f7` | `#13111c` |
| `--panel` | `#ffffff` | `#1a1726` |
| `--ink` | `#17141f` | `#f5f3ff` |
| `--muted` | `#6b6578` | `#a39cb3` |
| `--border` | `rgba(23,20,31,0.10)` | `rgba(245,243,255,0.10)` |
| `--accent` | `#6e56cf` | `#8b7cf7` |
| `--accent-strong` | `#5b45b5` | `#a594ff` |
| `--surface` | `#ffffff` | `#201c2e` |

**Typography:** Instrument Serif (display) + IBM Plex Sans (UI).

**Motion (2–3):**

1. Placeholder rotate/fade in search.
2. Soft panel/hero fade-in on load.
3. Theme cross-fade via CSS color transitions on tokens.

**Cards:** Prefer bordered list rows / panels. No decorative card grids.

---

## 3. Information Architecture

```
/                         Homepage (search hero in panel)
/search/[slug]            Indexable results page
/site/[slug]              Website detail
/collections              Collections index
/collections/[slug]       Collection landing
/submit                   Public submission form
/admin                    Admin home (gated)
```

Nav: Logo · Collections · Submit · Theme toggle

---

## 4. Page Specs

### 4.1 Homepage

Outer canvas → centered **stage panel**:

1. Brand name (serif, large)
2. Tagline (one line)
3. Domains-style search field (full width, bordered)
4. Secondary text links: Collections / Submit

Below fold: example query links, then How it works as a bordered 3-column/row list.

### 4.2–4.6

Unchanged in structure from PRD — restyle with panel borders, accent buttons, theme tokens. See previous sections for content requirements.

---

## 5. Theme Toggle

- Modes: `light` | `dark` | `system` (UI may expose light/dark cycle; system as default)
- Persist in `localStorage`
- FOUC-safe: inline script sets `class="dark"` before paint
- Toggle lives in header (sun/moon)

---

## 6. Explicit Anti-Patterns

- Teal gradient “AI tool” look
- Live news feed on home
- Dense left icon rail
- Membership banners above search
- Ads as fake result rows (v1)
- Flat single-color pages with no panel structure
