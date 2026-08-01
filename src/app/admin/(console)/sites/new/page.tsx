import { createSiteAction } from "@/app/admin/actions";
import { SiteForm } from "@/features/admin/SiteForm";
import { listCategories } from "@/lib/repositories/categories";

type NewSitePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewSitePage({ searchParams }: NewSitePageProps) {
  const categories = await listCategories();
  const params = await searchParams;

  return (
    <section className="panel px-6 py-8 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
        New site
      </h1>
      {params.error ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {params.error}
        </p>
      ) : null}
      <div className="mt-8">
        <SiteForm
          action={createSiteAction}
          categories={categories}
          submitLabel="Create site"
        />
      </div>
    </section>
  );
}
