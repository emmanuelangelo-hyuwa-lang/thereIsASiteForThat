# Local Setup Checklist

What **you** need to configure: **Supabase Postgres** (recommended), OpenAI for embeddings, and admin password.

We use Supabase as a **hosted Postgres** only (pgvector). Admin login stays password + cookie — no Supabase Auth SDK.

---

## 1. Create a Supabase project (recommended)

1. Go to [https://supabase.com](https://supabase.com) → New project  
2. Note the database password you set  
3. Open **Project Settings → Database**

### Connection strings

Copy both:

| Use | Which URI | Port / mode |
|---|---|---|
| App + migrate (`DATABASE_URL`) | **Transaction** pooler | Often `6543` |
| Optional (`DATABASE_URL_DIRECT`) | **Session** pooler (preferred) or Direct | `5432` |

On the Connect screen pick **Direct → Connection string**, then copy the **pooler** URI for `DATABASE_URL`.

**WSL / IPv6 note:** Supabase **Direct** (`db.xxxx.supabase.co:5432`) is often IPv6-only. From WSL that can fail with `ENETUNREACH`. Use the **pooler** host for `DATABASE_URL` (and leave `DATABASE_URL_DIRECT` unset, or set it to the Session pooler URI).

Paste into `.env` / `.env.local`. If the password has special characters (`#`, `@`, etc.), URL-encode them (e.g. `#` → `%23`).

Example shape (yours will differ):

```bash
DATABASE_URL=postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-....pooler.supabase.com:6543/postgres
DATABASE_URL_DIRECT=postgresql://postgres.xxxx:YOUR_PASSWORD@db.xxxx.supabase.co:5432/postgres
```

### Enable extensions

In Supabase → **SQL Editor**, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Confirm under **Database → Extensions** that `vector` and `pg_trgm` are enabled.

### Free-tier idle note

Supabase free projects can **pause after ~7 days** of low activity. A little traffic (or an occasional query) keeps them awake. Restore from the dashboard if paused.

---

## 1b. Optional: local WSL Postgres

Only if you want a local DB instead of Supabase:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib postgresql-16-pgvector
sudo service postgresql start

sudo -u postgres psql <<'SQL'
CREATE USER tias WITH PASSWORD 'tias' CREATEDB;
CREATE DATABASE thereisasiteforthat OWNER tias;
\c thereisasiteforthat
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
GRANT ALL ON SCHEMA public TO tias;
SQL
```

```bash
DATABASE_URL=postgresql://tias:tias@localhost:5432/thereisasiteforthat
```

---

## 2. Fill `.env`

```bash
cp .env.example .env
```

Set at least:

```bash
DATABASE_URL=...                 # Supabase pooler URI
DATABASE_URL_DIRECT=...          # Supabase direct URI (migrations)
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=paste-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini   # used only when top match is below threshold
AUTH_SECRET=paste-openssl-rand-hex-32
AUTH_GOOGLE_ID=                 # Google OAuth client ID
AUTH_GOOGLE_SECRET=             # Google OAuth client secret
```

Google OAuth redirect URI (Cloud Console):

```text
http://localhost:3000/api/auth/callback/google
```

Production: `https://YOUR_DOMAIN/api/auth/callback/google`.

Generate a session secret:

```bash
openssl rand -hex 32
```

---

## 3. Migrate + seed + embed

```bash
npm run db:migrate    # uses DATABASE_URL_DIRECT if set
npm run db:seed
npm run db:embed      # needs OPENAI_API_KEY
npm run dev
```

Then search works end-to-end:

1. Homepage: type ≥2 characters → instant results with confidence %
2. Enter → `/search/{slug}` SSR page
3. **Visit site** logs `POST /api/click` then opens the outbound URL
4. Without embeddings, search falls back to keyword / seed catalog

---

## 4. Admin

- Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Sign in with `ADMIN_PASSWORD`

---

## 5. Deploy (optional)

1. Push repo to GitHub  
2. Import on Vercel / Render / etc.  
3. Add the same env vars (`DATABASE_URL` = Supabase pooler, admin + OpenAI keys)  
4. Set `NEXT_PUBLIC_SITE_URL` to the production URL  

---

## Done when

- [ ] Supabase project created; `vector` + `pg_trgm` enabled  
- [ ] `.env` filled (`DATABASE_URL`, `DATABASE_URL_DIRECT`, admin vars, OpenAI)  
- [ ] `db:migrate` succeeds  
- [ ] `db:seed` succeeds  
- [ ] `db:embed` succeeds  
- [ ] Password signs you into `/admin`  
- [ ] Homepage instant search returns ranked results  
