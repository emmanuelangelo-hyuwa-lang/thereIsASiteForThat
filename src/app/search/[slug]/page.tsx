import type { Metadata } from "next";

import { PageHead } from "@/components/ui/PageHead";
import { SearchBox } from "@/features/search/SearchBox";
import { SearchResultsList } from "@/features/search/SearchResultsList";
import { getSiteUrl } from "@/lib/env";
import { getSearchPageBySlug } from "@/lib/repositories/search-pages";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
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
    <main className="shell flex flex-1 flex-col pb-10">
      <JsonLd data={itemList} />

      <PageHead
        label="Search"
        labelHref="/"
        title={heading}
        lead={intro}
        stat={{
          value: String(data.results.length).padStart(2, "0"),
          caption: "Matches",
        }}
      />

      <SearchResultsList
        query={data.query}
        mode={data.mode}
        results={data.results}
        aiSummary={data.aiSummary}
      />

      <section className="mt-24">
        <p className="label pb-5">Search again</p>
        <SearchBox autoFocus={false} showInstantResults={false} size="inline" />
      </section>
    </main>
  );
}
