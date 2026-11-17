import type { Metadata } from "next";

export const siteIcons = {
  icon: { url: "/favicon.ico?v=brand-2", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
  shortcut: "/favicon.ico?v=brand-2",
  apple: "/icons/apple-touch-icon.png",
} satisfies NonNullable<Metadata["icons"]>;
