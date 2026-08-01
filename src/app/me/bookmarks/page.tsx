import Link from "next/link";

import { listCurrentUserBookmarks } from "@/lib/services/bookmarks";
import { pricingLabel } from "@/lib/utils/pricing";

export default async function MeBookmarksPage() {
  const bookmarks = await listCurrentUserBookmarks();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link href="/me" className="transition hover:text-[var(--ink)]">
            Account
          </Link>
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Bookmarks
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          {bookmarks.length === 0
            ? "Sites you save will show up here."
            : `${bookmarks.length} saved site${bookmarks.length === 1 ? "" : "s"}.`}
        </p>
      </section>

      <section className="panel overflow-hidden">
        {bookmarks.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
            Browse the{" "}
            <Link href="/categories" className="text-[var(--accent)]">
              catalog
            </Link>{" "}
            and bookmark anything useful.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {bookmarks.map((site) => (
              <li key={site.id}>
                <Link
                  href={`/site/${site.slug}`}
                  className="flex flex-col gap-2 px-6 py-5 transition hover:bg-[var(--surface)] sm:flex-row sm:items-start sm:justify-between sm:px-8"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-base font-semibold text-[var(--ink)]">
                        {site.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {pricingLabel(site.pricing)}
                        {Number.isFinite(site.rating)
                          ? ` · ${site.rating.toFixed(1)}★`
                          : null}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      {site.description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {site.categoryName}
                      {site.tags.length > 0
                        ? ` · ${site.tags.slice(0, 3).join(" · ")}`
                        : null}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-[var(--accent)]">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
