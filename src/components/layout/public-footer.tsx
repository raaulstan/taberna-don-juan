import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { site } from "@/config/site";
import { getPublicRestaurant } from "@/services/public/content";
import { BrandLogo } from "@/components/layout/brand-logo";
import type { Locale } from "@/i18n/config";
import { readablePhone } from "@/lib/format/phone";

export async function PublicFooter({ locale }: { locale: Locale }) {
  const [t, nav, restaurant] = await Promise.all([
    getTranslations({ locale, namespace: "Footer" }),
    getTranslations({ locale, namespace: "Navigation" }),
    getPublicRestaurant(),
  ]);

  return (
    <footer className="public-footer wood-surface border-t border-honey/40 bg-walnut text-parchment">
      <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div><Link href={`/${locale}#inicio`} aria-label={site.name} className="inline-block"><BrandLogo /></Link><p className="mt-4 max-w-xs text-sm leading-relaxed text-parchment/85">{t("tagline")}</p><address className="mt-5 text-xs leading-relaxed not-italic text-parchment/90">{restaurant.address}<a href={restaurant.mobile.href} className="flex min-h-11 items-center underline underline-offset-4">{readablePhone(restaurant.mobile.display)}</a>{restaurant.email && <a href={`mailto:${restaurant.email}`} className="flex min-h-11 items-center break-all underline underline-offset-4">{restaurant.email}</a>}</address><p className="mt-2 text-xs leading-relaxed text-honey">{restaurant.hours[locale]}</p></div>
        <nav aria-label={t("explore")}><h2 className="eyebrow text-honey">{t("explore")}</h2><ul className="mt-4 text-sm">{[{ id: "carta", href: `/${locale}/carta`, label: nav("menu") }, { id: "bebidas", href: `/${locale}/bebidas`, label: nav("drinks") }, { id: "historia", href: `/${locale}#historia`, label: nav("story") }, { id: "contacto", href: `/${locale}#contacto`, label: nav("contact") }].map((item) => <li key={item.id}><Link href={item.href} className="inline-flex min-h-11 items-center hover:text-honey">{item.label}</Link></li>)}</ul></nav>
        <div><h2 className="eyebrow text-honey">{t("follow")}</h2><div className="mt-4 flex flex-col items-start text-sm">{restaurant.instagram && <a href={restaurant.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 hover:text-honey"><Instagram aria-hidden="true" className="size-4" />Instagram<ArrowUpRight aria-hidden="true" className="size-3" /></a>}{restaurant.facebook && <a href={restaurant.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3 hover:text-honey"><Facebook aria-hidden="true" className="size-4" />Facebook<ArrowUpRight aria-hidden="true" className="size-3" /></a>}</div></div>
      </div>
      <div className="border-t border-parchment/20">
        <div className="site-container py-6 text-xs text-parchment/85"><p>© {new Date().getFullYear()} · {t("signature")}</p></div>
      </div>
    </footer>
  );
}
