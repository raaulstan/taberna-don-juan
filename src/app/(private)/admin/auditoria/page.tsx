import type { Metadata } from "next";
import { listAudit } from "@/features/admin/data/records";

export const metadata: Metadata = { title: "Auditoría" };
export default async function AuditPage() {
  const audit = await listAudit();
  return <><h1 className="font-serif text-4xl">Auditoría</h1><p className="my-6 max-w-3xl text-sm text-muted-foreground">Últimas 100 operaciones, registradas por PostgreSQL en la misma transacción que el cambio. Solo propietarios; el historial completo permanece en la base de datos.</p>
    {audit.length ? <ol className="space-y-3">{audit.map((entry) => <li key={entry.id} className="rounded-sm border border-border bg-card p-5"><p className="font-semibold">{entry.action} · {entry.entity}</p><time dateTime={entry.created_at} className="mt-2 block text-sm text-oak">{new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(entry.created_at))}</time><p className="mt-2 break-all text-xs text-muted-foreground">Registro: {entry.record_id} · Actor: {entry.actor_id ?? "Administración SQL / sistema"}</p></li>)}</ol> : <p className="rounded-sm border border-border bg-card p-8">No hay operaciones registradas.</p>}
  </>;
}
