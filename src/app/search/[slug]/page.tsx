import type { Metadata } from "next";
import { headers } from "next/headers";
import { after } from "next/server";
import { Suspense } from "react";

import { PageHead } from "@/components/ui/PageHead";
import { SearchBox } from "@/features/search/SearchBox";
import { SearchResultsList } from "@/features/search/SearchResultsList";
import { getSiteUrl } from "@/lib/env";
import { getSearchPageBySlug } from "@/lib/repositories/search-pages";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
import {
  queryFromSearchSlug,
  recordSearchPageHit,
  searchSites,
  type SearchResponseData,
} from "@/lib/services/search";
import {
  checkRateLimit,
  clientIpFromHeaders,
  looksLikeBot,
} from "@/lib/utils/rate-limit";

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

function ResultsBlock({
  data,
  heading,
  intro,
  canonical,
  siteUrl,
  pending = false,
}: {
  data: SearchResponseData;
  heading: string;
  intro: string;
  canonical: string;
  siteUrl: string;
  pending?: boolean;
}) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best websites to ${data.query}`,
    description: intro,
    url: canonical,
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
    <>
      {pending ? null : <JsonLd data={itemList} />}

      <PageHead
        label="Search"
        labelHref="/"
        title={heading}
        lead={intro}
        stat={{
          value: String(data.results.length).padStart(2, "0"),
          caption: pending ? "So far" : "Matches",
        }}
      />

      {pending ? (
        <p className="label label-accent pb-6">Looking beyond the catalog…</p>
      ) : null}

      <SearchResultsList
        query={data.query}
        mode={data.mode}
        results={data.results}
        aiSummary={data.aiSummary}
      />
    </>
  );
}

/**
 * The slow half of the page.
 *
 * Ranking and discovery cost a model call, which is most of the wait, so it
 * streams: the catalog answer above renders as soon as the vector search is
 * done, and this replaces it when the model has finished thinking.
 */
async function AssistedResults({
  query,
  heading,
  intro,
  canonical,
  siteUrl,
}: {
  query: string;
  heading: string;
  intro: string;
  canonical: string;
  siteUrl: string;
}) {
  const data = await searchSites({
    query,
    limit: 10,
    recordPageHit: true,
    allowDiscovery: true,
  });

  return (
    <ResultsBlock
      data={data}
      heading={heading}
      intro={intro}
      canonical={canonical}
      siteUrl={siteUrl}
    />
  );
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { slug } = await params;
  const page = await getSearchPageBySlug(slug).catch(() => null);
  const query = queryFromSearchSlug(slug, page?.query);
  const siteUrl = getSiteUrl();
  const canonical = absoluteUrl(siteUrl, `/search/${slug}`);

  const requestHeaders = await headers();

  /**
   * Only a real visit gets to spend a model call.
   *
   * Every "Similar searches" link on a site page, every example chip, every
   * rotating headline points at one of these URLs, and the router prefetches
   * links as they enter the viewport. That is a machine following a link, not
   * a person asking a question, and it was running discovery hundreds of times
   * over for queries nobody typed. A prefetch renders from the catalog only.
   */
  const isPrefetch = requestHeaders.get("next-router-prefetch") !== null;

  /**
   * Crawlers get the same treatment, and for the same reason: these URLs are
   * in the sitemap, so a crawl is otherwise a standing order to run a model
   * call per page. Bots are served the catalog, which is what they should be
   * indexing anyway.
   */
  const isBot = looksLikeBot(requestHeaders.get("user-agent"));

  /**
   * Human visits are still budgeted per IP. Over it, the page renders from the
   * catalog rather than failing.
   */
  const ip = clientIpFromHeaders(requestHeaders);
  const allowDiscovery =
    !isPrefetch &&
    !isBot &&
    checkRateLimit({
      key: `discover:${ip}`,
      limit: 10,
      windowMs: 60 * 1000,
    }).ok;

  // Fast pass: catalog only, no model call, so the page has something to show
  // in a few hundred milliseconds.
  const fast = await searchSites({
    query,
    limit: 10,
    recordPageHit: false,
    allowDiscovery: false,
  });

  // A confident catalog answer is the whole answer. Nothing to wait for.
  const assist = allowDiscovery && fast.mode !== "curated";

  // Whichever pass produced what the reader ends up seeing logs the hit, once.
  if (!assist) {
    after(() =>
      recordSearchPageHit({
        query: fast.query,
        slug: fast.slug,
        mode: fast.mode,
        results: fast.results,
        threshold: fast.threshold,
      }),
    );
  }

  const heading =
    fast.query.length > 0
      ? fast.query.charAt(0).toUpperCase() + fast.query.slice(1)
      : query.charAt(0).toUpperCase() + query.slice(1);

  const intro =
    page?.intro?.trim() ||
    `Looking for a website to ${fast.query || query}? Here are the strongest matches from our curated catalog, ranked by relevance.`;

  const blockProps = { heading, intro, canonical, siteUrl };

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      {assist ? (
        <Suspense
          fallback={<ResultsBlock data={fast} {...blockProps} pending />}
        >
          <AssistedResults query={query} {...blockProps} />
        </Suspense>
      ) : (
        <ResultsBlock data={fast} {...blockProps} />
      )}

      <section className="mt-24">
        <p className="label pb-5">Search again</p>
        <SearchBox autoFocus={false} showInstantResults={false} size="inline" />
      </section>
    </main>
  );
}
