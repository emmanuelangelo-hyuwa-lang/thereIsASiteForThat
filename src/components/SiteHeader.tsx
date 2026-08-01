import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-[var(--ink)] transition hover:text-[var(--accent)]"
      >
        ThereIsASiteForThat
      </Link>
      <nav className="flex items-center gap-5 text-sm text-[var(--muted)]">
        <Link href="/collections" className="transition hover:text-[var(--ink)]">
          Collections
        </Link>
        <Link href="/submit" className="transition hover:text-[var(--ink)]">
          Submit
        </Link>
      </nav>
    </header>
  );
}
