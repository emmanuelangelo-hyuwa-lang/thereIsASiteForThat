"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";

import { SearchResultsList } from "./SearchResultsList";
import type { SearchResponseData } from "./types";
import { slugify } from "@/lib/utils/slugify";
import type { ApiResponse } from "@/lib/utils/api-response";

type SearchBoxProps = {
  autoFocus?: boolean;
  showInstantResults?: boolean;
  size?: "hero" | "inline";
};

function subscribe() {
  return () => undefined;
}

export function SearchBox({
  autoFocus = true,
  showInstantResults = true,
  size = "hero",
}: SearchBoxProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [query, setQuery] = useState("");
  const [instant, setInstant] = useState<SearchResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // "/" anywhere jumps to the search field; Escape lets go of it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typingElsewhere =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "/" && !typingElsewhere && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
        setActiveIndex(-1);
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

    // Enter on a highlighted row opens that site instead of the results page.
    const highlighted = instant?.results[activeIndex];
    if (open && highlighted) {
      setOpen(false);
      router.push(`/site/${highlighted.slug}`);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return;
    }
    setOpen(false);
    router.push(`/search/${slugify(trimmed)}`);
  }

  function handleFieldKeys(event: ReactKeyboardEvent<HTMLInputElement>) {
    const results = instant?.results ?? [];
    if (!open || results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    }
  }

  const hero = size === "hero";

  return (
    <div ref={panelRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <label htmlFor="site-search" className="sr-only">
          Search for a website
        </label>
        <div
          className={`search-shell flex items-center gap-2 rounded-[var(--r-pill)] bg-[var(--layer)] ${
            hero ? "p-2 sm:p-2.5" : "p-1.5"
          }`}
        >
          <input
            ref={inputRef}
            id="site-search"
            name="q"
            type="search"
            value={query}
            autoFocus={mounted ? autoFocus : false}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleFieldKeys}
            onFocus={() => {
              if (instant || loading) {
                setOpen(true);
              }
            }}
            placeholder="what do you need to do?"
            className={`min-w-0 flex-1 bg-transparent text-[var(--ink)] outline-none focus:outline-none focus-visible:outline-none placeholder:text-[var(--muted)] [&::-webkit-search-cancel-button]:hidden ${
              hero
                ? "px-4 py-3 text-xl tracking-tight sm:px-6 sm:py-4 sm:text-3xl"
                : "px-4 py-2.5 text-base sm:text-lg"
            }`}
          />
          {hero ? (
            <kbd className="label mr-1 hidden shrink-0 rounded-[var(--r-s)] bg-[var(--layer-2)] px-2.5 py-1.5 lg:block">
              /
            </kbd>
          ) : null}
          <button
            type="submit"
            aria-label="Search"
            className={`press flex shrink-0 items-center justify-center rounded-[var(--r-pill)] bg-[var(--accent)] text-[var(--on-accent)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--paper)] ${
              hero ? "h-14 w-14 sm:h-16 sm:w-16" : "h-11 w-11"
            }`}
          >
            <ArrowGlyph size={hero ? 22 : 18} />
          </button>
        </div>
      </form>

      {showInstantResults && open && query.trim().length >= 2 ? (
        <div className="popover sheet absolute left-0 right-0 z-50 mt-3 flex max-h-[min(30rem,68vh)] flex-col overflow-hidden text-left">
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading && !instant ? (
              <p className="label px-6 py-6">Searching</p>
            ) : instant ? (
              <SearchResultsList
                query={instant.query}
                mode={instant.mode}
                results={instant.results}
                aiSummary={instant.aiSummary}
                compact
                activeIndex={activeIndex}
              />
            ) : (
              <p className="label px-6 py-6">No results</p>
            )}
          </div>
          <button
            type="button"
            className="label flex shrink-0 items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:text-[var(--ink)]"
            onClick={() => {
              const trimmed = query.trim();
              if (trimmed.length >= 2) {
                router.push(`/search/${slugify(trimmed)}`);
              }
            }}
          >
            <span className="flex items-center gap-3">
              All results
              <span className="hidden lg:inline">↑ ↓ to pick, ⏎ to open</span>
            </span>
            <ArrowGlyph size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ArrowGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
