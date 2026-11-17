import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight, Phone, Wine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getPublicRestaurant } from "@/services/public/content";
import { CatalogExplorer } from "@/features/menu/components/catalog-explorer";
import { getCatalog } from "@/features/menu/data/get-catalog";
import { demoDrinks } from "@/features/menu/data/demo-drinks";
import { catalogSchema } from "@/features/menu/domain/catalog";
import { getMenuMessages } from "@/features/menu/messages";
import { isLocale } from "@/i18n/config";
import { localizedMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMenuMessages(locale);
  return localizedMetadata({ locale, path: "/bebidas", title: `${messages.drinksTitle} | Taberna Don Juan`, description: messages.drinksDescription });
}

export default async function DrinksPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [catalog, messages, restaurant] = await Promise.all([getCatalog("drink"), getMenuMessages(locale), getPublicRestaurant()]);

  return (
    <>
      <section className="menu-hero"><div className="site-container"><div className="menu-intro-row"><div><p className="eyebrow">{messages.drinksEyebrow}</p><h1 className="font-serif">{messages.drinksTitle}</h1><p>{messages.drinksIntro}</p></div><Link href={`/${locale}/carta`} className="editorial-link">{messages.foodLink}<ArrowRight aria-hidden="true" className="size-4" /></Link></div></div></section>
      <div className="menu-content"><div className="site-container">
        {catalog.products.length > 0 ? <><CatalogExplorer catalog={catalog} locale={locale} labels={messages.ui} heading={messages.drinksCatalogTitle} /><div className="mt-10 border-t border-border pt-5"><a href={restaurant.mobile.href} className="editorial-link"><Phone aria-hidden="true" className="size-4" />{messages.call}</a></div></> : (
          <section className="max-w-3xl border-b border-border py-5" aria-label={messages.drinksTitle}><Wine aria-hidden="true" className="size-8 text-olive" strokeWidth={1} /><p className="mt-4 text-sm leading-relaxed text-oak">{messages.drinksMissing}</p><a href={restaurant.mobile.href} className={buttonVariants({ className: "mt-5" })}><Phone aria-hidden="true" />{messages.call}</a></section>
        )}
        <noscript><p className="mt-8 rounded-sm border border-border bg-card p-4 text-sm">{messages.ui.noJavaScript}</p></noscript>
        {catalog.products.length === 0 && process.env.NODE_ENV === "development" && <details className="mt-12 rounded-sm border border-dashed border-border bg-card p-5 sm:p-8" data-nosnippet>
          <summary className="min-h-11 cursor-pointer py-3 font-semibold">{messages.openDemo}</summary>
          <div className="mt-6"><h2 className="font-serif text-3xl">{messages.demoTitle}</h2><p className="mt-4 mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">{messages.demoNote}</p><CatalogExplorer catalog={catalogSchema.parse(demoDrinks)} locale={locale} labels={messages.ui} heading={messages.drinksTitle} /></div>
        </details>}
      </div></div>
    </>
  );
}
