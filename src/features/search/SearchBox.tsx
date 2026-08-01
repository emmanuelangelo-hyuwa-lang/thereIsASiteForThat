"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { SEARCH_PLACEHOLDERS } from "./constants";
import { SearchResultsList } from "./SearchResultsList";
import type { SearchResponseData } from "./types";
import { slugify } from "@/lib/utils/slugify";
import type { ApiResponse } from "@/lib/utils/api-response";

type SearchBoxProps = {
  autoFocus?: boolean;
  showInstantResults?: boolean;
};

function subscribe() {
  return () => undefined;
}

export function SearchBox({
  autoFocus = true,
  showInstantResults = true,
}: SearchBoxProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [instant, setInstant] = useState<SearchResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!showInstantResults) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      abortRef.current?.abort();
      setInstant(null);
      setLoading(false);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, limit: 5 }),
          signal: controller.signal,
        });
        const json = (await response.json()) as ApiResponse<SearchResponseData>;
        if (!json.success) {
          setInstant(null);
          setOpen(true);
          return;
        }
        setInstant(json.data);
        setOpen(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setInstant(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, showInstantResults]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    setOpen(false);
    router.push(`/search/${slugify(trimmed)}`);
  }

  const placeholder = mounted
    ? SEARCH_PLACEHOLDERS[placeholderIndex]
    : SEARCH_PLACEHOLDERS[0];

  return (
    <div ref={panelRef} className="relative w-full">
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
            onFocus={() => {
              if (instant || loading) {
                setOpen(true);
              }
            }}
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

      {showInstantResults && open && query.trim().length >= 2 ? (
        <div className="search-popover absolute left-0 right-0 z-50 mt-2 flex max-h-[min(28rem,70vh)] flex-col overflow-hidden rounded-xl border border-[var(--border)] text-left">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading && !instant ? (
              <p className="px-4 py-4 text-sm text-[var(--muted)]">Searching…</p>
            ) : instant ? (
              <SearchResultsList
                query={instant.query}
                mode={instant.mode}
                results={instant.results}
                aiSummary={instant.aiSummary}
                compact
              />
            ) : (
              <p className="px-4 py-4 text-sm text-[var(--muted)]">No results.</p>
            )}
          </div>
          <div className="shrink-0 border-t border-[var(--border)] bg-[var(--panel)] px-3 py-2.5">
            <button
              type="button"
              className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
              onClick={() => {
                const trimmed = query.trim();
                if (trimmed.length >= 2) {
                  router.push(`/search/${slugify(trimmed)}`);
                }
              }}
            >
              Open full results →
            </button>
          </div>
        </div>
      ) : null}
    </div>
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
