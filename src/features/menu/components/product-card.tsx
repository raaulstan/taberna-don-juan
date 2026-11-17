"use client";

import { memo } from "react";
import { Info, Circle } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { MenuProduct } from "../domain/catalog";
import { formatPrice, localize, textLanguage } from "../domain/queries";
import type { MenuLabels } from "../messages";
import { ProductImage } from "./product-image";

export type MenuView = "compact" | "visual";
type Props = {
  product: MenuProduct;
  section: string;
  locale: Locale;
  labels: MenuLabels;
  dialogId: string;
  view: MenuView;
  onSelect: (product: MenuProduct, trigger: HTMLButtonElement) => void;
};

export const ProductCard = memo(function ProductCard({ product, section, locale, labels, onSelect, dialogId, view }: Props) {
  const language = textLanguage(product.name, locale);
  const status = product.availability === "available" ? labels.availableShort : labels.unavailableShort;
  const showMedia = view === "visual" || Boolean(product.image);
  return (
    <article className="menu-entry" data-view={view} data-has-image={showMedia}>
      {showMedia && <div className="menu-entry-media"><ProductImage product={product} locale={locale} label={labels.photoPending} thumbnail={view === "compact"} /></div>}
      <div className="menu-entry-content">
        <p className="menu-entry-section">{section}</p>
        {product.origin === "demo" && <p className="menu-entry-demo">{labels.demo}</p>}
        <div className="menu-entry-heading">
          <h3 lang={language}><button type="button" aria-haspopup="dialog" aria-controls={dialogId} onClick={(event) => onSelect(product, event.currentTarget)} className="menu-entry-trigger">{localize(product.name, locale)}</button></h3>
          <p className="menu-entry-price">{product.priceCents === null ? <span>{labels.pricePending}</span> : formatPrice(product.priceCents, locale)}</p>
        </div>
        {product.kind !== "drink" && product.description && <p lang={textLanguage(product.description, locale)} className="menu-entry-description">{localize(product.description, locale)}</p>}
        <div className="menu-entry-meta">
          {product.allergens && <span className="inline-flex items-center gap-1.5" title={product.allergens.map((allergen) => labels.allergenNames[allergen]).join(", ")}>
            <Info aria-hidden="true" className="size-3.5" /><span aria-hidden="true">{product.allergens.length}</span><span className="sr-only">{labels.allergens}: {product.allergens.length}</span>
          </span>}
          {product.availability !== "unknown" && <span className="inline-flex items-center gap-1.5" title={labels[product.availability]}><Circle aria-hidden="true" className={`size-1.5 ${product.availability === "available" ? "fill-olive" : ""}`} /><span>{status}</span></span>}
          <span aria-hidden="true" className="menu-entry-more">{labels.details} ↗</span>
        </div>
      </div>
    </article>
  );
});
