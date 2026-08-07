import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHead } from "@/components/ui/PageHead";
import { SiteList } from "@/features/sites/SiteList";
import { accentStyle } from "@/lib/design/accent";
import { getSiteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbList } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/url";
import { getCatalogCollectionBySlug } from "@/lib/services/catalog";
import { listVerdicts } from "@/lib/services/votes";

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

  const verdicts = await listVerdicts(data.sites.map((site) => site.id));
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
    <main style={accentStyle(slug)} className="shell flex flex-1 flex-col pb-10">
      <JsonLd
        data={[
          itemList,
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Collections", path: "/collections" },
            { name: data.collection.name, path: `/collections/${slug}` },
          ]),
        ]}
      />
      <PageHead
        label="Collections"
        labelHref="/collections"
        title={data.collection.name}
        lead={data.collection.description}
        stat={{
          value: String(data.sites.length).padStart(2, "0"),
          caption: "Curated sites",
        }}
      />
      <SiteList
        sites={data.sites}
        emptyMessage="No published sites in this collection yet."
        verdicts={verdicts}
      />
    </main>
  );
}
