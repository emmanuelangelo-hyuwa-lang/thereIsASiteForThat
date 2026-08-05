import Link from "next/link";

import { SectionHead } from "@/components/ui/SectionHead";
import type { CatalogCollection } from "@/lib/catalog/types";
import { accentStyle } from "@/lib/design/accent";

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
    <section id="collections" className="shell reveal">
      <SectionHead
        label="Destinations"
        title="Collections"
        count={collections.length}
        href="/collections"
      />

      <ul className="stagger-scroll stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.slice(0, 6).map((collection, index) => (
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
                <h3 className="headline text-3xl">{collection.name}</h3>
                <p className="copy flood-muted mt-3 text-sm">
                  {collection.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
