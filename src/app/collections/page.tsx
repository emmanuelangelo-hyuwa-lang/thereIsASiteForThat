import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of the best websites by audience and use case.",
};

const PLACEHOLDER_COLLECTIONS = [
  { slug: "best-ai-websites", name: "Best AI Websites" },
  { slug: "best-student-websites", name: "Best Student Websites" },
  { slug: "best-productivity-websites", name: "Best Productivity Websites" },
  { slug: "best-free-websites", name: "Best Free Websites" },
  { slug: "best-developer-websites", name: "Best Developer Websites" },
  { slug: "best-design-websites", name: "Best Design Websites" },
  { slug: "best-startup-websites", name: "Best Startup Websites" },
] as const;

export default function CollectionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[var(--ink)]">
        Collections
      </h1>
      <p className="mt-3 max-w-xl text-[var(--muted)]">
        Hand-picked lists for common needs. Full collection pages land after seed content.
      </p>
      <ul className="mt-10 space-y-4">
        {PLACEHOLDER_COLLECTIONS.map((collection) => (
          <li key={collection.slug}>
            <Link
              href={`/collections/${collection.slug}`}
              className="text-lg font-medium text-[var(--ink)] underline decoration-[var(--accent)]/30 underline-offset-4 transition hover:decoration-[var(--accent)]"
            >
              {collection.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
