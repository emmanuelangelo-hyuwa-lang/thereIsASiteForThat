import { notFound } from "next/navigation";

import { PageHead } from "@/components/ui/PageHead";
import { SiteList } from "@/features/sites/SiteList";
import { accentStyle } from "@/lib/design/accent";
import { listCatalogSitesByCategory } from "@/lib/services/catalog";
import { listVerdicts } from "@/lib/services/votes";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await listCatalogSitesByCategory(slug);
  if (!data) {
    return { title: "Category not found" };
  }
  return {
    title: data.category.name,
    description: data.category.description ?? `Best websites for ${data.category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await listCatalogSitesByCategory(slug);
  if (!data) {
    notFound();
  }

  const verdicts = await listVerdicts(data.sites.map((site) => site.id));

  return (
    <main style={accentStyle(slug)} className="shell flex flex-1 flex-col pb-10">
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
