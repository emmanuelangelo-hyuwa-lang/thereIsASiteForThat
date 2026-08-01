import type { Metadata } from "next";
import Link from "next/link";

import { SaveSearchButton } from "@/features/search/SaveSearchButton";
import { SearchBox } from "@/features/search/SearchBox";
import { SearchResultsList } from "@/features/search/SearchResultsList";
import { getSiteUrl } from "@/lib/env";
import { getSearchPageBySlug } from "@/lib/repositories/search-pages";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
import { getSavedSearchState } from "@/lib/services/saved-searches";
import {
  queryFromSearchSlug,
  searchSites,
} from "@/lib/services/search";

type SearchPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSearchPageBySlug(slug).catch(() => null);
  const query = queryFromSearchSlug(slug, page?.query);
  const siteUrl = getSiteUrl();
  const indexable = page?.isIndexable ?? false;

  return {
    title: `Best websites to ${query}`,
    description: `Find the best website for: ${query}. Ranked matches from the ThereIsASiteForThat curated catalog.`,
    alternates: {
      canonical: absoluteUrl(siteUrl, `/search/${slug}`),
    },
    robots: {
      index: indexable,
      follow: true,
    },
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { slug } = await params;
  const page = await getSearchPageBySlug(slug).catch(() => null);
  const query = queryFromSearchSlug(slug, page?.query);
  const siteUrl = getSiteUrl();

  const data = await searchSites({
    query,
    limit: 10,
    recordPageHit: true,
  });
  const savedState = await getSavedSearchState(data.query);

  const heading =
    data.query.length > 0
      ? data.query.charAt(0).toUpperCase() + data.query.slice(1)
      : query.charAt(0).toUpperCase() + query.slice(1);

  const intro =
    page?.intro?.trim() ||
    `Looking for a website to ${data.query || query}? Here are the strongest matches from our curated catalog, ranked by relevance.`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best websites to ${data.query || query}`,
    description: intro,
    url: absoluteUrl(siteUrl, `/search/${slug}`),
    numberOfItems: data.results.length,
    itemListElement: data.results.map((result, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: result.name,
      url: absoluteUrl(siteUrl, `/site/${result.slug}`),
      description: result.description,
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <JsonLd data={itemList} />
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Search
        </p>
        <h1 className="mt-3 break-words font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">{intro}</p>
        <div className="mt-8 max-w-xl">
          <SearchBox autoFocus={false} showInstantResults={false} />
        </div>
        <div className="mt-4">
          <SaveSearchButton
            query={data.query}
            initialSaved={savedState.saved}
            callbackPath={`/search/${slug}`}
          />
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
