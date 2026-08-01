import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated collections of the best websites by audience and use case.",
};

const PLACEHOLDER_COLLECTIONS = [
  {
    slug: "best-ai-websites",
    name: "Best AI Websites",
    blurb: "Tools that actually earn a bookmark.",
  },
  {
    slug: "best-student-websites",
    name: "Best Student Websites",
    blurb: "Research, writing, and study utilities.",
  },
  {
    slug: "best-productivity-websites",
    name: "Best Productivity Websites",
    blurb: "Focus, notes, and workflow sites.",
  },
  {
    slug: "best-free-websites",
    name: "Best Free Websites",
    blurb: "High-signal tools with a free tier.",
  },
  {
    slug: "best-developer-websites",
    name: "Best Developer Websites",
    blurb: "Build, debug, and ship faster.",
  },
  {
    slug: "best-design-websites",
    name: "Best Design Websites",
    blurb: "Color, type, icons, and assets.",
  },
  {
    slug: "best-startup-websites",
    name: "Best Startup Websites",
    blurb: "Launch, market, and operate.",
  },
] as const;

export default function CollectionsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 pb-10 pt-2 sm:px-8">
      <section className="panel px-6 py-10 sm:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          Collections
        </h1>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Hand-picked lists for common needs. Full entries load after seed content.
        </p>
      </section>

      <section className="panel overflow-hidden">
        <ul className="divide-y divide-[var(--border)]">
          {PLACEHOLDER_COLLECTIONS.map((collection) => (
            <li key={collection.slug}>
              <Link
                href={`/collections/${collection.slug}`}
                className="flex flex-col gap-1 px-6 py-5 transition hover:bg-[var(--surface)] sm:flex-row sm:items-baseline sm:justify-between sm:px-8"
              >
                <span className="text-base font-medium text-[var(--ink)]">{collection.name}</span>
                <span className="text-sm text-[var(--muted)]">{collection.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
