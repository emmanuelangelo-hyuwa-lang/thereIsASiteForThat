import Link from "next/link";

import type { CatalogCollection } from "@/lib/catalog/types";

type CollectionDestinationsProps = {
  collections: CatalogCollection[];
};

export function CollectionDestinations({
  collections,
}: CollectionDestinationsProps) {
  if (collections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-5 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
            Start with a collection
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            Curated maps across the web — students, free tools, design, productivity, and more.
          </p>
        </div>
        <Link
          href="/collections"
          className="shrink-0 text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
        >
          All collections →
        </Link>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="collection-destination flex h-full flex-col border border-[var(--border)] bg-[var(--panel)] px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)]">
                  {collection.name}
                </h3>
                <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
                  {collection.siteCount}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {collection.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
