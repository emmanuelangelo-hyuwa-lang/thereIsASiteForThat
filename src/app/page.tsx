import Link from "next/link";

import { HowItWorks } from "@/components/HowItWorks";
import { EXAMPLE_QUERIES } from "@/features/search/constants";
import { SearchBox } from "@/features/search/SearchBox";
import { SiteList } from "@/features/sites/SiteList";
import {
  listCatalogCategories,
  listCatalogCollections,
  listFeaturedCatalogSites,
} from "@/lib/services/catalog";
import { slugify } from "@/lib/utils/slugify";

export default async function HomePage() {
  const [featured, categories, collections] = await Promise.all([
    listFeaturedCatalogSites(8),
    listCatalogCategories(),
    listCatalogCollections(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8 sm:pt-4">
      <section className="panel animate-rise relative overflow-visible px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            Directory for useful websites
          </p>
          <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-[2.6rem] leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            ThereIsASiteForThat
          </h1>
          <p className="animate-rise-delay mt-5 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Need a website to do X? Here&apos;s the best one.
          </p>
          <div className="animate-rise-delay-2 mt-10 w-full max-w-xl">
            <SearchBox />
          </div>
          <div className="animate-rise-delay-2 mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
            <Link href="/collections" className="transition hover:text-[var(--ink)]">
              Browse collections →
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/categories" className="transition hover:text-[var(--ink)]">
              Categories
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/submit" className="transition hover:text-[var(--ink)]">
              Submit a site
            </Link>
          </div>
        </div>
      </section>

      <section className="panel animate-rise-delay-2 px-6 py-8 sm:px-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Try a search
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
          {EXAMPLE_QUERIES.map((query) => (
            <li key={query}>
              <Link
                href={`/search/${slugify(query)}`}
                className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
              >
                {query}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--border)] px-6 py-4 sm:px-8">
          <div>
            <h2 className="text-sm font-medium text-[var(--ink)]">Top rated in the catalog</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Editor-scored picks — open a detail page for pros, cons, and alternatives.
            </p>
          </div>
          <Link
            href="/categories"
            className="shrink-0 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
          >
            Browse all
          </Link>
        </div>
        <SiteList sites={featured} />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel px-6 py-7 sm:px-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Categories
          </h2>
          <ul className="mt-4 space-y-2">
            {categories.slice(0, 8).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="flex items-baseline justify-between gap-3 text-sm transition hover:text-[var(--accent)]"
                >
                  <span className="text-[var(--ink)]">{category.name}</span>
                  <span className="text-[var(--muted)]">{category.siteCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel px-6 py-7 sm:px-8">
          <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            Collections
          </h2>
          <ul className="mt-4 space-y-2">
            {collections.slice(0, 7).map((collection) => (
              <li key={collection.slug}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className="flex items-baseline justify-between gap-3 text-sm transition hover:text-[var(--accent)]"
                >
                  <span className="text-[var(--ink)]">{collection.name}</span>
                  <span className="text-[var(--muted)]">{collection.siteCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <HowItWorks />
    </main>
  );
}
