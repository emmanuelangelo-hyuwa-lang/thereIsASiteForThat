import Link from "next/link";

import { HeaderShell } from "@/components/HeaderShell";
import { MobileNav } from "@/components/MobileNav";
import { NavLinks } from "@/components/NavLinks";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  return (
    <HeaderShell>
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        {/* No mark. The name is the mark, set tight and lowercase, with the
            word the product is named for carrying the accent. */}
        <Link
          href="/"
          className="wordmark min-w-0 shrink"
          aria-label="thereisasiteforthat home"
        >
          <span className="block truncate text-[0.9375rem] font-medium leading-none tracking-[-0.045em] text-[var(--ink)] sm:text-base">
            thereisasitefor
            <span className="wordmark-accent ink-accent">that</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <NavLinks />
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-[var(--hair)] md:block"
          />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </HeaderShell>
  );
}
