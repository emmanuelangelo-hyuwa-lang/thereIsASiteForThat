import Link from "next/link";

import { KineticHeadline } from "@/components/home/KineticHeadline";
import { EXAMPLE_QUERIES } from "@/features/search/constants";
import { SearchBox } from "@/features/search/SearchBox";
import { slugify } from "@/lib/utils/slugify";

type HomeHeroProps = {
  siteCount: number;
  categoryCount: number;
  collectionCount: number;
};

export function HomeHero({
  siteCount,
  categoryCount,
  collectionCount,
}: HomeHeroProps) {
  return (
    <section id="search" className="shell pt-6 sm:pt-10">
      <p className="label enter">The answer is one site</p>

      <div className="enter enter-1 mt-6">
        <KineticHeadline />
      </div>

      {/*
        The entry animation keeps a transform applied (fill mode `both`), which
        makes this a stacking context, so the popover's own z-index cannot lift
        it past later siblings. The example chips below were painting over the
        results. Raising the whole context is what actually settles the order.
      */}
      <div className="enter enter-2 relative z-50 mt-12 sm:mt-16">
        <SearchBox />
      </div>

      <ul className="stagger enter-3 mt-6 flex flex-wrap gap-2">
        {EXAMPLE_QUERIES.slice(0, 6).map((query, index) => (
          <li key={query} style={{ ["--i" as string]: index }}>
            <Link href={`/search/${slugify(query)}`} className="chip">
              {query}
            </Link>
          </li>
        ))}
      </ul>

      <dl className="mt-20 grid grid-cols-3 gap-6 border-t border-[var(--hair)] pt-8">
        <Stat label="Sites" value={siteCount} />
        <Stat label="Categories" value={categoryCount} />
        <Stat label="Collections" value={collectionCount} />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dd className="numeral text-5xl text-[var(--ink)] sm:text-7xl">
        {String(value).padStart(2, "0")}
      </dd>
      <dt className="label mt-4">{label}</dt>
    </div>
  );
}
