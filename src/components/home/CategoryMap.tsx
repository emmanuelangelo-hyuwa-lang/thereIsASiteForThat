import Link from "next/link";

import type { CatalogCategory } from "@/lib/catalog/types";

type CategoryMapProps = {
  categories: CatalogCategory[];
};

export function CategoryMap({ categories }: CategoryMapProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            Browse by territory
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            A map of the catalog — PDF, design, writing, learning, and the rest of the useful web.
          </p>
        </div>
        <Link
          href="/categories"
          className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
        >
          All categories →
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-1 border-t border-[var(--border)] pt-2 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((category) => (
          <li key={category.slug} className="border-b border-[var(--border)]">
            <Link
              href={`/categories/${category.slug}`}
              className="flex items-baseline justify-between gap-3 py-3.5 text-sm transition hover:text-[var(--accent)]"
            >
              <span className="min-w-0 text-[var(--ink)]">{category.name}</span>
              <span className="shrink-0 tabular-nums text-[var(--muted)]">
                {category.siteCount}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
