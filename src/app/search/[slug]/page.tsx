import Link from "next/link";

import { SearchBox } from "@/features/search/SearchBox";

type SearchPageProps = {
  params: Promise<{ slug: string }>;
};

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: SearchPageProps) {
  const { slug } = await params;
  const query = humanizeSlug(slug);
  return {
    title: `Best websites to ${query.toLowerCase()}`,
    description: `Find the best website for: ${query.toLowerCase()}.`,
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { slug } = await params;
  const query = humanizeSlug(slug);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">Search</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {query}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Ranked matches will land here once the catalog and semantic search are connected.
        </p>
        <div className="mt-8 max-w-xl">
          <SearchBox autoFocus={false} />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--border)] px-6 py-4 sm:px-8">
          <p className="text-sm text-[var(--muted)]">Results</p>
        </div>
        <div className="px-6 py-10 text-sm text-[var(--muted)] sm:px-8">
          No results yet — seed the directory to unlock curated matches with confidence scores.
        </div>
      </section>

      <Link href="/" className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
        ← Back to home
      </Link>
    </main>
  );
}
