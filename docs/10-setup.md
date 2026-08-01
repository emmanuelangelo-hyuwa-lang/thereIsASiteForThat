# Local Setup Checklist

What **you** need to do to unlock Phase 2 (database + admin + seed).

The app code for Phase 2 is in the repo. Until the env is filled, admin/search stay offline.

---

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → New project
2. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose to client)
3. Copy from **Project Settings → Database**:
   - Connection string (URI) → `DATABASE_URL`
   - Prefer the **Transaction** pooler URI for serverless, or direct URI for local scripts
   - If migrations fail on prepared statements, use the pooler and keep `prepare: false` (already set)

---

## 2. Enable Auth email (magic link)

1. Supabase → **Authentication → Providers → Email** → enabled
2. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000` (local)
   - Redirect URLs: `http://localhost:3000/admin/auth/callback`
3. For production later, add your Vercel URL + `/admin/auth/callback`

---

## 3. Enable pgvector

In Supabase **SQL Editor**, if extensions didn’t apply via migration:

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;
```

(Our `drizzle/0000_init.sql` also creates these.)

---

## 4. Fill `.env.local`

```bash
cp .env.example .env.local
```

Set at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
OPENAI_API_KEY=...                 # for embeddings
ADMIN_EMAILS=you@example.com       # your login email
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 5. Migrate + seed + embed

```bash
npm run db:migrate    # or: npm run db:push
npm run db:seed       # ~12 categories, ~70 sites, 7 collections
npm run db:embed      # writes pgvector embeddings (costs a little OpenAI $)
npm run dev
```

Then open:

- Site: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Use an email listed in `ADMIN_EMAILS`.

---

## 6. Deploy (Phase 1 exit)

1. Push repo to GitHub
2. Import on Vercel
3. Add the same env vars in Vercel project settings
4. Set `NEXT_PUBLIC_SITE_URL` to the Vercel URL
5. Add that URL to Supabase Auth redirect allowlist

---

## Done when

- [ ] Supabase project created
- [ ] `.env.local` filled
- [ ] `db:migrate` succeeds
- [ ] `db:seed` succeeds
- [ ] `db:embed` succeeds
- [ ] Magic link signs you into `/admin`
- [ ] Vercel preview deployed (optional but recommended)
