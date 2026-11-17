import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/features/auth/data/staff";
import { hasPermission, roleLabels } from "@/features/auth/domain/roles";
import { getDashboardCounts } from "@/features/admin/data/records";

export const metadata: Metadata = { title: "Resumen del equipo" };

export default async function AdminPage() {
  const staff = await requireStaff();
  const manage = hasPermission(staff.role, "catalog");
  const counts = manage ? await getDashboardCounts() : null;
  return <>
    <p className="eyebrow text-oak">Área del equipo · {roleLabels[staff.role]}</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">Resumen</h1>
    {counts ? <div className="mt-8 grid gap-4 sm:grid-cols-3">{[["Productos", counts.products], ["Productos publicados", counts.published], ["Categorías", counts.categories]].map(([label, value]) => <section key={label} className="rounded-sm border border-border bg-card p-6"><h2 className="text-sm text-oak">{label}</h2><p className="mt-3 text-4xl font-semibold tabular-nums text-olive">{value}</p></section>)}</div> : <p className="mt-8 max-w-2xl rounded-sm border border-border bg-card p-6 leading-relaxed">Tu acceso está activo. No hay módulos operativos habilitados para este rol en esta fase. El propietario puede revisar tus permisos.</p>}
    <section className="mt-8 rounded-sm border border-border bg-card p-6"><h2 className="font-serif text-2xl">Avisos importantes</h2><ul className="mt-4 list-inside list-disc space-y-3 text-sm leading-relaxed text-oak"><li>Las operaciones se validan en servidor y requieren conexión.</li><li>Publicación web: {process.env.PUBLIC_DATA_SOURCE === "supabase" ? "CMS de Supabase activado." : "catálogo local. Los cambios del panel quedan guardados en Supabase; activar PUBLIC_DATA_SOURCE=supabase requiere revisar y publicar los datos primero."}</li><li>No se recopilan visitas por producto; no se muestran estadísticas de seguimiento sin datos.</li></ul></section>
    {manage && <div className="mt-7 flex flex-wrap gap-4"><Link href="/admin/carta/nuevo" className="inline-flex min-h-11 items-center rounded-sm bg-walnut px-5 py-3 text-sm text-parchment">Crear producto</Link><Link href="/admin/contenido" className="inline-flex min-h-11 items-center rounded-sm border border-input bg-card px-5 py-3 text-sm">Revisar contenido y contacto</Link></div>}
  </>;
}
