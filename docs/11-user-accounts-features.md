# User Accounts & Google Sign-In — Feature Spec

**Status:** MVP shipped — Google sign-in + bookmarks + `/me` hub. Remaining features still backlog.  
**Auth provider:** Auth.js (NextAuth v5) + Google (`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, or `GOOGLE_CLIENT_*`)  
**Principle:** Search and browse stay fully public. Sign-in unlocks *save, sync, and personalize* — never gates finding a site.

---

## 1. Why Google Auth

| Goal | Why Google |
|---|---|
| Bookmarks across devices | Need a stable identity without building password reset |
| Low friction | One-click for most users; no email/password UX |
| Trust | Familiar; fewer abandoned signups than custom forms |
| Solo-dev cost | No Auth0/Clerk bill for v1 accounts; NextAuth/Auth.js + Google is enough |

**Keep separate from admin auth.** Admin stays password + signed cookie. Google users never get admin by default. Optional later: allowlist certain Google emails for admin, but not required for this phase.

**Anti-pattern (from TAAFT teardown):** Do not put "Sign in to continue" above search results. Sign-in CTAs appear only when the user tries to save, sync, or open a personal feature.

---

## 2. Identity Model (sketch)

| Table / concept | Purpose |
|---|---|
| `users` | `id`, `google_sub` (unique), `email`, `name`, `avatar_url`, `created_at`, `last_seen_at` |
| `sessions` | Auth.js / NextAuth session storage (or JWT-only if we keep it minimal) |
| Feature tables | All FK → `users.id` (bookmarks, lists, notes, …) |

Anonymous usage continues unchanged. On first Google sign-in, upsert `users` by `google_sub`.

---

## 3. Feature Candidates

Prioritized by user value × build cost × fit with "task → best site."

### P0 — Must ship with accounts (MVP accounts)

#### 3.1 Bookmarks (Favorites)

Save a site for later. Primary reason to add Google Client ID.

- Bookmark / unbookmark from site detail, search result row, collection cards
- `/me/bookmarks` — list with search/filter (name, category, pricing)
- Sync across devices once signed in
- Optional: folders or tags later; MVP = flat list + sort (recent / name / rating)

**Data:** `bookmarks (user_id, site_id, created_at)` unique `(user_id, site_id)`

#### 3.2 Saved searches

Save a query ("compress a pdf", "notion alternatives") and reopen it later.

- Save from homepage / search results
- `/me/searches` — reopen → runs current ranking (not a frozen snapshot)
- Optional later: email/push when catalog gets a stronger match

**Data:** `saved_searches (user_id, query, slug?, created_at)`

#### 3.3 Account home (`/me`)

Thin hub, not a dashboard wall:

- Bookmarks count + recent
- Saved searches
- My submissions (status)
- Sign out

One job: "stuff I saved."

---

### P1 — High value, ship soon after bookmarks

#### 3.4 Personal lists (private collections)

User-owned lists ("Freelance stack", "Student freebies") — distinct from editorial collections.

- Create / rename / delete list
- Add/remove sites
- Private by default

**Data:** `user_lists`, `user_list_items`

#### 3.5 Shareable lists (read-only public link)

Turn a personal list into `/l/[token]` or `/u/[handle]/[slug]` for sharing with friends/clients.

- Opt-in public; revocable link
- No comments/social graph in v1

#### 3.6 Private notes on sites

Short personal note on a bookmarked (or any) site: "Used for Client A", "Free tier enough."

**Data:** `site_notes (user_id, site_id, body, updated_at)` unique `(user_id, site_id)`

#### 3.7 Submission history + claim

Signed-in submit pre-fills email; `/me/submissions` shows pending / approved / rejected.

- Better spam signal (tied to Google account)
- Rate limits per `user_id` in addition to IP

---

### P2 — Personalization & power features

#### 3.8 Compare shortlist

Pin 2–4 sites → `/me/compare` or overlay with pros/cons side by side.

- Natural extension of bookmarks
- Great for "Notion vs Coda vs Affine" decisions

#### 3.9 Preferences

Persisted settings:

- Default pricing filter (prefer free/freemium)
- Hidden categories
- Theme preference sync (optional; local theme already works)
- Result density / confidence display

#### 3.10 Recently viewed

Last N sites / searches (server-side if signed in; localStorage if anonymous).

- "Continue where you left off" on `/me`
- Do not make this a noisy homepage feed

#### 3.11 Follow site or task

"Notify me when alternatives are added" or when a saved search gets a better curated match.

- Needs email (Google provides it) + humble digest, not spam
- Defer until email sending (Resend) exists

#### 3.12 Soft signals (votes / helpful)

Signed-in upvote "this helped" on a result — feeds ranking later, never replaces editor score in v1.

- Requires abuse controls
- Ship only after we have enough traffic to learn from

#### 3.13 Personalized "for you" strip

Based on bookmarks + clicks: suggest related sites / collections.

- Secondary surface only (below search or on `/me`)
- Never displace the search-first homepage hero

---

### P3 — Nice-to-have / later platform

| Feature | Notes |
|---|---|
| Browser extension sync | Extension uses same Google session / API token; bookmarks sync |
| Public profile | Optional handle + public lists — easy to become social clutter; keep optional |
| Import bookmarks from browser | CSV/HTML import into personal lists |
| Team / shared workspace | Overkill until B2B demand |
| "Replace my stack" wizard | Multi-step questionnaire → recommendations; needs solid catalog first |
| OAuth for public API | API keys tied to user for third-party clients |

---

## 4. Explicit Non-Goals (accounts phase)

- Social feed, followers, DMs
- Forcing sign-in to search, view results, or visit outbound links
- Replacing admin password auth with Google-only admin
- Points, badges, leaderboards
- Selling user data / creepy cross-site tracking narratives
- Multiple OAuth providers on day one (add GitHub later only if asked)

---

## 5. UX Rules

1. **Guest-first:** Full search, detail, collections, submit without login.
2. **Sign-in at intent:** Bookmark icon → if guest, modal "Save with Google" then complete action.
3. **No membership banners** competing with the answer.
4. **One primary CTA after login:** "View bookmarks" / toast "Saved" — not a tour.
5. **Account menu:** Avatar → Bookmarks, Saved searches, Lists, Submissions, Sign out.
6. **Delete account:** Export optional later; hard delete of user row + cascades required for trust.

---

## 6. Suggested Build Order (after core v1)

| Step | Deliverable | Depends on |
|---|---|---|
| A | Google OAuth + `users` table + session | Stable deploy + env secrets |
| B | Bookmarks API + UI + `/me/bookmarks` | A |
| C | Saved searches + `/me` hub | B |
| D | Submission attribution + `/me/submissions` | A |
| E | Personal lists + optional share links | B |
| F | Notes + compare shortlist | B / E |
| G | Preferences + recently viewed | A |
| H | Follow / digest email | Email provider |
| I | Soft votes + light personalization | Traffic + ranking pipeline |

Map to roadmap as **Phase 7 — Accounts & personal features** (after soft launch / Phase 5–6), unless bookmarks are needed earlier for retention experiments.

---

## 7. Env & Stack Notes (when we implement)

```bash
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
# Optional aliases: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
```

- **Auth.js (NextAuth v5)** JWT sessions; upsert `users` on Google sign-in.
- Protect `/me/*` in layout (`auth()` redirect); `/admin/*` stays password session.
- Bookmark toggle on `/site/[slug]`; guests are sent through Google then back.

---

## 8. Success Metrics (accounts)

| Signal | Why it matters |
|---|---|
| Sign-in → first bookmark &lt; 30s | Friction OK |
| % of weekly actives with ≥1 bookmark | Retention lever |
| Return visits from `/me` | Habit forming without feed spam |
| Submit spam rate for signed-in vs guest | Auth as moderation aid |

---

## 9. Open Questions

1. Handle / username for public list URLs, or opaque share tokens only?
2. Allow bookmarking AI-inferred results that aren't full `sites` rows yet?
3. Soft-launch Google OAuth on preview only before production Client ID?
4. Data retention: purge inactive accounts after N months?

Defaults if unspecified: **opaque share tokens**, **bookmarks only for published `sites`**, **preview Client ID first**, **no auto-purge until legal/privacy page exists**.

---

## 10. Decision

**Proceed to implement only after:** documenting approval (this doc) + core search (Phase 3) is usable.

**First implementation slice when greenlit:** Google sign-in + bookmarks + `/me` hub. Everything else stays backlog until that loop feels right.
