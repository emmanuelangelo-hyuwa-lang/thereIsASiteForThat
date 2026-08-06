"use client";

import type { ReactNode } from "react";

import { recordClick, type ClickSource } from "@/features/search/record-click";

type VisitSiteLinkProps = {
  href: string;
  siteId: string;
  query?: string;
  source: ClickSource;
  confidence?: number;
  className?: string;
  /** Keyboard highlight, for rows in the instant-results popover. */
  active?: boolean;
  children: ReactNode;
};

export function VisitSiteLink({
  href,
  siteId,
  query,
  source,
  confidence,
  className,
  active,
  children,
}: VisitSiteLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-active={active ? "" : undefined}
      aria-current={active ? "true" : undefined}
      onClick={() => {
        void recordClick({
          siteId,
          query: query ?? null,
          source,
          confidence: confidence ?? null,
        });
      }}
    >
      {children}
    </a>
  );
}
