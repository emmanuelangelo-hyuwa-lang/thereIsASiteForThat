import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookmarkButton } from "@/features/bookmarks/BookmarkButton";
import { VisitSiteLink } from "@/features/search/VisitSiteLink";
import { SiteList } from "@/features/sites/SiteList";
import { getSiteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
import { getBookmarkState } from "@/lib/services/bookmarks";
import {
  getCatalogSiteBySlug,
  listCatalogAlternatives,
} from "@/lib/services/catalog";
import { pricingLabel } from "@/lib/utils/pricing";

type SitePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await getCatalogSiteBySlug(slug);
  if (!site) {
    return { title: "Site not found" };
  }

  const siteUrl = getSiteUrl();
  return {
    title: `${site.name} — best for ${site.tags[0] ?? site.categoryName}`,
    description: site.description,
    alternates: {
      canonical: absoluteUrl(siteUrl, `/site/${slug}`),
    },
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const site = await getCatalogSiteBySlug(slug);
  if (!site) {
    notFound();
  }

  const [alternatives, bookmarkState] = await Promise.all([
    listCatalogAlternatives(site, 6),
    getBookmarkState(site.id),
  ]);
  const siteUrl = getSiteUrl();

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    url: site.url,
    description: site.description,
    applicationCategory: site.categoryName,
    offers: {
      "@type": "Offer",
      category: pricingLabel(site.pricing),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 1,
    },
    mainEntityOfPage: absoluteUrl(siteUrl, `/site/${site.slug}`),
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <JsonLd data={appLd} />
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          <Link
            href={`/categories/${site.categorySlug}`}
            className="transition hover:text-[var(--ink)]"
          >
            {site.categoryName}
          </Link>
        </p>
        <h1 className="mt-3 break-words font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {site.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          {site.description}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <span>{pricingLabel(site.pricing)}</span>
          <span aria-hidden="true">·</span>
          <span>{site.rating.toFixed(1)}★ editor score</span>
          <span aria-hidden="true">·</span>
          <span>{site.tags.slice(0, 5).join(" · ")}</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <VisitSiteLink
            href={site.url}
            siteId={site.id}
            source="detail"
            className="inline-flex rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Visit site
          </VisitSiteLink>
          <BookmarkButton
            siteId={site.id}
            initialBookmarked={bookmarkState.bookmarked}
            bookmarkable={bookmarkState.bookmarkable}
            callbackPath={`/site/${site.slug}`}
          />
          <Link
            href={`/search/${site.tags[0] ? site.tags[0].replace(/\s+/g, "-") : site.categorySlug}`}
            className="inline-flex rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--accent)]/40"
          >
            Similar searches
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel px-6 py-7 sm:px-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Pros
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]">
            {site.pros.map((pro) => (
              <li key={pro} className="flex gap-2">
                <span className="text-[var(--accent)]" aria-hidden="true">
                  +
                </span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel px-6 py-7 sm:px-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Cons
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--ink)]">
            {site.cons.map((con) => (
              <li key={con} className="flex gap-2">
                <span className="text-[var(--muted)]" aria-hidden="true">
                  −
                </span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {alternatives.length > 0 ? (
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-4 sm:px-8">
            <h2 className="text-sm font-medium text-[var(--ink)]">Alternatives</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Other strong options in {site.categoryName.toLowerCase()}.
            </p>
          </div>
          <SiteList sites={alternatives} showCategory={false} />
        </section>
      ) : null}

      <Link
        href="/"
        className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
      >
        ← Back to search
      </Link>
    </main>
  );
}
