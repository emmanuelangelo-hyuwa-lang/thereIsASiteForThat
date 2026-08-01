"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { SEARCH_PLACEHOLDERS } from "./constants";
import { slugify } from "@/lib/utils/slugify";

type SearchBoxProps = {
  autoFocus?: boolean;
};

function subscribe() {
  return () => undefined;
}

export function SearchBox({ autoFocus = true }: SearchBoxProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const interval = window.setInterval(() => {
      setPlaceholderVisible(false);
      window.setTimeout(() => {
        setPlaceholderIndex((current) => (current + 1) % SEARCH_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 200);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [mounted]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    router.push(`/search/${slugify(trimmed)}`);
  }

  const placeholder = mounted
    ? SEARCH_PLACEHOLDERS[placeholderIndex]
    : SEARCH_PLACEHOLDERS[0];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="site-search" className="sr-only">
        Search for a website
      </label>
      <div className="flex items-stretch overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] transition focus-within:border-[var(--accent)]/55">
        <div className="flex items-center pl-4 text-[var(--muted)]" aria-hidden="true">
          <SearchIcon />
        </div>
        <input
          id="site-search"
          name="q"
          type="search"
          value={query}
          autoFocus={mounted ? autoFocus : false}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          suppressHydrationWarning
          className={`min-w-0 flex-1 bg-transparent px-3 py-4 text-base text-[var(--ink)] outline-none placeholder:text-[var(--muted)] sm:text-lg ${
            placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-0"
          } placeholder:transition-opacity placeholder:duration-200`}
        />
        <button
          type="submit"
          className="m-1.5 shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-5"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
