"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HEADLINE_PHRASES } from "@/features/search/constants";
import { slugify } from "@/lib/utils/slugify";

const HOLD_MS = 2600;

/**
 * Sized off the longest word in the whole list, once. Sizing per-word made the
 * line grow and shrink, which shoved the entire page up and down on every roll.
 */
const LONGEST = HEADLINE_PHRASES.reduce(
  (max, item) => Math.max(max, item.phrase.length),
  0,
);

/**
 * The headline is the demo.
 *
 * "There is a site for ___" fills itself in with the tasks people actually
 * search, rolling one line up to the next inside a mask. The word is a link,
 * so whatever it lands on is a real search you can take.
 */
export function KineticHeadline() {
  const [index, setIndex] = useState(0);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setRolling(true);
      window.setTimeout(() => {
        setIndex((value) => (value + 1) % HEADLINE_PHRASES.length);
        setRolling(false);
      }, 420);
    }, HOLD_MS);

    return () => window.clearInterval(timer);
  }, []);

  const current = HEADLINE_PHRASES[index];
  const next = HEADLINE_PHRASES[(index + 1) % HEADLINE_PHRASES.length];
  const href = current.query
    ? `/search/${slugify(current.query)}`
    : "/categories";

  return (
    <h1
      className="display roll-size text-[var(--ink)]"
      style={{ ["--roll-len" as string]: LONGEST }}
    >
      <span className="block">There is</span>
      <span className="block">a site for</span>
      <Link
        href={href}
        className="roll group mt-1 block max-w-full"
        aria-label={
          current.query ? `Search ${current.query}` : "Browse the catalog"
        }
      >
        <span className="roll-window">
          <span className={`roll-track${rolling ? " is-rolling" : ""}`}>
            <span className="roll-line ink-accent">{current.phrase}</span>
            <span className="roll-line ink-accent" aria-hidden="true">
              {next.phrase}
            </span>
          </span>
        </span>
        <span className="roll-rule" aria-hidden="true" />
      </Link>
    </h1>
  );
}
