import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ id: "/admin", name: "Taberna Don Juan · Equipo", short_name: "Don Juan", description: "Gestión del equipo, carta y contenidos de Taberna Don Juan. Requiere conexión y acceso autorizado.", lang: "es", start_url: "/admin", scope: "/admin", display: "standalone", display_override: ["standalone", "minimal-ui"], background_color: "#F4E4C8", theme_color: "#3B2115", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] }, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "no-cache", "X-Robots-Tag": "noindex, nofollow" } });
}
