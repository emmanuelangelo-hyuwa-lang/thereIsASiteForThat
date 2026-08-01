"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SEARCH_PLACEHOLDERS } from "./constants";
import { slugify } from "@/lib/utils/slugify";

type SearchBoxProps = {
  autoFocus?: boolean;
};

export function SearchBox({ autoFocus = true }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlaceholderVisible(false);
      window.setTimeout(() => {
        setPlaceholderIndex((current) => (current + 1) % SEARCH_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 220);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    router.push(`/search/${slugify(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <label htmlFor="site-search" className="sr-only">
        Search for a website
      </label>
      <div className="flex items-stretch gap-2 rounded-2xl border border-[var(--ink)]/10 bg-[var(--surface)] p-2 shadow-[0_18px_50px_-28px_rgba(15,61,62,0.45)] backdrop-blur-sm transition focus-within:border-[var(--accent)]/50 focus-within:shadow-[0_22px_60px_-24px_rgba(15,118,110,0.55)]">
        <input
          id="site-search"
          name="q"
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={SEARCH_PLACEHOLDERS[placeholderIndex]}
          className={`min-w-0 flex-1 bg-transparent px-4 py-3 text-lg text-[var(--ink)] outline-none placeholder:text-[var(--muted)] ${
            placeholderVisible ? "placeholder:opacity-100" : "placeholder:opacity-0"
          } placeholder:transition-opacity placeholder:duration-200`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Find site
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)] sm:text-left">
        Tip: press <kbd className="rounded border border-[var(--ink)]/15 px-1.5 py-0.5 font-sans">Enter</kbd> to search
      </p>
    </form>
  );
}
