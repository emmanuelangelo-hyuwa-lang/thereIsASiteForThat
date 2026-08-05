import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/components/ui/PageHead";
import { accentStyle } from "@/lib/design/accent";
import { listCatalogCategories } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse useful websites by category.",
};

export default async function CategoriesPage() {
  const categories = await listCatalogCategories();
  const total = categories.reduce(
    (sum, category) => sum + category.siteCount,
    0,
  );

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Catalog"
        labelHref="/"
        title="Categories"
        lead="Browse by task area when you already know the kind of tool you need."
        stat={{ value: String(total), caption: "Sites total" }}
      />

      <ul className="stagger stagger-scroll">
        {categories.map((category, index) => (
          <li
            key={category.slug}
            style={{ ...accentStyle(category.slug), ["--i" as string]: index }}
            className="border-t border-[var(--hair)]"
          >
            <Link
              href={`/categories/${category.slug}`}
              className="row flex items-center gap-6 rounded-[var(--r-m)] px-3 py-7 sm:px-4"
            >
              <span className="min-w-0 flex-1">
                <span className="headline block text-3xl text-[var(--ink)] sm:text-5xl">
                  {category.name}
                </span>
                {category.description ? (
                  <span className="copy mt-2 block max-w-xl text-[var(--muted)]">
                    {category.description}
                  </span>
                ) : null}
              </span>
              <span className="numeral row-index shrink-0 text-4xl text-[var(--muted)] sm:text-6xl">
                {String(category.siteCount).padStart(2, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
