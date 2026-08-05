"use client";

import { Children, useState, type ReactNode } from "react";

type RevealListProps = {
  children: ReactNode;
  /** How many entries to show before asking. */
  initial?: number;
  label?: string;
  className?: string;
};

/**
 * Shows the first few entries and keeps the tail behind one press. Nobody
 * scrolls past ten results looking for the eleventh, but the eleventh should
 * still be reachable without a page load.
 */
export function RevealList({
  children,
  initial = 3,
  label = "more",
  className,
}: RevealListProps) {
  const items = Children.toArray(children);
  const [expanded, setExpanded] = useState(false);
  const hidden = items.length - initial;

  return (
    <>
      <ul className={className}>{expanded ? items : items.slice(0, initial)}</ul>

      {hidden > 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="more-row label"
        >
          <span>
            Show {hidden} {label}
          </span>
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-[var(--r-pill)] bg-[var(--layer)] text-[var(--ink)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      ) : null}
    </>
  );
}
