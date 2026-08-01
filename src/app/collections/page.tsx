import type { Metadata } from "next";
import Link from "next/link";

import { listCatalogCollections } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of the best websites by audience and use case.",
};

export default async function CollectionsPage() {
  const collections = await listCatalogCollections();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-5 py-8 sm:px-10 sm:py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Collections
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Hand-picked lists for common needs — scan, compare, then visit.
        </p>
      </section>

      <section className="panel overflow-hidden">
        <ul className="divide-y divide-[var(--border)]">
          {collections.map((collection) => (
            <li key={collection.slug}>
              <Link
                href={`/collections/${collection.slug}`}
                className="flex flex-col gap-1 px-6 py-5 transition hover:bg-[var(--surface)] sm:flex-row sm:items-baseline sm:justify-between sm:px-8"
              >
                <span className="min-w-0">
                  <span className="block text-base font-medium text-[var(--ink)]">
                    {collection.name}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--muted)]">
                    {collection.description}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-[var(--muted)]">
                  {collection.siteCount} sites
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
