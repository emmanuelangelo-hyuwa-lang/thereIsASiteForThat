"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export const NAV = [
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/submit", label: "Submit" },
] as const;

/**
 * One pill that slides between items rather than three that light up. It rests
 * on the current page and follows the pointer, so the nav reads as a single
 * moving object instead of a row of separate buttons.
 *
 * The pill is positioned imperatively: measuring into state would re-render on
 * every hover and every resize for a value only the DOM needs.
 */
export function NavLinks() {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  const activeIndex = NAV.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const target = hovered ?? (activeIndex >= 0 ? activeIndex : null);

  const place = useCallback(() => {
    const pill = indicatorRef.current;
    if (!pill) return;

    if (target === null) {
      pill.style.opacity = "0";
      return;
    }

    const node = itemRefs.current[target];
    if (!node) return;

    // The list is the positioned ancestor, so offsetLeft is already measured
    // from its left edge, subtracting the list's own offset threw the pill
    // hundreds of pixels off screen.
    pill.style.transform = `translateX(${node.offsetLeft}px)`;
    pill.style.width = `${node.offsetWidth}px`;
    pill.style.opacity = "1";
  }, [target]);

  useLayoutEffect(() => {
    place();
    // Animate only after the pill has been put in its first position, so it
    // does not fly in from the left edge on load.
    const frame = requestAnimationFrame(() => {
      indicatorRef.current?.setAttribute("data-settled", "");
    });
    return () => cancelAnimationFrame(frame);
  }, [place]);

  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  return (
    <div
      ref={listRef}
      className="relative hidden items-center gap-1 md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      <span ref={indicatorRef} aria-hidden="true" className="nav-indicator" />

      {NAV.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            data-active={active ? "" : undefined}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            className="nav-link"
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
