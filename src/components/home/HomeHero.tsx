import Link from "next/link";

import { EXAMPLE_QUERIES } from "@/features/search/constants";
import { SearchBox } from "@/features/search/SearchBox";
import { slugify } from "@/lib/utils/slugify";

export function HomeHero() {
  return (
    <section className="hero-stage">
      <div className="relative z-30 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-16 pt-10 text-center sm:px-8 sm:pb-20 sm:pt-14">
        <p className="animate-rise text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          An atlas of useful websites
        </p>
        <h1 className="animate-rise-delay mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[2.75rem] leading-[1.02] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
          ThereIsASiteForThat
        </h1>
        <p className="animate-rise-delay mt-5 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Need a website to do X? Here&apos;s the best one.
        </p>
        <div className="relative z-30 mt-10 w-full max-w-xl">
          <SearchBox />
        </div>
        <p className="animate-rise-delay-2 mt-6 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Try searching
        </p>
        <ul className="animate-rise-delay-2 mt-3 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          {EXAMPLE_QUERIES.map((query) => (
            <li key={query}>
              <Link
                href={`/search/${slugify(query)}`}
                className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--accent)]"
              >
                {query}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
