import { getSiteUrl } from "@/lib/env";

import { absoluteUrl } from "./url";

export const SITE_NAME = "ThereIsASiteForThat";

type Crumb = {
  name: string;
  /** Site-relative path. The trail's last crumb is the current page. */
  path: string;
};

/**
 * Google reads BreadcrumbList to replace the raw URL under a result with a
 * readable trail, so every deep page states where it sits. The final crumb
 * still carries an item URL: omitting it is legal but loses the self link in
 * some validators.
 */
export function breadcrumbList(trail: Crumb[]): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(siteUrl, crumb.path),
    })),
  };
}

/**
 * The brand's identity graph, emitted once on the home page. WebSite plus
 * SearchAction is what makes Google offer a search box inside our own result;
 * the target URL has to be a real, crawlable page, which is why it points at
 * /search/{term} — that route de-slugifies whatever it is handed.
 */
export function homeGraph(description: string): Record<string, unknown>[] {
  const siteUrl = getSiteUrl();

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl(siteUrl, "/#website"),
      name: SITE_NAME,
      alternateName: "There is a site for that",
      url: absoluteUrl(siteUrl, "/"),
      description,
      publisher: { "@id": absoluteUrl(siteUrl, "/#organization") },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: absoluteUrl(siteUrl, "/search/{search_term_string}"),
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": absoluteUrl(siteUrl, "/#organization"),
      name: SITE_NAME,
      url: absoluteUrl(siteUrl, "/"),
      description,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteUrl, "/icon.png"),
        width: 512,
        height: 512,
      },
    },
  ];
}
