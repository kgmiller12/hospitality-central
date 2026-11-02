import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite (the local dev database) ships WebAssembly, so keep it out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Profile photos and post pictures are sent through Server Actions.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
