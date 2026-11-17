"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldError, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { allergenCodes } from "@/features/menu/domain/catalog";
import { saveCategory, saveProduct, saveContent, saveStaff, uploadPhoto, deleteRecord } from "../actions/records";
import { categorySchema, productSchema, contentSchema, staffSchema, editableTextKeys, type CategoryInput, type ProductInput, type ContentInput, type StaffInput } from "../validation/records";
import type { ActionResult } from "../domain/result";
import { useAdminFeedback, useReadyForMutation } from "./runtime";

const fieldClass = "min-h-11 w-full min-w-0 rounded-sm border border-input bg-card px-3 py-2 text-base disabled:opacity-60";
const allergenLabels = { gluten: "Gluten", shellfish: "Mariscos (fuente)", eggs: "Huevos", fish: "Pescado", peanuts: "Cacahuetes", soy: "Soja", milk: "Lácteos", nuts: "Frutos secos (fuente)", celery: "Apio", mustard: "Mostaza", sesame: "Sésamo", sulphites: "Sulfitos", lupin: "Altramuces", molluscs: "Moluscos" };

function Field({ label, registration, error, area = false, type = "text", help }: { label: string; registration: UseFormRegisterReturn; error?: FieldError; area?: boolean; type?: string; help?: string }) {
  const id = useId();
  const props = { ...registration, id, "aria-invalid": Boolean(error), "aria-describedby": error || help ? `${id}-help` : undefined };
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label>{area ? <textarea {...props} rows={4} className={fieldClass} /> : <Input {...props} type={type} step={type === "number" ? "1" : undefined} />}{(error || help) && <p id={`${id}-help`} role={error ? "alert" : undefined} className={`mt-2 text-xs leading-relaxed ${error ? "text-destructive" : "text-muted-foreground"}`}>{error?.message ?? help}</p>}</div>;
}

function Published({ registration, initial }: { registration: UseFormRegisterReturn; initial: boolean }) {
  return <label className="flex min-h-11 items-start gap-3 text-sm"><input type="checkbox" defaultChecked={initial} {...registration} className="mt-1 size-5 shrink-0 accent-olive" /><span>Publicado. Será visible en la web cuando esté activado el proveedor Supabase; sin marcar se guarda como borrador.</span></label>;
}

function PhotoUpload({ onPath, onBusy }: { onPath: (path: string) => void; onBusy: (busy: boolean) => void }) {
  const id = useId();
  const { notify } = useAdminFeedback();
  const [busy, setBusy] = useState(false);
  return <div className="rounded-sm border border-border bg-background p-4"><label htmlFor={id} className="mb-2 block text-sm font-semibold">Subir fotografía pública</label><input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="min-h-11 w-full min-w-0 text-sm file:mr-3 file:rounded-sm file:border file:border-input file:bg-card file:px-3 file:py-2" disabled={busy} onChange={async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const data = new FormData(); data.set("file", file);
    setBusy(true); onBusy(true);
    try { const result = await uploadPhoto(data); notify(result); if (result.ok && result.path) onPath(result.path); }
    catch { notify({ ok: false, message: "No se ha podido subir. Comprueba la conexión." }); }
    finally { setBusy(false); onBusy(false); input.value = ""; }
  }} /><p className="mt-2 text-xs leading-relaxed text-muted-foreground">JPG, PNG, WebP o AVIF, hasta 5 MB. Se optimiza a WebP y elimina metadatos. Guarda después el registro para asociarla.</p>{busy && <p role="status" className="mt-2 text-sm">Procesando fotografía…</p>}</div>;
}

function useSaveResult() {
  const { notify } = useAdminFeedback();
  const router = useRouter();
  return (result: ActionResult, path?: string) => {
    notify(result);
    if (result.ok) { if (path) router.replace(path); router.refresh(); }
  };
}

export function CategoryForm({ initial, parents }: { initial: CategoryInput; parents: { id: string; label: string; catalog: string }[] }) {
  const form = useForm<CategoryInput>({ resolver: zodResolver(categorySchema), defaultValues: initial });
  const online = useReadyForMutation();
  const saved = useSaveResult();
  const catalog = useWatch({ control: form.control, name: "catalog" });
  return <form className="max-w-3xl" onSubmit={form.handleSubmit(async (values) => { try { const result = await saveCategory(values); if (result.ok) form.reset({ ...values, version: values.version + 1 }); saved(result, initial.version === 0 && result.ok ? `/admin/categorias/${values.id}` : undefined); } catch { saved({ ok: false, message: "No se ha podido guardar la categoría." }); } })}><fieldset disabled={!online || form.formState.isSubmitting} className="space-y-6 rounded-sm border border-border bg-card p-5 sm:p-7">
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre en español" registration={form.register("name_es")} error={form.formState.errors.name_es} /><Field label="Nombre en inglés" registration={form.register("name_en")} error={form.formState.errors.name_en} /></div>
    <Field label="Identificador público" registration={form.register("slug")} error={form.formState.errors.slug} help="Único, sin espacios. Por ejemplo: tapas, rice, seafood, meat, desserts, drinks." />
    <label className="block text-sm font-semibold">Catálogo<select {...form.register("catalog")} className={`${fieldClass} mt-2`}><option value="food">Gastronomía</option><option value="drink">Bebidas</option></select></label>
    <label className="block text-sm font-semibold">Categoría superior<select {...form.register("parent_id")} className={`${fieldClass} mt-2`}><option value="">Categoría raíz</option>{parents.filter((parent) => parent.id !== initial.id && parent.catalog === catalog).map((parent) => <option key={parent.id} value={parent.id}>{parent.label}</option>)}</select></label>
    <Field label="Orden" registration={form.register("order", { valueAsNumber: true })} error={form.formState.errors.order} type="number" />
    <Published registration={form.register("published")} initial={initial.published} /><Button type="submit">{form.formState.isSubmitting ? "Guardando…" : "Guardar categoría"}</Button>
  </fieldset></form>;
}

export function ProductForm({ initial, categories }: { initial: ProductInput; categories: { id: string; label: string; catalog: "food" | "drink" }[] }) {
  const form = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: initial });
  const [uploading, setUploading] = useState(false);
  const online = useReadyForMutation();
  const saved = useSaveResult();
  const errors = form.formState.errors;
  return <form className="max-w-5xl" onSubmit={form.handleSubmit(async (values) => { try { const result = await saveProduct(values); if (result.ok) form.reset({ ...values, version: values.version + 1 }); saved(result, initial.version === 0 && result.ok ? `/admin/carta/${values.id}` : undefined); } catch { saved({ ok: false, message: "No se ha podido guardar el producto." }); } })}>
    <fieldset disabled={!online || form.formState.isSubmitting || uploading} className="space-y-6 rounded-sm border border-border bg-card p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre en español" registration={form.register("name_es")} error={errors.name_es} /><Field label="Nombre en inglés" registration={form.register("name_en")} error={errors.name_en} /></div>
      <label className="block text-sm font-semibold">Categoría<select {...form.register("category_id", { onChange: (event: { target: { value: string } }) => { const category = categories.find((item) => item.id === event.target.value); if (category) form.setValue("catalog", category.catalog); } })} aria-invalid={Boolean(errors.category_id)} className={`${fieldClass} mt-2`}><option value="">Selecciona una categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.catalog === "drink" ? "Bebidas" : "Gastronomía"} · {category.label}</option>)}</select>{errors.category_id && <span role="alert" className="mt-2 block text-xs text-destructive">{errors.category_id.message}</span>}</label>
      <div className="grid gap-5 md:grid-cols-2"><Field label="Descripción en español" registration={form.register("description_es")} error={errors.description_es} area /><Field label="Descripción en inglés" registration={form.register("description_en")} error={errors.description_en} area /></div>
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Precio (€)" registration={form.register("price")} error={errors.price} help="Euros, con hasta dos decimales. No se deducen unidades ni raciones." /><label className="block text-sm font-semibold">Disponibilidad<select {...form.register("availability")} className={`${fieldClass} mt-2`}><option value="unknown">Consultar disponibilidad</option><option value="available">Disponible</option><option value="unavailable">No disponible</option></select></label></div>
      <div className="grid gap-5 md:grid-cols-2"><Field label="Ingredientes en español" registration={form.register("ingredients_es")} error={errors.ingredients_es} area help="Una línea por ingrediente confirmado. Vacío significa información pendiente." /><Field label="Ingredientes en inglés" registration={form.register("ingredients_en")} error={errors.ingredients_en} area /></div>
      <fieldset className="rounded-sm border border-border p-4"><legend className="px-2 text-sm font-semibold">Alérgenos confirmados o indicados en la fuente</legend><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{allergenCodes.map((code) => <label key={code} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" value={code} defaultChecked={initial.allergens.includes(code)} {...form.register("allergens")} className="size-5 accent-olive" />{allergenLabels[code]}</label>)}</div><p className="mt-3 text-xs text-muted-foreground">Sin marcar: información pendiente, nunca una declaración de ausencia de alérgenos.</p></fieldset>
      <PhotoUpload onBusy={setUploading} onPath={(path) => form.setValue("image_path", path, { shouldDirty: true, shouldValidate: true })} />
      <Field label="Ruta de fotografía asociada" registration={form.register("image_path")} error={errors.image_path} help="Vacía para mostrar el placeholder. Quitar la asociación no elimina el archivo de Storage." />
      <div className="grid gap-5 md:grid-cols-2"><Field label="Información adicional en español" registration={form.register("additional_es")} error={errors.additional_es} area /><Field label="Información adicional en inglés" registration={form.register("additional_en")} error={errors.additional_en} area /></div>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" defaultChecked={initial.featured} {...form.register("featured")} className="size-5 accent-olive" />Destacar producto en el carrusel</label>
      <Published registration={form.register("published")} initial={initial.published} /><Button type="submit">{form.formState.isSubmitting ? "Guardando…" : "Guardar producto"}</Button>
    </fieldset>
  </form>;
}

export function ContentForm({ initial }: { initial: ContentInput }) {
  const form = useForm<ContentInput>({ resolver: zodResolver(contentSchema), defaultValues: initial });
  const online = useReadyForMutation();
  const saved = useSaveResult();
  const [uploading, setUploading] = useState(false);
  const [closureError, setClosureError] = useState("");
  const [closures, setClosures] = useState(initial.payload.contact.closures.map((entry) => `${entry.date} | ${entry.label}`).join("\n"));
  return <form className="max-w-5xl" onSubmit={(event) => {
    const entries = closures.split("\n").filter((line) => line.trim()).map((line) => { const [date = "", ...label] = line.split("|"); return { date: date.trim(), label: label.join("|").trim() }; });
    form.setValue("payload.contact.closures", entries);
    setClosureError("");
    void form.handleSubmit(async (values) => { try { const result = await saveContent(values); if (result.ok) form.reset({ ...values, version: values.version + 1 }); saved(result); } catch { saved({ ok: false, message: "No se ha podido guardar el contenido." }); } }, () => setClosureError("Revisa los campos y las fechas de cierre (AAAA-MM-DD | motivo)."))(event);
  }}><fieldset disabled={!online || form.formState.isSubmitting || uploading} className="space-y-7 rounded-sm border border-border bg-card p-5 sm:p-7">
    <h2 className="font-serif text-2xl">Contacto y horarios</h2>
    <Field label="Dirección completa" registration={form.register("payload.contact.address")} error={form.formState.errors.payload?.contact?.address} />
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Móvil internacional (+34…)" registration={form.register("payload.contact.mobile")} error={form.formState.errors.payload?.contact?.mobile} /><Field label="Fijo internacional, si existe" registration={form.register("payload.contact.landline")} error={form.formState.errors.payload?.contact?.landline} /><Field label="Correo confirmado, si existe" registration={form.register("payload.contact.email")} error={form.formState.errors.payload?.contact?.email} /><Field label="Instagram oficial" registration={form.register("payload.contact.instagram")} error={form.formState.errors.payload?.contact?.instagram} /><Field label="Facebook oficial" registration={form.register("payload.contact.facebook")} error={form.formState.errors.payload?.contact?.facebook} /><Field label="Horario publicado en español" registration={form.register("payload.contact.hours_es")} error={form.formState.errors.payload?.contact?.hours_es} /><Field label="Horario publicado en inglés" registration={form.register("payload.contact.hours_en")} error={form.formState.errors.payload?.contact?.hours_en} /></div>
    <label className="block text-sm font-semibold">Cierres especiales · una línea «AAAA-MM-DD | motivo»<textarea value={closures} onChange={(event) => setClosures(event.target.value)} rows={4} className={`${fieldClass} mt-2`} /></label>
    <h2 className="font-serif text-2xl">Textos de la web</h2><p className="text-sm text-muted-foreground">Vacío conserva el texto base. Solo texto plano; sin etiquetas HTML ni llaves de formato.</p>
    {editableTextKeys.map((key) => <div key={key} className="grid gap-5 md:grid-cols-2"><Field label={`${key} · Español`} registration={form.register(`payload.texts.${key}.es`)} error={form.formState.errors.payload?.texts?.[key]?.es} area /><Field label={`${key} · Inglés`} registration={form.register(`payload.texts.${key}.en`)} error={form.formState.errors.payload?.texts?.[key]?.en} area /></div>)}
    <h2 className="font-serif text-2xl">Fotografías públicas</h2>
    <PhotoUpload onBusy={setUploading} onPath={(path) => form.setValue("payload.hero_path", path, { shouldDirty: true })} /><Field label="Ruta de imagen del hero" registration={form.register("payload.hero_path")} error={form.formState.errors.payload?.hero_path} />
    <PhotoUpload onBusy={setUploading} onPath={(path) => form.setValue("payload.story_path", path, { shouldDirty: true })} /><Field label="Ruta de imagen de historia" registration={form.register("payload.story_path")} error={form.formState.errors.payload?.story_path} />
    <Field label="Descripción de las fotografías · español" registration={form.register("payload.image_caption_es")} error={form.formState.errors.payload?.image_caption_es} /><Field label="Descripción de las fotografías · inglés" registration={form.register("payload.image_caption_en")} error={form.formState.errors.payload?.image_caption_en} />
    <Published registration={form.register("published")} initial={initial.published} />{closureError && <p role="alert" className="text-sm text-destructive">{closureError}</p>}<Button type="submit">{form.formState.isSubmitting ? "Guardando…" : "Guardar contenido"}</Button>
  </fieldset></form>;
}

export function StaffForm({ initial }: { initial: StaffInput }) {
  const form = useForm<StaffInput>({ resolver: zodResolver(staffSchema), defaultValues: initial });
  const [confirm, setConfirm] = useState<StaffInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const button = useRef<HTMLButtonElement>(null);
  const saved = useSaveResult();
  const online = useReadyForMutation();
  return <><form onSubmit={form.handleSubmit((values) => { setError(""); setConfirm(values); })} className="rounded-sm border border-border bg-card p-5 sm:p-7"><fieldset disabled={!online || busy} className="grid gap-5 sm:grid-cols-2"><Field label="Correo de una cuenta existente en Auth" registration={form.register("email")} error={form.formState.errors.email} /><Field label="Nombre de empleado" registration={form.register("display_name")} error={form.formState.errors.display_name} /><label className="text-sm font-semibold">Rol<select defaultValue={initial.role} {...form.register("role")} className={`${fieldClass} mt-2`}><option value="owner">Propietario</option><option value="manager">Encargado</option><option value="waiter">Camarero</option><option value="kitchen">Cocina</option></select></label><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" defaultChecked={initial.active} {...form.register("active")} className="size-5 accent-olive" />Acceso activo</label><Button ref={button} type="submit" className="justify-self-start">Revisar cambios de acceso</Button></fieldset></form>
    <Dialog open={Boolean(confirm)} onOpenChange={(open) => { if (!busy && !open) setConfirm(null); }}><DialogContent closeLabel="Cerrar confirmación" onCloseAutoFocus={(event) => { event.preventDefault(); button.current?.focus(); }}><DialogTitle className="pr-10 font-serif text-3xl">Confirmar permisos</DialogTitle><DialogDescription className="mt-4 leading-relaxed">Se actualizará el acceso de {confirm?.email}. Rol: {confirm?.role}. Acceso {confirm?.active ? "activo" : "desactivado"}. El cambio quedará auditado.</DialogDescription>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>Cancelar</Button><Button disabled={busy || !online} onClick={async () => { if (!confirm) return; setBusy(true); setError(""); try { const result = await saveStaff(confirm); saved(result); if (result.ok) setConfirm(null); else setError(result.message); } catch { setError("No se ha podido actualizar el acceso."); } finally { setBusy(false); } }}>{busy ? "Guardando…" : "Confirmar cambio"}</Button></div></DialogContent></Dialog>
  </>;
}

export function DeleteRecordButton({ id, version, label }: { id: string; version: number; label: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const online = useReadyForMutation();
  const saved = useSaveResult();
  return <><Button ref={trigger} variant="outline" disabled={!online} onClick={() => { setError(""); setOpen(true); }}>Eliminar</Button><Dialog open={open} onOpenChange={(next) => { if (!busy) setOpen(next); }}><DialogContent closeLabel="Cerrar confirmación" onCloseAutoFocus={(event) => { event.preventDefault(); trigger.current?.focus(); }}><DialogTitle className="pr-10 font-serif text-3xl">Eliminar registro</DialogTitle><DialogDescription className="mt-4 leading-relaxed">Se eliminará «{label}». Esta operación quedará auditada. No se podrá eliminar una categoría que siga en uso.</DialogDescription>{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancelar</Button><Button variant="destructive" disabled={!online || busy} onClick={async () => { setBusy(true); setError(""); try { const result = await deleteRecord({ id, version }); saved(result); if (result.ok) setOpen(false); else setError(result.message); } catch { setError("No se ha podido eliminar el registro."); } finally { setBusy(false); } }}>{busy ? "Eliminando…" : "Confirmar eliminación"}</Button></div></DialogContent></Dialog></>;
}
