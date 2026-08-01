import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteList } from "@/features/sites/SiteList";
import { listCatalogSitesByCategory } from "@/lib/services/catalog";

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

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Category
        </p>
        <h1 className="mt-3 break-words font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {data.category.name}
        </h1>
        {data.category.description ? (
          <p className="mt-4 max-w-xl text-[var(--muted)]">
            {data.category.description}
          </p>
        ) : null}
      </section>

      <section className="panel overflow-hidden">
        <SiteList sites={data.sites} showCategory={false} />
      </section>

      <Link
        href="/categories"
        className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
      >
        ← All categories
      </Link>
    </main>
  );
}
