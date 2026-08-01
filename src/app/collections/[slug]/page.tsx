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
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)]">
        {humanizeSlug(slug)}
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        Collection contents will load from the database in a later phase.
      </p>
      <Link
        href="/collections"
        className="mt-8 inline-block text-sm font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
      >
        ← All collections
      </Link>
    </main>
  );
}
