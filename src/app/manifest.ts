import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Taberna Don Juan",
    short_name: "Don Juan",
    description: "Taberna Don Juan, Málaga.",
    lang: "es",
    start_url: "/es",
    scope: "/",
    display: "standalone",
    background_color: "#F4E4C8",
    theme_color: "#3B2115",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
