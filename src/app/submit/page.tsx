import type { Metadata } from "next";

import { SubmitForm } from "@/features/submissions/SubmitForm";
import { listCatalogCategories } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Submit a site",
  description: "Suggest a website for the ThereIsASiteForThat directory.",
};

export default async function SubmitPage() {
  const categories = await listCatalogCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Submit a site
        </h1>
        <p className="mt-4 text-[var(--muted)]">
          Suggest a website for the directory. Submissions are reviewed before
          publishing — quality over volume.
        </p>
        <SubmitForm
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
          }))}
        />
      </section>
    </main>
  );
}
