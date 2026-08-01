import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-auto w-full max-w-6xl px-5 pb-10 pt-6 sm:px-8">
      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>Need a website to do X? Here&apos;s the best one.</p>
        <div className="flex gap-4">
          <Link href="/collections" className="transition hover:text-[var(--ink)]">
            Collections
          </Link>
          <Link href="/submit" className="transition hover:text-[var(--ink)]">
            Submit
          </Link>
        </div>
      </div>
    </footer>
  );
}
