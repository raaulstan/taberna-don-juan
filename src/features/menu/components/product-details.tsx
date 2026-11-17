"use client";

import { useRef } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "@/i18n/config";
import type { MenuProduct } from "../domain/catalog";
import { formatPrice, localize, textLanguage } from "../domain/queries";
import type { MenuLabels } from "../messages";
import { ProductImage } from "./product-image";
import { cn } from "@/lib/utils";

export default function ProductDetails({ product, section, locale, labels, id, open, onClose, onAfterClose, restoreFocus }: {
  product: MenuProduct;
  section: string;
  locale: Locale;
  labels: MenuLabels;
  id: string;
  open: boolean;
  onClose: () => void;
  onAfterClose: () => void;
  restoreFocus: () => void;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent id={id} className={product.kind === "drink" ? "sm:max-w-lg" : undefined} closeLabel={labels.close} onOpenAutoFocus={(event) => { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }); }} onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); onAfterClose(); }}>
          <div className="pr-10"><p className="eyebrow text-oak">{section}</p>{product.origin === "demo" && <p className="mt-3 text-sm font-semibold text-olive">{labels.demo}</p>}<DialogTitle ref={titleRef} tabIndex={-1} lang={textLanguage(product.name, locale)} className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{localize(product.name, locale)}</DialogTitle></div>
        {(product.kind === "drink" || !product.description) && <DialogDescription className="sr-only">{section}</DialogDescription>}
        <div className={cn("product-detail-layout mt-7 grid min-w-0 gap-7", product.kind === "food" && "md:grid-cols-2")}>
          <div><ProductImage product={product} locale={locale} label={labels.photoPending} large /><p className="mt-5 font-serif text-3xl text-olive">{product.priceCents === null ? <span className="font-sans text-base">{labels.pricePending}</span> : formatPrice(product.priceCents, locale)}</p>{product.availability !== "unknown" && <p className="mt-3 text-sm text-oak">{labels.availability}: {labels[product.availability]}</p>}</div>
          {(product.kind === "food" || product.allergens || product.additionalInformation) && <div className="min-w-0 space-y-6 text-sm leading-relaxed">
            {product.kind === "food" && product.description && <section><h3 className="font-semibold">{labels.description}</h3><DialogDescription lang={textLanguage(product.description, locale)} className="mt-2 text-muted-foreground">{localize(product.description, locale)}</DialogDescription></section>}
            {product.allergens && <section><h3 className="font-semibold">{labels.allergens}</h3><ul className="mt-2 flex flex-wrap gap-2">{product.allergens.map((allergen) => <li key={allergen} className="rounded-sm border border-border bg-background px-2 py-1">{labels.allergenNames[allergen]}</li>)}</ul></section>}
            {product.additionalInformation && <section><h3 className="font-semibold">{labels.additional}</h3><p className="mt-2 text-muted-foreground">{localize(product.additionalInformation, locale)}</p></section>}
          </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
