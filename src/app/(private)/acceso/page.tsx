import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getSupabaseConfig } from "@/config/env";
import { LoginForm } from "@/features/admin/components/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";

const reasons: Record<string, string> = {
  configuracion: "La conexión con Supabase todavía no está configurada.",
  sesion: "Se necesita una sesión verificada para acceder al panel.",
  permisos: "La cuenta no tiene permisos para acceder a esta sección.",
};

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const configured = Boolean(getSupabaseConfig());
  const reason = motivo && Object.hasOwn(reasons, motivo) ? reasons[motivo] : undefined;

  return (
    <main id="contenido" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-sm bg-walnut p-5 text-parchment"><BrandLogo /><LockKeyhole aria-hidden="true" className="size-7 text-honey" /></div>
      <p className="text-sm font-semibold tracking-widest text-oak uppercase">Taberna Don Juan · Equipo</p>
      <h1 className="mt-4 font-serif text-4xl">Acceso privado</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Inicia sesión con tu cuenta del equipo para acceder a las herramientas autorizadas.
      </p>
      {reason && <p className="mt-5 rounded-md border border-border bg-card p-4 text-sm">{reason}</p>}
      {configured ? <LoginForm /> : <p className="mt-6 rounded-sm border border-border bg-card p-4 text-sm">Para habilitar el acceso, configura Supabase y aplica las migraciones siguiendo la guía de instalación. No hay acceso de demostración.</p>}
      <Link href="/es" className={buttonVariants({ variant: "outline", className: "mt-8 self-start" })}>
        Volver a la web pública
      </Link>
    </main>
  );
}
