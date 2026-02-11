import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily Grid",
    short_name: "DailyGrid",
    description: "Daily NYT-style game hub",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#14532d",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
