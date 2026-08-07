import type { MetadataRoute } from "next";

/**
 * Installable-app metadata. Not a ranking factor on its own, but Google's
 * mobile crawler reads it, and an installed shortcut gets the right name and
 * colours instead of a screenshot of the tab.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ThereIsASiteForThat",
    short_name: "TIASFT",
    description:
      "Describe a task in plain language and get the site that does it.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090a",
    theme_color: "#08090a",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
