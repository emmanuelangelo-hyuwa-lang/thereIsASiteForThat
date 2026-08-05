"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";

import { accentFor } from "@/lib/design/accent";

import { NAV } from "@/components/NavLinks";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="press inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-pill)] bg-[var(--layer)] text-[var(--ink)]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
      >
        <MenuGlyph open={open} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default bg-[var(--paper)]/70"
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            className="sheet slab fixed inset-x-5 top-[4.5rem] z-50 overflow-hidden p-2"
          >
            <ul className="stagger">
              {NAV.map((link, index) => (
                <li key={link.href} style={{ ["--i" as string]: index }}>
                  <Link
                    href={link.href}
                    style={{ "--accent": accentFor(link.href) } as React.CSSProperties}
                    className="flood flex items-center justify-between rounded-[var(--r-m)] px-5 py-5"
                    onClick={() => setOpen(false)}
                  >
                    <span className="headline text-2xl">{link.label}</span>
                    <span className="flood-mark h-3 w-3 rounded-[3px]" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      ) : null}
    </div>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d={open ? "M3.5 3.5 14.5 14.5" : "M2 6h14"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={open ? "M14.5 3.5 3.5 14.5" : "M2 12h14"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
