import { notFound } from "next/navigation";

import { updateSiteAction } from "@/app/admin/actions";
import { SiteForm } from "@/features/admin/SiteForm";
import { listCategories } from "@/lib/repositories/categories";
import { getSiteById } from "@/lib/repositories/sites";

type EditSitePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    fromSubmission?: string;
    exists?: string;
  }>;
};

export default async function EditSitePage({
  params,
  searchParams,
}: EditSitePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [site, categories] = await Promise.all([getSiteById(id), listCategories()]);

  if (!site) {
    notFound();
  }

  return (
    <section className="panel px-6 py-8 sm:px-8">
      <h1 className="headline text-3xl text-[var(--ink)]">
        Edit {site.name}
      </h1>
      {query.fromSubmission ? (
        <p className="mt-4 rounded-[var(--r-s)] bg-[var(--layer-2)] px-4 py-3 text-sm text-[var(--ink)]">
          Draft created from the submission. Add pros, cons, pricing, and a
          score, then set status to <strong>published</strong> to put it live.
        </p>
      ) : null}
      {query.exists ? (
        <p className="mt-4 rounded-[var(--r-s)] bg-[var(--layer-2)] px-4 py-3 text-sm text-[var(--ink)]">
          That URL was already in the catalog. The submission is marked
          approved and this is the existing entry.
        </p>
      ) : null}
      {query.saved ? (
        <p className="mt-4 rounded-[var(--r-s)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]">
          Saved.
        </p>
      ) : null}
      {query.error ? (
        <p className="mt-4 rounded-[var(--r-s)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {query.error}
        </p>
      ) : null}
      <div className="mt-8">
        <SiteForm
          action={updateSiteAction}
          categories={categories}
          siteId={site.id}
          submitLabel="Save changes"
          initial={{
            name: site.name,
            slug: site.slug,
            url: site.url,
            description: site.description,
            categoryId: site.categoryId,
            pricing: site.pricing,
            pros: site.pros,
            cons: site.cons,
            rating: Number(site.rating),
            tags: site.tags,
            status: site.status,
          }}
        />
      </div>
    </section>
  );
}
