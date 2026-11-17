import type { Metadata } from "next";
import { listRecords } from "@/features/admin/data/records";
import { contentValues } from "@/features/admin/data/form-values";
import { ContentForm } from "@/features/admin/components/forms";

export const metadata: Metadata = { title: "Contenido y contacto" };
export default async function ContentPage() {
  const records = await listRecords("content");
  return <><h1 className="font-serif text-4xl">Contenido y contacto</h1><p className="my-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">Textos en español e inglés, fotografías, dirección, teléfonos, redes, horarios y cierres informativos. El documento solo se lee públicamente si está publicado y el CMS está activado.</p><ContentForm initial={contentValues(records[0])} /></>;
}
