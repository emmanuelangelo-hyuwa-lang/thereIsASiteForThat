import Link from "next/link";

import { deleteSavedSearchAction } from "@/app/actions/saved-searches";
import { PageHead } from "@/components/ui/PageHead";
import { listCurrentUserSavedSearches } from "@/lib/services/saved-searches";

export default async function MeSearchesPage() {
  const searches = await listCurrentUserSavedSearches();

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Account"
        labelHref="/me"
        title="Saved searches"
        lead={
          searches.length === 0
            ? "Save a query from any results page to reopen it later."
            : "Reopen a question you already asked."
        }
        stat={{
          value: String(searches.length).padStart(2, "0"),
          caption: "Saved queries",
        }}
      >
        {searches.length === 0 ? (
          <Link href="/search/compress-a-pdf" className="btn btn-accent h-12 px-6">
            Try a search
          </Link>
        ) : null}
      </PageHead>

      {searches.length === 0 ? (
        <p className="border-t border-[var(--hair)] py-16 text-[var(--muted)]">
          Nothing saved yet.
        </p>
      ) : (
        <ul>
          {searches.map((item, index) => (
            <li
              key={item.id}
              className="row flex items-center gap-5 border-t border-[var(--hair)] px-3 py-6 sm:gap-8 sm:px-4"
            >
              <span className="numeral row-index w-8 shrink-0 text-base text-[var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/search/${item.slug}`}
                  className="headline block truncate text-2xl text-[var(--ink)] hover-ink-accent sm:text-3xl"
                >
                  {item.query}
                </Link>
                <p className="label mt-2">
                  Saved{" "}
                  {item.createdAt.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <form
                className="shrink-0"
                action={async () => {
                  "use server";
                  await deleteSavedSearchAction(item.id);
                }}
              >
                <button type="submit" className="btn btn-quiet h-11 px-5">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
