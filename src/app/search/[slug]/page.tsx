import Link from "next/link";

import { SearchBox } from "@/features/search/SearchBox";
import { SearchResultsList } from "@/features/search/SearchResultsList";
import { getSearchPageBySlug } from "@/lib/repositories/search-pages";
import {
  queryFromSearchSlug,
  searchSites,
} from "@/lib/services/search";

type SearchPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SearchPageProps) {
  const { slug } = await params;
  const page = await getSearchPageBySlug(slug).catch(() => null);
  const query = queryFromSearchSlug(slug, page?.query);
  return {
    title: `Best websites to ${query}`,
    description: `Find the best website for: ${query}.`,
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { slug } = await params;
  const page = await getSearchPageBySlug(slug).catch(() => null);
  const query = queryFromSearchSlug(slug, page?.query);

  const data = await searchSites({
    query,
    limit: 10,
    recordPageHit: true,
  });

  const heading =
    data.query.length > 0
      ? data.query.charAt(0).toUpperCase() + data.query.slice(1)
      : query.charAt(0).toUpperCase() + query.slice(1);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Search
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Ranked matches with confidence scores from the curated catalog.
        </p>
        <div className="mt-8 max-w-xl">
          <SearchBox autoFocus={false} showInstantResults={false} />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <SearchResultsList
          query={data.query}
          mode={data.mode}
          results={data.results}
          aiSummary={data.aiSummary}
        />
      </section>

      <Link
        href="/"
        className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
      >
        ← Back to home
      </Link>
    </main>
  );
}
