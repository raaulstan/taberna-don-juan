import Link from "next/link";
import type { Metadata } from "next";
import { getRecord, listRecords } from "@/features/admin/data/records";
import { productValues, recordData, recordName } from "@/features/admin/data/form-values";
import { ProductForm } from "@/features/admin/components/forms";

export const metadata: Metadata = { title: "Editar producto" };
export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, categories] = await Promise.all([id === "nuevo" ? undefined : getRecord(id, "product"), listRecords("category")]);
  const options = categories.map((category) => ({ id: category.id, label: recordName(category), catalog: recordData(category).catalog === "drink" ? "drink" as const : "food" as const }));
  return <><Link href="/admin/carta" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">← Productos y bebidas</Link><h1 className="mt-4 mb-7 font-serif text-4xl">{record ? "Editar producto" : "Crear producto"}</h1>{categories.length === 0 && <p className="mb-6 border-l-2 border-honey pl-4 text-sm">Necesitas <Link href="/admin/categorias/nuevo" className="underline">crear una categoría</Link> para poder guardar el producto.</p>}<ProductForm initial={productValues(record)} categories={options} /></>;
}
