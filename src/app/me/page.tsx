import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import {
  getCurrentUserBookmarkCount,
  listCurrentUserBookmarks,
} from "@/lib/services/bookmarks";

export default async function MePage() {
  const session = await auth();
  const [count, recent] = await Promise.all([
    getCurrentUserBookmarkCount(),
    listCurrentUserBookmarks(),
  ]);
  const recentThree = recent.slice(0, 3);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Your account
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {session?.user?.name ?? "Saved stuff"}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Bookmarks sync across devices. Search stays public — this hub is only for what you save.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/me/bookmarks"
            className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            View bookmarks ({count})
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)]/40"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-4 sm:px-8">
          <h2 className="text-sm font-medium text-[var(--ink)]">Recent bookmarks</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Latest sites you saved.
          </p>
        </div>
        {recentThree.length === 0 ? (
          <p className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
            No bookmarks yet. Open any site page and tap Bookmark.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentThree.map((site) => (
              <li key={site.id}>
                <Link
                  href={`/site/${site.slug}`}
                  className="flex flex-col gap-1 px-6 py-5 transition hover:bg-[var(--surface)] sm:px-8"
                >
                  <span className="font-semibold text-[var(--ink)]">{site.name}</span>
                  <span className="text-sm text-[var(--muted)]">{site.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
