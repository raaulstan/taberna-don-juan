import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { HeaderNavigation } from "@/components/layout/header-navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { site } from "@/config/site";
import { getPublicRestaurant } from "@/services/public/content";
import type { Locale } from "@/i18n/config";

export async function PublicHeader({ locale }: { locale: Locale }) {
  const [t, restaurant] = await Promise.all([getTranslations({ locale, namespace: "Navigation" }), getPublicRestaurant()]);

  return (
    <>
      <noscript><style>{`.public-site .public-header{background:var(--surface-ivory)!important;color:var(--walnut)!important}.public-site .public-header a{color:var(--walnut)!important}.public-site .public-header .brand-logo-light{opacity:0!important}.public-site .public-header .brand-logo-dark{opacity:1!important}.public-site .public-header [data-active-indicator]{background:var(--olive)!important}.public-site .public-header :focus-visible{outline-color:var(--olive)!important}.public-site .public-header [data-mobile-panel] nav a{color:var(--parchment)!important}.public-site .public-header [data-mobile-panel] [data-active-indicator]{background:var(--honey)!important}.public-site .public-header [data-mobile-panel] :focus-visible{outline-color:var(--honey)!important}`}</style></noscript>
      <a
        className="sr-only z-50 rounded-md bg-walnut px-5 py-3 text-parchment focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        href="#contenido"
      >
        {t("skip")}
      </a>
      <HeaderNavigation
        locale={locale}
        phoneHref={restaurant.mobile.href}
        items={[
          { id: "inicio", label: t("home") },
          { id: "carta", label: t("menu") },
          { id: "bebidas", label: t("drinks") },
          { id: "historia", label: t("story") },
          { id: "contacto", label: t("contact") },
        ]}
        labels={{ navigation: t("label"), languages: t("languages"), menu: t("openMenu"), close: t("closeMenu"), call: t("call") }}
        brand={
          <Link href={`/${locale}#inicio`} className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label={`${site.name} · ${t("home")}`}>
            <BrandLogo adaptive className="h-18 max-w-none sm:h-20 sm:max-w-none" />
          </Link>
        }
      />
    </>
  );
}
