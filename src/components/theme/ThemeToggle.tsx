"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * The switch is driven entirely by CSS keyed off `html.light`, React only
 * handles the click. No mounted-state guard, no hydration flash, and the knob
 * is in the right place on the very first paint.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);

  // The rendered value is a constant so server and client always agree; the
  // real state is written to the DOM once hydration is done. Deriving it during
  // render would guess wrong for half the visitors and leave a mismatched
  // attribute that React refuses to patch.
  useEffect(() => {
    ref.current?.setAttribute(
      "aria-checked",
      String(resolvedTheme !== "light"),
    );
  }, [resolvedTheme]);

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={false}
      aria-label="Toggle dark and light"
      onClick={() => {
        crossFade();
        setTheme(resolvedTheme === "light" ? "dark" : "light");
      }}
      className="theme-switch"
    >
      <span className="theme-switch__track" aria-hidden="true">
        <span className="theme-switch__ghost theme-switch__ghost--moon">
          <MoonGlyph />
        </span>
        <span className="theme-switch__ghost theme-switch__ghost--sun">
          <SunGlyph />
        </span>
        <span className="theme-switch__knob">
          <span className="theme-switch__face theme-switch__face--moon">
            <MoonGlyph />
          </span>
          <span className="theme-switch__face theme-switch__face--sun">
            <SunGlyph />
          </span>
        </span>
      </span>
    </button>
  );
}

/** Let every colour on the page travel to its counterpart together. */
function crossFade() {
  const root = document.documentElement;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  root.classList.add("theme-crossing");
  window.clearTimeout(crossFadeTimer);
  crossFadeTimer = window.setTimeout(() => {
    root.classList.remove("theme-crossing");
  }, 1320);
}

let crossFadeTimer = 0;

function SunGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.6" fill="currentColor" />
      <path
        d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 13.6A8 8 0 1 1 10.4 4a6.4 6.4 0 0 0 9.6 9.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
