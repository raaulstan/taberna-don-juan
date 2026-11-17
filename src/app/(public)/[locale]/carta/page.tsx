import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CatalogExplorer } from "@/features/menu/components/catalog-explorer";
import { getCatalog } from "@/features/menu/data/get-catalog";
import { getMenuMessages } from "@/features/menu/messages";
import { isLocale } from "@/i18n/config";
import { localizedMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMenuMessages(locale);
  return localizedMetadata({ locale, path: "/carta", title: `${messages.foodTitle} | Taberna Don Juan`, description: messages.foodDescription });
}

export default async function FoodMenuPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [catalog, messages] = await Promise.all([getCatalog("food"), getMenuMessages(locale)]);

  return (
    <>
      <section className="menu-hero">
        <div className="site-container"><Reveal className="menu-intro-row"><div><p className="eyebrow">{messages.eyebrow}</p><h1 className="font-serif">{messages.foodTitle}</h1><p>{messages.intro}</p></div><Link href={`/${locale}/bebidas`} className="editorial-link">{messages.drinksLink}<ArrowRight aria-hidden="true" className="size-4" /></Link></Reveal></div>
      </section>
      <div className="menu-content"><div className="site-container">
        <noscript><p className="mb-8 rounded-sm border border-border bg-card p-4 text-sm">{messages.ui.noJavaScript}</p></noscript>
        <CatalogExplorer catalog={catalog} locale={locale} labels={messages.ui} heading={messages.catalogTitle} specialtiesHeading={messages.specialties} specialtiesIntro={messages.specialtiesIntro} />
      </div></div>
    </>
  );
}
