# Local Setup Checklist

What to configure for the stack we **actually use**:

| Piece | Choice |
|---|---|
| Database | **Supabase Postgres** + `vector` + `pg_trgm` (pooler URI) |
| ORM | Drizzle + `postgres.js` |
| AI | OpenAI embeddings + chat RAG |
| Admin | Password + signed cookie |
| End users | **Auth.js + Google OAuth** |

We do **not** use Supabase Auth or the Supabase JS client — only the Postgres connection string.

---

## 1. Create a Supabase project

1. [https://supabase.com](https://supabase.com) → New project  
2. Note the database password  
3. **Project Settings → Database** (or Connect)

### Connection strings

| Use | Which URI | Port / mode |
|---|---|---|
| App + migrate (`DATABASE_URL`) | **Transaction** pooler | Often `6543` |
| Optional (`DATABASE_URL_DIRECT`) | Session pooler, or Direct | `5432` |

**WSL / IPv6:** Supabase **Direct** (`db.xxxx.supabase.co:5432`) is often IPv6-only and can fail with `ENETUNREACH`. Prefer the **pooler** host for `DATABASE_URL`. Leave `DATABASE_URL_DIRECT` unset, or point it at Session pooler.

URL-encode special characters in the password (e.g. `#` → `%23`).

```bash
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-....pooler.supabase.com:6543/postgres
# DATABASE_URL_DIRECT=   # optional; avoid Direct from WSL if IPv6 breaks
```

### Enable extensions

SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### Free-tier idle

Free projects can pause after ~7 days idle. Wake from the dashboard if needed.

---

## 1b. Optional: local WSL Postgres

Only if you prefer local over Supabase (not required for this project):

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-16-pgvector
sudo service postgresql start
# create user/db + enable vector + pg_trgm — see earlier git history or Postgres docs
DATABASE_URL=postgresql://tias:tias@localhost:5432/thereisasiteforthat
```

---

## 2. Fill `.env`

```bash
cp .env.example .env
```

```bash
DATABASE_URL=...                 # Supabase pooler
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...         # openssl rand -hex 32
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini
AUTH_SECRET=...                  # openssl rand -hex 32
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SEARCH_CONFIDENCE_THRESHOLD=0.78
```

### Google Cloud Console

OAuth client → Authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://thereisasiteforthat.com/api/auth/callback/google
```

Without Google credentials, the rest of the app (search, admin, browse) still works; Sign in / bookmarks / saved searches will not.

---

## 3. Migrate + seed + embed

Migrations in repo: `drizzle/0000_*.sql`, `0001_*.sql` (users/bookmarks), `0002_*.sql` (saved_searches).

```bash
npm run db:migrate
npm run db:seed
npm run db:embed      # needs OPENAI_API_KEY
npm run dev
```

Smoke checks:

1. Homepage instant search (≥2 chars) with confidence %  
2. Enter → `/search/{slug}`  
3. Visit site → `POST /api/click` then outbound  
4. Google Sign in → bookmark a site → `/me/bookmarks`  
5. Save a search → `/me/searches`  
6. `/admin/login` with `ADMIN_PASSWORD`

---

## 4. Admin vs user auth

| Path | Auth |
|---|---|
| `/admin/*` | Password cookie |
| `/me/*`, bookmarks, saved searches | Google (Auth.js) |
| Search, browse, submit | Public (submit rate-limited) |

---

## 5. Deploy (Vercel / similar)

1. Push to GitHub → import project  
2. Set env: `DATABASE_URL` (pooler), `OPENAI_*`, `ADMIN_*`, `AUTH_*`, `NEXT_PUBLIC_SITE_URL=https://thereisasiteforthat.com`  
3. Add production Google redirect URI  
4. Run migrate/seed/embed against the **prod** DB if it is not the same Supabase project as local  

---

## Done when

- [ ] Supabase: `vector` + `pg_trgm` enabled  
- [ ] `.env`: DB, admin, OpenAI, Auth.js Google  
- [ ] `db:migrate` / `db:seed` / `db:embed` succeed  
- [ ] Admin login works  
- [ ] Search returns ranked results  
- [ ] Google sign-in + bookmark + save search work  
- [ ] (Prod) Vercel env + Google redirect + site URL set  
