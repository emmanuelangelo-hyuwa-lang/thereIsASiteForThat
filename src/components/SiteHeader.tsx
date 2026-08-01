import Link from "next/link";

import { AccountMenu } from "@/features/auth/AccountMenu";
import { MobileNav } from "@/components/MobileNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5">
      <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--accent)] transition group-hover:scale-110"
        />
        <span className="max-w-[10.5rem] truncate text-sm font-medium tracking-tight text-[var(--ink)] min-[400px]:max-w-[14rem] sm:max-w-none">
          ThereIsASiteForThat
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2 sm:gap-5">
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
        <AccountMenu />
        <ThemeToggle />
        <MobileNav />
      </div>
    </header>
  );
}
