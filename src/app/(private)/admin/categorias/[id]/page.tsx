import Link from "next/link";
import type { Metadata } from "next";
import { getRecord, listRecords } from "@/features/admin/data/records";
import { categoryValues, recordData, recordName } from "@/features/admin/data/form-values";
import { CategoryForm } from "@/features/admin/components/forms";

export const metadata: Metadata = { title: "Editar categoría" };
export default async function CategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, categories] = await Promise.all([id === "nuevo" ? undefined : getRecord(id, "category"), listRecords("category")]);
  const parents = categories.filter((category) => category.parent_id === null).map((category) => ({ id: category.id, label: recordName(category), catalog: String(recordData(category).catalog) }));
  return <><Link href="/admin/categorias" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">← Categorías</Link><h1 className="mt-4 mb-7 font-serif text-4xl">{record ? "Editar categoría" : "Crear categoría"}</h1><CategoryForm initial={categoryValues(record)} parents={parents} /></>;
}
