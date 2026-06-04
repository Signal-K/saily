import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SHARED_PB_URL: process.env.NEXT_PUBLIC_SHARED_PB_URL ?? "http://127.0.0.1:8090",
    NEXT_PUBLIC_SAILY_PB_URL: process.env.NEXT_PUBLIC_SAILY_PB_URL ?? "http://127.0.0.1:8092",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
