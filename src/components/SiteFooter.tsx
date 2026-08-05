import Link from "next/link";

const LINKS = [
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/submit", label: "Submit" },
  { href: "/signin", label: "Accounts" },
] as const;

const CHANT = [
  "Need a website to do X",
  "Here is the best one",
  "One answer, not fifty",
  "Voted on by people who went",
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto pb-10 pt-28">
      {/* A footer can still be alive. Hovering stops it. */}
      <div className="ticker py-6" aria-hidden="true">
        {[0, 1].map((copy) => (
          <div key={copy} className="ticker-track">
            {CHANT.map((line) => (
              <span
                key={line}
                className="headline whitespace-nowrap text-3xl text-[var(--muted)] sm:text-5xl"
              >
                {line}
                <span className="ink-accent"> · </span>
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="shell">
        <hr className="rule" />
        <div className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="label">thereisasiteforthat</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="label transition-colors duration-150 hover:text-[var(--ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
