import { NextResponse, type NextRequest } from "next/server";

import { getAdminOrigin } from "@/config/admin";
import { refreshSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  if (["/admin/sw.js", "/admin/offline.html", "/admin/manifest.webmanifest"].includes(request.nextUrl.pathname)) return NextResponse.next();
  if (request.nextUrl.pathname === "/") {
    const admin = getAdminOrigin();
    if (admin && request.nextUrl.host === new URL(admin).host) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }
  return refreshSession(request);
}

// No se ejecuta en páginas públicas, imágenes ni metadata: mantiene SSG sin cookies.
export const config = { matcher: ["/admin/:path*", "/acceso", "/"] };
