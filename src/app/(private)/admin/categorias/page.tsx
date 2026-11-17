import Link from "next/link";
import type { Metadata } from "next";
import { listRecords } from "@/features/admin/data/records";
import { recordData, recordName } from "@/features/admin/data/form-values";
import { DeleteRecordButton } from "@/features/admin/components/forms";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Categorías" };
export default async function CategoriesPage() {
  const categories = await listRecords("category");
  return <><div className="flex flex-wrap items-center justify-between gap-5"><h1 className="font-serif text-4xl">Categorías</h1><Link href="/admin/categorias/nuevo" className={buttonVariants()}>Crear categoría</Link></div><p className="my-6 text-sm leading-relaxed text-muted-foreground">Categorías y subcategorías de gastronomía y bebidas, con orden y publicación configurables.</p>
    {categories.length ? <ul className="space-y-4">{categories.map((category) => <li key={category.id} className="flex flex-wrap items-center justify-between gap-5 rounded-sm border border-border bg-card p-5"><div><h2 className="font-serif text-2xl">{recordName(category)}</h2><p className="mt-2 text-sm text-oak">{recordData(category).catalog === "drink" ? "Bebidas" : "Gastronomía"} · {category.parent_id ? "Subcategoría" : "Raíz"} · {category.published ? "Publicada" : "Borrador"}</p></div><div className="flex flex-wrap gap-3"><Link href={`/admin/categorias/${category.id}`} className={buttonVariants({ variant: "outline" })}>Editar</Link><DeleteRecordButton id={category.id} version={category.version} label={recordName(category)} /></div></li>)}</ul> : <p className="rounded-sm border border-dashed border-border bg-card p-8">Todavía no hay categorías guardadas.</p>}
  </>;
}
