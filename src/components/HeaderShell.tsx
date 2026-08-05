"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Solidifies the header once the page moves.
 *
 * This used to be a CSS scroll-driven animation. It rendered correctly in
 * Safari (which has no support and took the static fallback) but painted the
 * wrong colour in Chromium, so it is now a plain attribute toggle: one
 * listener, one transition, identical in every engine.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // Reading scrollY and flipping one attribute is cheap enough to do
    // inline; deferring it to a frame only adds a way for it to go stale.
    function apply() {
      ref.current?.toggleAttribute("data-scrolled", window.scrollY > 8);
    }

    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
  }, []);

  return (
    <header ref={ref} className="site-header">
      {children}
    </header>
  );
}
