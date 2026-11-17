"use client";

import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Columns3, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

import { Input } from "@/components/ui/input";
import { SpecialtiesCarousel } from "@/features/home/components/specialties-carousel";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { MenuCatalog, MenuProduct } from "../domain/catalog";
import { filterProducts, formatPrice, localize } from "../domain/queries";
import type { MenuLabels } from "../messages";
import { ProductCard, type MenuView } from "./product-card";

const ProductDetails = lazy(() => import("./product-details"));
function subscribeHash(callback: () => void) { window.addEventListener("hashchange", callback); return () => window.removeEventListener("hashchange", callback); }
function currentHash() { return window.location.hash; }
function serverHash() { return ""; }
function replaceHash(value: string) {
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${value}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function CatalogExplorer({ catalog, locale, labels, heading, specialtiesHeading, specialtiesIntro }: {
  catalog: MenuCatalog; locale: Locale; labels: MenuLabels; heading: string; specialtiesHeading?: string; specialtiesIntro?: string;
}) {
  const id = useId();
  const reducedMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<MenuView>("compact");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [closingProduct, setClosingProduct] = useState<MenuProduct | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const hash = useSyncExternalStore(subscribeHash, currentHash, serverHash);
  const categoryId = hash.startsWith("#categoria-") ? hash.slice(11) : "all";
  const categoryById = useMemo(() => new Map(catalog.categories.map((category) => [category.id, category])), [catalog.categories]);
  const productById = useMemo(() => new Map(catalog.products.map((product) => [product.id, product])), [catalog.products]);
  const sections = useMemo(() => new Map(catalog.categories.map((category) => [category.id, localize(category.label, locale)])), [catalog.categories, locale]);
  const selectedCategory = categoryById.get(categoryId);
  const rootId = selectedCategory?.parentId ?? selectedCategory?.id;
  const rootCategories = useMemo(() => catalog.categories.filter((category) => category.parentId === null).sort((a, b) => a.order - b.order), [catalog.categories]);
  const subsections = useMemo(() => catalog.categories.filter((category) => category.parentId !== null && (!rootId || category.parentId === rootId)).sort((a, b) => a.order - b.order), [catalog.categories, rootId]);
  const products = useMemo(() => filterProducts(catalog, query, categoryId, locale), [catalog, query, categoryId, locale]);
  const productFromHash = hash.startsWith("#producto-") ? hash.slice(10) : null;
  const selected = productById.get(selectedId ?? productFromHash ?? "");
  const displayedProduct = selected ?? closingProduct;
  useEffect(() => { if (selectedCategory) catalogRef.current?.scrollIntoView({ block: "start", behavior: "instant" }); }, [selectedCategory]);
  useEffect(() => {
    const container = categoriesRef.current;
    const active = container?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!container || !active) return;
    const bounds = container.getBoundingClientRect(); const item = active.getBoundingClientRect();
    if (item.left < bounds.left || item.right > bounds.right) container.scrollLeft += item.left - bounds.left - (bounds.width - item.width) / 2;
  }, [rootId]);

  const featured = useMemo(() => catalog.featuredIds.flatMap((featuredId) => {
    const product = productById.get(featuredId);
    if (!product || product.priceCents === null) return [];
    return [{ id: product.id, image: product.image?.src ?? null, name: localize(product.name, locale), description: localize(product.description, locale), price: formatPrice(product.priceCents, locale), sourceUrl: `/${locale}/${catalog.kind === "food" ? "carta" : "bebidas"}#producto-${product.id}` }];
  }), [catalog.featuredIds, catalog.kind, productById, locale]);

  const openProduct = useCallback((product: MenuProduct, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setClosingProduct(null);
    setSelectedId(product.id);
  }, []);
  function closeProduct() {
    if (selected) setClosingProduct(selected);
    setSelectedId(null);
    if (productFromHash) replaceHash("");
  }
  function reset() { setQuery(""); replaceHash(""); searchRef.current?.focus(); }

  return (
    <LazyMotion features={domAnimation} strict>
      {featured.length > 0 && <details className="menu-specialties">
        <summary><span>{labels.specialtiesToggle}</span><span aria-hidden="true">{String(featured.length).padStart(2, "0")} ↗</span></summary>
        <section aria-labelledby={`${id}-featured`} className="pt-5 pb-7">
          <h2 id={`${id}-featured`} className="font-serif text-3xl">{specialtiesHeading}</h2>
          <p className="mt-2 mb-5 text-sm text-oak">{specialtiesIntro}</p>
          <SpecialtiesCarousel slides={featured} labels={{ carousel: labels.carousel, previous: labels.previous, next: labels.next, image: labels.description, placeholder: labels.photoPending, source: labels.details, slide: labels.slide, price: labels.price }} onSelect={(productId, trigger) => {
            const product = productById.get(productId); if (product) openProduct(product, trigger);
          }} />
        </section>
      </details>}

      <section ref={catalogRef} aria-labelledby={`${id}-title`} data-catalog>
        <div className="menu-catalog-heading"><h2 id={`${id}-title`}>{heading}</h2></div>
        <div className="menu-tools">
          <div className="menu-tools-top">
            <div className="menu-search"><label htmlFor={`${id}-search`} className="sr-only">{labels.search}</label><Search aria-hidden="true" /><Input id={`${id}-search`} ref={searchRef} type="search" value={query} maxLength={120} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} />{query && <button type="button" aria-label={labels.clear} onClick={() => { setQuery(""); searchRef.current?.focus(); }}><X aria-hidden="true" /></button>}</div>
            <div role="group" aria-label={labels.viewLabel} className="menu-view-switch">
              {([{ value: "compact", label: labels.compactView, Icon: LayoutList }, { value: "visual", label: labels.visualView, Icon: Columns3 }] as const).map(({ value, label, Icon }) => <button key={value} type="button" aria-label={label} title={label} aria-pressed={view === value} onClick={() => setView(value)} className={view === value ? "is-active" : undefined}><Icon aria-hidden="true" /><span className="menu-view-text">{label}</span><m.span aria-hidden="true" initial={false} animate={{ opacity: view === value ? 1 : 0 }} transition={{ duration: reducedMotion === false ? 0.12 : 0 }} className="menu-view-indicator" /></button>)}
            </div>
          </div>
          <div ref={categoriesRef} className="menu-category-scroll" role="group" aria-label={labels.categories}>
            {[{ id: "all", label: labels.all }, ...rootCategories.map((category) => ({ id: category.id, label: localize(category.label, locale) }))].map((category) => <button key={category.id} type="button" aria-pressed={category.id === (rootId ?? "all")} onClick={() => replaceHash(category.id === "all" ? "" : `#categoria-${category.id}`)} className={cn("menu-chip", category.id === (rootId ?? "all") && "is-active")}>{category.label}</button>)}
          </div>
          <div className="menu-tools-bottom">
            {subsections.length > 0 && <div className="menu-section-select"><SlidersHorizontal aria-hidden="true" /><label htmlFor={`${id}-section`} className="sr-only">{labels.subcategory}</label><select id={`${id}-section`} value={selectedCategory?.parentId ? selectedCategory.id : ""} onChange={(event) => replaceHash(event.target.value ? `#categoria-${event.target.value}` : rootId ? `#categoria-${rootId}` : "")}><option value="">{labels.allSections}</option>{subsections.map((category) => <option key={category.id} value={category.id}>{localize(category.label, locale)}</option>)}</select></div>}
            <p role="status" aria-live="polite" aria-atomic="true" className="menu-result-count">{products.length} {products.length === 1 ? labels.result : labels.results}</p>
            {(query || selectedCategory) && <button type="button" aria-label={labels.reset} title={labels.reset} className="menu-reset" onClick={reset}><span>{labels.reset}</span><X aria-hidden="true" /></button>}
          </div>
        </div>

        {products.length ? <m.ul initial={false} className="menu-products" data-view={view}>
          {products.map((product) => <li key={product.id}><ProductCard product={product} section={sections.get(product.categoryId) ?? ""} locale={locale} labels={labels} dialogId={`${id}-details`} view={view} onSelect={openProduct} /></li>)}
        </m.ul> : <div className="menu-empty"><Search aria-hidden="true" /><p>{labels.noResults}</p></div>}
      </section>

      {displayedProduct && <Suspense fallback={<p role="status" className="fixed right-5 bottom-5 z-50 rounded-sm border border-border bg-card p-5 text-sm shadow-lg">{labels.details}…</p>}><ProductDetails product={displayedProduct} open={Boolean(selected)} onAfterClose={() => setClosingProduct(null)} section={sections.get(displayedProduct.categoryId) ?? ""} locale={locale} labels={labels} id={`${id}-details`} onClose={closeProduct} restoreFocus={() => { if (triggerRef.current?.isConnected) triggerRef.current.focus(); else searchRef.current?.focus(); }} /></Suspense>}
    </LazyMotion>
  );
}
