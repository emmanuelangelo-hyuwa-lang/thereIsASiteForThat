import Link from "next/link";

import { PageHead } from "@/components/ui/PageHead";
import { listCurrentUserBookmarks } from "@/lib/services/bookmarks";
import { pricingLabel } from "@/lib/utils/pricing";

export default async function MeBookmarksPage() {
  const bookmarks = await listCurrentUserBookmarks();

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Account"
        labelHref="/me"
        title="Bookmarks"
        lead={
          bookmarks.length === 0
            ? "Sites you save land here."
            : "Everything you kept, newest first."
        }
        stat={{
          value: String(bookmarks.length).padStart(2, "0"),
          caption: "Saved sites",
        }}
      >
        {bookmarks.length === 0 ? (
          <Link href="/categories" className="btn btn-accent h-12 px-6">
            Browse the catalog
          </Link>
        ) : null}
      </PageHead>

      {bookmarks.length === 0 ? (
        <p className="border-t border-[var(--hair)] py-16 text-[var(--muted)]">
          Nothing saved yet. Open any site page and tap Bookmark.
        </p>
      ) : (
        <ul>
          {bookmarks.map((site, index) => (
            <li key={site.id} className="border-t border-[var(--hair)]">
              <Link
                href={`/site/${site.slug}`}
                className="row flex items-start gap-5 rounded-[var(--r-m)] px-3 py-6 sm:gap-8 sm:px-4"
              >
                <span className="numeral row-index mt-1 w-8 shrink-0 text-base text-[var(--muted)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="headline block text-2xl text-[var(--ink)] sm:text-3xl">
                    {site.name}
                  </span>
                  <span className="copy mt-2 block max-w-2xl text-[var(--muted)]">
                    {site.description}
                  </span>
                  <span className="label mt-3 block">
                    {pricingLabel(site.pricing)} / {site.categoryName}
                  </span>
                </span>
                <span className="numeral shrink-0 text-3xl text-[var(--ink)] sm:text-4xl">
                  {site.rating.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
