import Link from "next/link";

import { HowItWorks } from "@/components/HowItWorks";
import { EXAMPLE_QUERIES } from "@/features/search/constants";
import { SearchBox } from "@/features/search/SearchBox";
import { slugify } from "@/lib/utils/slugify";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8 sm:pt-4">
      <section className="panel animate-rise relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
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

      <HowItWorks />
    </main>
  );
}
