import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo/url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
  };
}
