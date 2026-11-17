import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireStaff } from "@/features/auth/data/staff";
import { hasPermission, roleLabels } from "@/features/auth/domain/roles";
import { AdminNavigation } from "@/features/admin/components/navigation";
import { AdminRuntime } from "@/features/admin/components/runtime";
import { BrandLogo } from "@/components/layout/brand-logo";
import { site } from "@/config/site";

export const metadata: Metadata = { manifest: "/admin/manifest.webmanifest", appleWebApp: { capable: true, title: "Don Juan · Equipo", statusBarStyle: "default" } };
export const maxDuration = 30;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff();
  const items = [{ href: "/admin", label: "Resumen" }];
  if (hasPermission(staff.role, "catalog")) items.push({ href: "/admin/carta", label: "Productos y bebidas" }, { href: "/admin/categorias", label: "Categorías" }, { href: "/admin/estadisticas", label: "Estadísticas" });
  if (hasPermission(staff.role, "content")) items.push({ href: "/admin/contenido", label: "Contenido y contacto" });
  if (hasPermission(staff.role, "staff")) items.push({ href: "/admin/empleados", label: "Equipo y accesos" }, { href: "/admin/auditoria", label: "Auditoría" });
  items.push({ href: "/admin/cuenta", label: "Mi cuenta" });

  return <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
    <a href="#contenido" className="sr-only z-50 bg-card px-5 py-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Saltar al contenido</a>
    <aside className="admin-sidebar bg-walnut px-4 py-5 text-parchment lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:py-8">
      <Link href="/admin" aria-label="Taberna Don Juan · Panel" className="block px-4"><BrandLogo /></Link><p className="mb-6 px-4 pt-2 text-xs tracking-widest text-honey uppercase">{roleLabels[staff.role]}</p>
      <AdminNavigation items={items} /><a href={`${site.url}/es`} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-11 items-center px-4 text-sm underline underline-offset-4">Visitar web pública ↗</a>
      <p className="mt-6 px-4 text-xs leading-relaxed text-parchment/80">Instalación: utiliza «Instalar panel» cuando el navegador lo ofrezca o su menú para añadirlo a inicio.</p>
    </aside>
    <div className="min-w-0"><AdminRuntime><main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">{children}</main></AdminRuntime></div>
  </div>;
}
