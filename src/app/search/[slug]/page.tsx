import Link from "next/link";

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
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
        Search
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)]">
        {query}
      </h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">
        Search results will appear here once the directory is seeded and the
        semantic search API is connected.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
      >
        ← Back to search
      </Link>
    </main>
  );
}
