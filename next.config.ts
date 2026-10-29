import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Image uploads go through a Server Action; 5 MB per image plus multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
