import Link from "next/link";

import { listCategories } from "@/lib/repositories/categories";
import { listSitesForAdmin } from "@/lib/repositories/sites";

export default async function AdminDashboardPage() {
  let siteCount = 0;
  let publishedCount = 0;
  let categoryCount = 0;
  let missingEmbeddings = 0;
  let dbReady = true;

  try {
    const [sites, categories] = await Promise.all([
      listSitesForAdmin(),
      listCategories(),
    ]);
    siteCount = sites.length;
    publishedCount = sites.filter((site) => site.status === "published").length;
    missingEmbeddings = sites.filter(
      (site) => site.status === "published" && !site.hasEmbedding,
    ).length;
    categoryCount = categories.length;
  } catch {
    dbReady = false;
  }

  return (
    <section className="panel px-6 py-8 sm:px-8">
      <h1 className="headline text-3xl text-[var(--ink)]">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Manage the directory catalog. Seed and embeddings run from the CLI.
      </p>

      {!dbReady ? (
        <p className="mt-6 rounded-[var(--r-s)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          Database is not connected yet. Add <code>DATABASE_URL</code> and run migrations.
        </p>
      ) : (
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Sites" value={siteCount} />
          <Stat label="Published" value={publishedCount} />
          <Stat label="Categories" value={categoryCount} />
          <Stat label="Missing embeddings" value={missingEmbeddings} />
        </dl>
      )}

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link
          href="/admin/sites"
          className="rounded-[var(--r-s)] border border-[var(--border)] px-4 py-2 text-[var(--ink)] transition hover:bg-[var(--layer-2)]"
        >
          Browse sites
        </Link>
        <Link
          href="/admin/submissions"
          className="rounded-[var(--r-s)] border border-[var(--border)] px-4 py-2 text-[var(--ink)] transition hover:bg-[var(--layer-2)]"
        >
          Submissions
        </Link>
        <Link
          href="/admin/sites/new"
          className="rounded-[var(--r-s)] bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--on-accent)] transition hover:opacity-90"
        >
          Add site
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[var(--r-m)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <dt className="label">{label}</dt>
      <dd className="mt-2 numeral text-4xl text-[var(--ink)]">{value}</dd>
    </div>
  );
}
