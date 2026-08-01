import Link from "next/link";

import { HowItWorks } from "@/components/HowItWorks";
import { EXAMPLE_QUERIES } from "@/features/search/constants";
import { SearchBox } from "@/features/search/SearchBox";
import { slugify } from "@/lib/utils/slugify";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-5xl flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8 sm:text-left">
        <div className="flex w-full max-w-2xl flex-col items-center sm:items-start">
          <h1 className="animate-brand-in font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            ThereIsASiteForThat
          </h1>
          <p className="animate-brand-in-delay mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            Need a website to do X? Here&apos;s the best one.
          </p>
          <div className="animate-brand-in-delay-2 mt-10 w-full">
            <SearchBox />
          </div>
          <div className="animate-brand-in-delay-2 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--muted)] sm:justify-start">
            <Link href="/collections" className="underline-offset-4 transition hover:text-[var(--ink)] hover:underline">
              Browse collections
            </Link>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <Link href="/submit" className="underline-offset-4 transition hover:text-[var(--ink)] hover:underline">
              Submit a site
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl border-t border-[var(--ink)]/8 px-5 py-14 sm:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Try a search
        </h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
          {EXAMPLE_QUERIES.map((query) => (
            <li key={query}>
              <Link
                href={`/search/${slugify(query)}`}
                className="text-base text-[var(--ink)] underline decoration-[var(--accent)]/35 underline-offset-4 transition hover:decoration-[var(--accent)]"
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
