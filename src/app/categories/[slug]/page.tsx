import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHead } from "@/components/ui/PageHead";
import { SiteList } from "@/features/sites/SiteList";
import { accentStyle } from "@/lib/design/accent";
import { getSiteUrl } from "@/lib/env";
import { JsonLd } from "@/lib/seo/json-ld";
import { breadcrumbList } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/url";
import { listCatalogSitesByCategory } from "@/lib/services/catalog";
import { listVerdicts } from "@/lib/services/votes";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await listCatalogSitesByCategory(slug);
  if (!data) {
    return { title: "Category not found", robots: { index: false, follow: true } };
  }
  return {
    title: `Best ${data.category.name} websites`,
    description:
      data.category.description ?? `Best websites for ${data.category.name}.`,
    alternates: {
      canonical: absoluteUrl(getSiteUrl(), `/categories/${slug}`),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await listCatalogSitesByCategory(slug);
  if (!data) {
    notFound();
  }

  const verdicts = await listVerdicts(data.sites.map((site) => site.id));
  const siteUrl = getSiteUrl();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${data.category.name} websites`,
    description: data.category.description ?? undefined,
    url: absoluteUrl(siteUrl, `/categories/${slug}`),
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
            { name: "Categories", path: "/categories" },
            { name: data.category.name, path: `/categories/${slug}` },
          ]),
        ]}
      />

      <PageHead
        label="Categories"
        labelHref="/categories"
        title={data.category.name}
        lead={data.category.description}
        stat={{
          value: String(data.sites.length).padStart(2, "0"),
          caption: "Sites",
        }}
      />
      <SiteList
        sites={data.sites}
        showCategory={false}
        verdicts={verdicts}
        emptyMessage="No published sites in this category yet."
      />
    </main>
  );
}
