import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteIcons } from "@/config/icons";

import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Acceso del equipo | Taberna Don Juan", template: "%s | Taberna Don Juan" },
  description: "Acceso exclusivo del equipo de Taberna Don Juan. Identificación y gestión autorizada del restaurante.",
  robots: { index: false, follow: false, nocache: true },
  referrer: "same-origin",
  icons: siteIcons,
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#3B2115" };

export const dynamic = "force-dynamic";

export default function PrivateRootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
