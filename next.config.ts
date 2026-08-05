import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Shared-element morphs between a list row and the page it opens.
    viewTransition: true,
  },
};

export default nextConfig;
