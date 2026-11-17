import Link from "next/link";
import type { Metadata } from "next";
import { listRecords } from "@/features/admin/data/records";
import { recordData, recordName } from "@/features/admin/data/form-values";
import { DeleteRecordButton } from "@/features/admin/components/forms";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Productos y bebidas" };
export default async function ProductsPage() {
  const products = await listRecords("product");
  return <><div className="flex flex-wrap items-center justify-between gap-5"><div><p className="eyebrow text-oak">Carta</p><h1 className="mt-3 font-serif text-4xl">Productos y bebidas</h1></div><Link href="/admin/carta/nuevo" className={buttonVariants()}>Crear producto</Link></div>
    <p className="my-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">Datos reales de Supabase. Los productos creados aquí son independientes del snapshot local hasta activar la publicación del CMS.</p>
    {products.length === 0 ? <p className="rounded-sm border border-dashed border-border bg-card p-8">No hay productos guardados. Crea primero sus categorías y después el producto.</p> : <ul className="grid gap-4 md:grid-cols-2">{products.map((product) => { const data = recordData(product); return <li key={product.id} className="min-w-0 rounded-sm border border-border bg-card p-5"><p className="text-xs font-semibold text-olive">{data.catalog === "drink" ? "Bebida" : "Gastronomía"} · {product.published ? "Publicado" : "Borrador"}</p><h2 className="mt-3 font-serif text-2xl break-words">{recordName(product)}</h2><p className="mt-3 text-sm text-oak">{typeof data.price_cents === "number" ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(data.price_cents / 100) : "Precio pendiente"} · {data.availability === "available" ? "Disponible" : data.availability === "unavailable" ? "No disponible" : "Consultar"}</p><div className="mt-5 flex flex-wrap gap-3"><Link href={`/admin/carta/${product.id}`} className={buttonVariants({ variant: "outline" })}>Editar</Link><DeleteRecordButton id={product.id} version={product.version} label={recordName(product)} /></div></li>; })}</ul>}
    {products.length === 500 && <p className="mt-5 text-sm">Se muestran los 500 registros más recientes. Revisa o exporta el catálogo completo desde Supabase.</p>}
  </>;
}
