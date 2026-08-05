import type { Metadata } from "next";

import { PageHead } from "@/components/ui/PageHead";
import { SubmitForm } from "@/features/submissions/SubmitForm";
import { listCatalogCategories } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Submit a site",
  description: "Suggest a website for the ThereIsASiteForThat directory.",
};

export default async function SubmitPage() {
  const categories = await listCatalogCategories();

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Open catalog"
        labelHref="/"
        title="Submit a site"
        lead="Every submission is reviewed by hand. Quality over volume. One great site beats ten passable ones."
      />

      <div className="max-w-2xl border-t border-[var(--hair)] pt-12">
        <SubmitForm
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
          }))}
        />
      </div>
    </main>
  );
}
