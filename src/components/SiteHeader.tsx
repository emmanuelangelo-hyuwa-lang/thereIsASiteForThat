import Link from "next/link";

import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="group flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--accent)] transition group-hover:scale-110"
        />
        <span className="text-sm font-medium tracking-tight text-[var(--ink)]">
          ThereIsASiteForThat
        </span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-5">
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] sm:flex">
          <Link href="/categories" className="transition hover:text-[var(--ink)]">
            Categories
          </Link>
          <Link href="/collections" className="transition hover:text-[var(--ink)]">
            Collections
          </Link>
          <Link href="/submit" className="transition hover:text-[var(--ink)]">
            Submit
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
