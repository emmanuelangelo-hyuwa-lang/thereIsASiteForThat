# Local Setup Checklist

What **you** need to configure: Postgres + Ollama (open-source AI) + admin password.

The app talks to **Postgres on WSL** (not Docker, not Supabase). Semantic search uses **Ollama** by default — no OpenAI key required.

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
psql --version
sudo apt install -y postgresql-16-pgvector
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

## 2. Install Ollama (embeddings + chat)

```bash
# Linux / WSL (needs sudo once)
curl -fsSL https://ollama.com/install.sh | sh

# Start (if not already running as a service)
ollama serve
```

In another terminal, pull models:

```bash
ollama pull nomic-embed-text   # 768-dim embeddings (required for search)
ollama pull llama3.2           # chat summaries for soft matches
```

Smoke-test from the project:

```bash
npm run ai:check
```

Production note: Vercel cannot run Ollama in the serverless function. Point `OLLAMA_BASE_URL` at a machine/VPS that runs Ollama, or keep keyword search until you host embeddings elsewhere.

---

## 3. Fill `.env` (or `.env.local`)

```bash
cp .env.example .env
```

Set at least:

```bash
DATABASE_URL=postgresql://tias:tias@localhost:5432/thereisasiteforthat
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=paste-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=http://localhost:3000

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=llama3.2
EMBEDDING_DIMENSIONS=768
```

Generate a session secret:

```bash
openssl rand -hex 32
```

---

## 4. Migrate + seed + embed

```bash
npm run db:migrate    # or: npm run db:push
npm run db:seed       # ~12 categories, ~70 sites, 7 collections
npm run db:embed      # Ollama embeddings into pgvector
npm run dev
```

Then search works end-to-end:

1. Homepage: type ≥2 characters → instant results with confidence %
2. Enter → `/search/{slug}` SSR page
3. Soft matches get a short Ollama summary
4. **Visit site** logs `POST /api/click` then opens the outbound URL
5. Without Ollama / embeddings, search falls back to keyword + seed catalog

---

## 5. Admin

- Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Sign in with `ADMIN_PASSWORD`

---

## 6. Deploy (optional)

1. Push repo to GitHub
2. Import on Vercel (or your host)
3. Add the same env vars
4. Point `DATABASE_URL` at a hosted Postgres for production (WSL is local-dev only)
5. Point `OLLAMA_BASE_URL` at a reachable Ollama host (not `127.0.0.1` from Vercel)
6. Set `NEXT_PUBLIC_SITE_URL` to the production URL

---

## Done when

- [ ] WSL Postgres with pgvector reachable
- [ ] Ollama running + `nomic-embed-text` (+ optional `llama3.2`) pulled
- [ ] `.env` filled (`DATABASE_URL`, admin vars, Ollama vars)
- [ ] `npm run ai:check` succeeds
- [ ] `db:migrate` / `db:seed` / `db:embed` succeed
- [ ] Password signs you into `/admin`
- [ ] Homepage instant search returns ranked results
