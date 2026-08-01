import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteList } from "@/features/sites/SiteList";
import { getSiteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/url";
import { getCatalogCollectionBySlug } from "@/lib/services/catalog";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCatalogCollectionBySlug(slug);
  if (!data) {
    return { title: "Collection not found" };
  }

  const siteUrl = getSiteUrl();
  return {
    title: data.collection.name,
    description: data.collection.description,
    alternates: {
      canonical: absoluteUrl(siteUrl, `/collections/${slug}`),
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const data = await getCatalogCollectionBySlug(slug);
  if (!data) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: data.collection.name,
    description: data.collection.description,
    url: absoluteUrl(siteUrl, `/collections/${slug}`),
    numberOfItems: data.sites.length,
    itemListElement: data.sites.map((site, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: site.name,
      url: absoluteUrl(siteUrl, `/site/${site.slug}`),
      description: site.description,
    })),
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <JsonLd data={itemList} />
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Collection
        </p>
        <h1 className="mt-3 break-words font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {data.collection.name}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          {data.collection.description}
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {data.sites.length} curated sites
        </p>
      </section>

      <section className="panel overflow-hidden">
        <SiteList
          sites={data.sites}
          emptyMessage="No published sites in this collection yet."
        />
      </section>

      <Link
        href="/collections"
        className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
      >
        ← All collections
      </Link>
    </main>
  );
}
