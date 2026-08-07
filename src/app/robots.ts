import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  /**
   * Disallow rules are prefix matches, so "/admin" already covers /admin/login
   * and everything below it. What is excluded is the console, the JSON
   * endpoints, and per-account pages: none of them are useful in a result, and
   * a crawler working through /api/search would burn a model call per request.
   */
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/me", "/signin"],
      },
    ],
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
  };
}
