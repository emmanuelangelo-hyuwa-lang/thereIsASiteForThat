import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { PageHead } from "@/components/ui/PageHead";
import { auth } from "@/auth";
import {
  getCurrentUserBookmarkCount,
  listCurrentUserBookmarks,
} from "@/lib/services/bookmarks";
import {
  getCurrentUserSavedSearchCount,
  listCurrentUserSavedSearches,
} from "@/lib/services/saved-searches";

export default async function MePage() {
  const session = await auth();
  const [bookmarkCount, recentBookmarks, searchCount, recentSearches] =
    await Promise.all([
      getCurrentUserBookmarkCount(),
      listCurrentUserBookmarks(),
      getCurrentUserSavedSearchCount(),
      listCurrentUserSavedSearches(),
    ]);
  const recentThree = recentBookmarks.slice(0, 3);
  const recentSearchThree = recentSearches.slice(0, 3);

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Account"
        labelHref="/"
        title={session?.user?.name ?? "Your shelf"}
        lead="Bookmarks and saved searches sync across devices. Search stays public."
      >
        <form action={signOutAction}>
          <button type="submit" className="btn btn-line h-12 px-6">
            Sign out
          </button>
        </form>
      </PageHead>

      <div className="grid gap-3 sm:grid-cols-2">
        <ShelfTile
          href="/me/bookmarks"
          label="Bookmarks"
          value={bookmarkCount}
          caption={
            recentThree.length === 0
              ? "Open any site and tap Bookmark"
              : recentThree.map((site) => site.name).join(" / ")
          }
        />
        <ShelfTile
          href="/me/searches"
          label="Saved searches"
          value={searchCount}
          caption={
            recentSearchThree.length === 0
              ? "Save a query from any results page"
              : recentSearchThree.map((item) => item.query).join(" / ")
          }
        />
      </div>

      {recentThree.length > 0 ? (
        <section className="mt-20">
          <p className="label pb-6">Recently bookmarked</p>
          <ul>
            {recentThree.map((site) => (
              <li key={site.id} className="border-t border-[var(--hair)]">
                <Link
                  href={`/site/${site.slug}`}
                  className="row flex items-center justify-between gap-6 rounded-[var(--r-m)] px-3 py-6 sm:px-4"
                >
                  <span className="min-w-0">
                    <span className="headline block text-2xl text-[var(--ink)]">
                      {site.name}
                    </span>
                    <span className="copy mt-1.5 block max-w-xl truncate text-[var(--muted)]">
                      {site.description}
                    </span>
                  </span>
                  <span className="numeral shrink-0 text-2xl text-[var(--ink)]">
                    {site.rating.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function ShelfTile({
  href,
  label,
  value,
  caption,
}: {
  href: string;
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <Link
      href={href}
      className="flood press flex min-h-[15rem] flex-col justify-between rounded-[var(--r-l)] p-7"
    >
      <span className="numeral text-[4.5rem] leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span>
        <span className="headline block text-3xl">{label}</span>
        <span className="flood-muted mt-2 block truncate text-sm">{caption}</span>
      </span>
    </Link>
  );
}
