import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/components/ui/PageHead";
import { accentStyle } from "@/lib/design/accent";
import { listCatalogCollections } from "@/lib/services/catalog";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of the best websites by audience and use case.",
};

export default async function CollectionsPage() {
  const collections = await listCatalogCollections();

  return (
    <main className="shell flex flex-1 flex-col pb-10">
      <PageHead
        label="Catalog"
        labelHref="/"
        title="Collections"
        lead="Handpicked lists for common needs. Scan, compare, then visit."
        stat={{
          value: String(collections.length).padStart(2, "0"),
          caption: "Collections",
        }}
      />

      <ul className="stagger-scroll stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <li key={collection.slug} style={{ ["--i" as string]: index }}>
            <Link
              href={`/collections/${collection.slug}`}
              style={accentStyle(collection.slug)}
              className="flood press relative isolate flex h-full min-h-[15rem] flex-col justify-between overflow-hidden rounded-[var(--r-l)] p-7"
            >
              <span className="flood-wipe -z-10" aria-hidden="true" />
              <span className="numeral flood-accent text-7xl">
                {String(collection.siteCount).padStart(2, "0")}
              </span>
              <div>
                <h2 className="headline text-3xl">{collection.name}</h2>
                <p className="copy flood-muted mt-3 text-sm">
                  {collection.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
