# Local Setup Checklist

What **you** need to do to unlock Phase 2 (database + admin + seed).

The app talks to a **custom Postgres** database (not Supabase). OpenAI can wait until search/embeddings.

---

## 1. Provision Postgres + pgvector

Use any Postgres host you like (local Docker, Railway, Neon, Render, VPS, etc.).

Requirements:

- Postgres 15+ recommended
- `vector` extension (pgvector)
- Optional: `pg_trgm`

Example local Docker:

```bash
docker run --name tias-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=thereisasiteforthat \
  -p 5432:5432 \
  -d pgvector/pgvector:pg16
```

Connection string shape:

```text
postgresql://USER:PASSWORD@HOST:5432/DBNAME
```

If extensions didn’t apply via migration, run:

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;
```

---

## 2. Fill `.env.local`

```bash
cp .env.example .env.local
```

Set at least:

```bash
DATABASE_URL=postgresql://...
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

---

## 4. Admin

- Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Sign in with `ADMIN_PASSWORD`

---

## 5. Deploy (optional)

1. Push repo to GitHub
2. Import on Vercel (or your host)
3. Add the same env vars
4. Point `DATABASE_URL` at your hosted Postgres
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL
6. Ensure the DB allows connections from your host (IP allowlist / SSL as needed)

---

## Done when

- [ ] Postgres with pgvector reachable
- [ ] `.env.local` filled (`DATABASE_URL`, admin vars)
- [ ] `db:migrate` succeeds
- [ ] `db:seed` succeeds
- [ ] Password signs you into `/admin`
- [ ] (Later) `OPENAI_API_KEY` set + `db:embed` succeeds
