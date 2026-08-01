import type { Metadata } from "next";
import Link from "next/link";

import { listCatalogCategories } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse useful websites by category.",
};

export default async function CategoriesPage() {
  const categories = await listCatalogCategories();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Categories
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Browse the directory by task area when you know the kind of tool you need.
        </p>
      </section>

      <section className="panel overflow-hidden">
        <ul className="divide-y divide-[var(--border)]">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="flex flex-col gap-1 px-6 py-5 transition hover:bg-[var(--surface)] sm:flex-row sm:items-baseline sm:justify-between sm:px-8"
              >
                <span className="min-w-0">
                  <span className="block text-base font-medium text-[var(--ink)]">
                    {category.name}
                  </span>
                  {category.description ? (
                    <span className="mt-1 block text-sm text-[var(--muted)]">
                      {category.description}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  {category.siteCount} sites
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
