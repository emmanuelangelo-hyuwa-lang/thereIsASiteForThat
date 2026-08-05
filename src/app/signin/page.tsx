import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accounts",
  description:
    "Accounts are coming to ThereIsASiteForThat. Search, browsing, and voting work without one.",
};

const LATER = [
  { label: "Bookmarks", note: "Keep the sites you actually come back to" },
  { label: "Saved searches", note: "Reopen a question you already asked" },
  { label: "Vote history", note: "See every verdict you have cast" },
] as const;

/**
 * Accounts are deliberately not shipped yet, there is no transactional email
 * for confirmation or password recovery. Everything the product promises today
 * works without one, so this page says so plainly rather than pretending.
 */
export default function SignInPage() {
  return (
    <main className="shell flex flex-1 flex-col pb-10 pt-4">
      <p className="label enter">Accounts</p>

      <h1 className="display enter enter-1 mt-6 max-w-4xl text-[clamp(2.5rem,8vw,6.5rem)] text-[var(--ink)]">
        Not yet.
        <br />
        <span className="ink-accent">Soon.</span>
      </h1>

      <p className="lede enter enter-2 mt-8 max-w-xl text-[var(--muted)]">
        Signing in is coming once we can send confirmation and recovery mail. Until
        then nothing here is behind a login. Search, browse, and vote on any
        site without handing over an address.
      </p>

      <ul className="enter enter-3 mt-16 max-w-3xl">
        {LATER.map((item, index) => (
          <li
            key={item.label}
            className="flex items-baseline gap-5 border-t border-[var(--hair)] py-6 sm:gap-8"
          >
            <span className="numeral w-8 shrink-0 text-base text-[var(--muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="headline block text-2xl text-[var(--ink)] sm:text-3xl">
                {item.label}
              </span>
              <span className="copy mt-2 block text-[var(--muted)]">
                {item.note}
              </span>
            </span>
            <span className="label shrink-0">Soon</span>
          </li>
        ))}
      </ul>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-accent h-14 px-8">
          Search something instead
        </Link>
        <Link href="/submit" className="btn btn-line h-14 px-8">
          Submit a site
        </Link>
      </div>
    </main>
  );
}
