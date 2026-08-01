import Link from "next/link";

import { deleteSavedSearchAction } from "@/app/actions/saved-searches";
import { listCurrentUserSavedSearches } from "@/lib/services/saved-searches";

export default async function MeSearchesPage() {
  const searches = await listCurrentUserSavedSearches();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link href="/me" className="transition hover:text-[var(--ink)]">
            Account
          </Link>
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Saved searches
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          {searches.length === 0
            ? "Save a query from any search results page to reopen it later."
            : `${searches.length} saved search${searches.length === 1 ? "" : "es"}.`}
        </p>
      </section>

      <section className="panel overflow-hidden">
        {searches.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
            Try a search like{" "}
            <Link href="/search/compress-a-pdf" className="text-[var(--accent)]">
              compress a pdf
            </Link>{" "}
            and tap Save search.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {searches.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="min-w-0">
                  <Link
                    href={`/search/${item.slug}`}
                    className="text-base font-semibold text-[var(--ink)] transition hover:text-[var(--accent)]"
                  >
                    {item.query}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Saved{" "}
                    {item.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/search/${item.slug}`}
                    className="text-sm font-medium text-[var(--accent)]"
                  >
                    Open →
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteSavedSearchAction(item.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-sm text-[var(--muted)] transition hover:text-[var(--ink)]"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
