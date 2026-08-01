"use client";

import type { ReactNode } from "react";

type VisitSiteLinkProps = {
  href: string;
  siteId: string;
  query?: string;
  source: "search" | "detail" | "collection" | "ai_inferred";
  confidence?: number;
  className?: string;
  children: ReactNode;
};

export function VisitSiteLink({
  href,
  siteId,
  query,
  source,
  confidence,
  className,
  children,
}: VisitSiteLinkProps) {
  async function handleClick() {
    try {
      await fetch("/api/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          query: query ?? null,
          source,
          confidence: confidence ?? null,
        }),
        keepalive: true,
      });
    } catch {
      // Never block outbound navigation on analytics failure.
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        void handleClick();
      }}
    >
      {children}
    </a>
  );
}
