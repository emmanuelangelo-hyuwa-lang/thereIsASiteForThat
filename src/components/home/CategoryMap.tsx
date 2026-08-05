import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import type { CatalogCategory } from "@/lib/catalog/types";
import { accentStyle } from "@/lib/design/accent";

type CategoryMapProps = {
  categories: CatalogCategory[];
};

/**
 * The home page only needs to prove the catalog is organised, not enumerate
 * it. Six chips and a way through; the full index is its own page.
 */
export function CategoryMap({ categories }: CategoryMapProps) {
  if (categories.length === 0) {
    return null;
  }

  const busiest = [...categories]
    .sort((a, b) => b.siteCount - a.siteCount)
    .slice(0, 6);

  return (
    <section id="categories" className="shell reveal">
      <SectionHead
        label="Territory"
        title="Categories"
        count={categories.length}
        href="/categories"
        hrefLabel="All categories"
      />

      <ul className="stagger stagger-scroll flex flex-wrap gap-2">
        {busiest.map((category, index) => (
          <li key={category.slug} style={{ ["--i" as string]: index }}>
            <Link
              href={`/categories/${category.slug}`}
              style={accentStyle(category.slug)}
              className="chip h-11 gap-3 px-5 text-sm"
            >
              {category.name}
              <span className="numeral text-xs opacity-60">
                {String(category.siteCount).padStart(2, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
