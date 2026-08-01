import Link from "next/link";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  return {
    title: humanizeSlug(slug),
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Collection
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {humanizeSlug(slug)}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Sites in this collection will load from the database in a later phase.
        </p>
      </section>

      <Link
        href="/collections"
        className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
      >
        ← All collections
      </Link>
    </main>
  );
}
