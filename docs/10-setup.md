# Local Setup Checklist

What **you** need to do to unlock Phase 2 (database + admin + seed).

The app talks to **Postgres on WSL** (not Docker, not Supabase). OpenAI can wait until search/embeddings.

---

## 1. Install Postgres + pgvector on WSL

In your WSL terminal (Ubuntu/Debian assumed):

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start the service if needed
sudo service postgresql start

# Create an app user + database (adjust names/password)
sudo -u postgres psql <<'SQL'
CREATE USER tias WITH PASSWORD 'tias' CREATEDB;
CREATE DATABASE thereisasiteforthat OWNER tias;
\c thereisasiteforthat
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
GRANT ALL ON SCHEMA public TO tias;
SQL
```

### pgvector package notes

If `CREATE EXTENSION vector` fails, install pgvector for your Postgres major version, e.g.:

```bash
# Check version
psql --version

# Example for PG16 on Ubuntu — package name varies by distro/version
sudo apt install -y postgresql-16-pgvector
# or build from https://github.com/pgvector/pgvector if no package exists
```

Then reconnect and run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Connection string for local WSL:

```text
postgresql://tias:tias@localhost:5432/thereisasiteforthat
```

Confirm it works:

```bash
psql "postgresql://tias:tias@localhost:5432/thereisasiteforthat" -c '\dx'
```

You should see `vector` (and ideally `pg_trgm`) listed.

---

## 2. Fill `.env.local`

```bash
cp .env.example .env.local
```

Set at least:

```bash
DATABASE_URL=postgresql://tias:tias@localhost:5432/thereisasiteforthat
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=paste-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Generate a session secret:

```bash
openssl rand -hex 32
```

OpenAI can stay empty for now:

```bash
OPENAI_API_KEY=
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Fill `OPENAI_API_KEY` later before `npm run db:embed` / semantic search.

---

## 3. Migrate + seed

```bash
npm run db:migrate    # or: npm run db:push
npm run db:seed       # ~12 categories, ~70 sites, 7 collections
npm run dev
```

When OpenAI is ready:

```bash
npm run db:embed
```

Then search works end-to-end:

1. Homepage: type ≥2 characters → instant results with confidence %
2. Enter → `/search/{slug}` SSR page
3. **Visit site** logs `POST /api/click` then opens the outbound URL
4. Without embeddings / OpenAI, search falls back to `pg_trgm` keyword matches

---

## 4. Admin

- Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Sign in with `ADMIN_PASSWORD`

---

## 5. Deploy (optional)

1. Push repo to GitHub
2. Import on Vercel (or your host)
3. Add the same env vars
4. Point `DATABASE_URL` at a hosted Postgres for production (WSL is local-dev only)
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL

---

## Done when

- [ ] WSL Postgres with pgvector reachable
- [ ] `.env.local` filled (`DATABASE_URL`, admin vars)
- [ ] `db:migrate` succeeds
- [ ] `db:seed` succeeds
- [ ] Password signs you into `/admin`
- [ ] `OPENAI_API_KEY` set + `db:embed` succeeds
- [ ] Homepage instant search returns ranked results
