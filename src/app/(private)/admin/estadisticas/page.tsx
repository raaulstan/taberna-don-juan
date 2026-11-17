import type { Metadata } from "next";
import { getDashboardCounts } from "@/features/admin/data/records";

export const metadata: Metadata = { title: "Estadísticas del catálogo" };
export default async function StatisticsPage() {
  const counts = await getDashboardCounts();
  return <><h1 className="font-serif text-4xl">Estadísticas del catálogo</h1><p className="my-6 text-sm text-muted-foreground">Indicadores consultados en Supabase en esta solicitud, sin cifras de demostración.</p><dl className="grid gap-4 sm:grid-cols-3">{[["Productos guardados", counts.products], ["Publicados", counts.published], ["Categorías", counts.categories]].map(([label, value]) => <div key={label} className="rounded-sm border border-border bg-card p-6"><dt className="text-sm text-oak">{label}</dt><dd className="mt-3 text-4xl font-semibold text-olive">{value}</dd></div>)}</dl><section className="mt-8 rounded-sm border border-border bg-card p-6"><h2 className="font-serif text-2xl">Consultas de productos</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">No se ha implementado seguimiento de visitas. No hay estadísticas de popularidad disponibles.</p></section></>;
}
