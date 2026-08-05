import Link from "next/link";

import { listSitesForAdmin } from "@/lib/repositories/sites";

export default async function AdminSitesPage() {
  const sites = await listSitesForAdmin();

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5 sm:px-8">
        <div>
          <h1 className="headline text-3xl text-[var(--ink)]">
            Sites
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{sites.length} total</p>
        </div>
        <Link
          href="/admin/sites/new"
          className="rounded-[var(--r-s)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)] transition hover:opacity-90"
        >
          New site
        </Link>
      </div>

      {sites.length === 0 ? (
        <p className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
          No sites yet. Run <code>npm run db:seed</code> or create one manually.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {sites.map((site) => (
            <li key={site.id}>
              <Link
                href={`/admin/sites/${site.id}`}
                className="flex flex-col gap-1 px-6 py-4 transition hover:bg-[var(--surface)] sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div>
                  <p className="font-medium text-[var(--ink)]">{site.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {site.categoryName} · {site.pricing} · ★ {site.rating}
                  </p>
                </div>
                <div className="flex items-center gap-3 label">
                  <span>{site.status}</span>
                  <span>{site.hasEmbedding ? "embedded" : "no vector"}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
