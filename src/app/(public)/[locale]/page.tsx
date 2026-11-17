import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clock3, ImageIcon, MapPin, Phone, Wine } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { SpecialtiesCarousel } from "@/features/home/components/specialties-carousel";
import { HeroBackdrop } from "@/features/home/components/hero-backdrop";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { categories, specialties } from "@/features/home/data/restaurant";
import { getCatalog } from "@/features/menu/data/get-catalog";
import { localize, formatPrice } from "@/features/menu/domain/queries";
import { getPublicRestaurant, getPublishedSite, managedPublicData, publicImageUrl } from "@/services/public/content";
import { isLocale } from "@/i18n/config";
import { localizedMetadata } from "@/lib/seo/metadata";
import { restaurantStructuredData, serializeJsonLd } from "@/lib/seo/structured-data";
import { readablePhone } from "@/lib/format/phone";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return localizedMetadata({ locale, title: t("title"), description: t("description") });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const [t, catalog, restaurant, content] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }), getCatalog("food"), getPublicRestaurant(), getPublishedSite(),
  ]);
  const managed = managedPublicData();
  const slides = managed ? catalog.featuredIds.flatMap((id) => {
    const product = catalog.products.find((item) => item.id === id);
    if (!product || product.priceCents === null) return [];
    return [{ id: product.id, image: product.image?.src ?? null, name: localize(product.name, locale), description: localize(product.description, locale), price: formatPrice(product.priceCents, locale), sourceUrl: `/${locale}/carta#producto-${product.id}` }];
  }) : specialties.map((dish) => {
    const product = catalog.products.find((item) => item.id === dish.productId);
    if (!product || product.priceCents === null) throw new Error("Especialidad sin producto publicado.");
    // Una ilustración de categoría nunca se utiliza como foto de un plato.
    return { id: dish.id, image: product.image?.src ?? null, name: t(`${dish.id}Name`), description: t(`${dish.id}Description`), price: formatPrice(product.priceCents, locale), sourceUrl: `/${locale}/carta#producto-${product.id}` };
  });
  const categoryCards = managed
    ? catalog.categories.filter((category) => category.parentId === null).map((category) => ({ id: category.id, label: localize(category.label, locale), image: categories.find((item) => item.id === category.id)?.image ?? null, href: `/carta#categoria-${category.id}` }))
    : categories.filter((category) => category.id !== "drinks").map((category) => ({ ...category, label: t(category.id) }));
  const contentLocale = locale === "en" ? "en" : "es";
  const heroImage = content?.hero_path ? publicImageUrl(content.hero_path) : null;
  const storyImage = content?.story_path ? publicImageUrl(content.story_path) : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(restaurantStructuredData(restaurant)) }} />

      <section id="inicio" className="home-hero relative isolate overflow-hidden bg-walnut text-parchment" aria-labelledby="home-title">
        {heroImage ? <HeroBackdrop><Image src={heroImage} alt={content?.[`image_caption_${contentLocale}`] ?? ""} fill preload sizes="100vw" className="object-cover object-[68%_center]" /></HeroBackdrop> : <div aria-hidden="true" className="hero-background pointer-events-none absolute inset-0 -z-20" />}
        <div aria-hidden="true" className="hero-shade absolute inset-0 -z-10" />
        <div className="hero-layout site-container">
          <div className="hero-copy">
            <Reveal><p className="eyebrow flex items-center gap-3 text-honey"><span aria-hidden="true" className="h-px w-9 bg-honey" />{t("eyebrow")}</p></Reveal>
            <Reveal delay={0.06}><h1 id="home-title" className="hero-title">{content ? t("title") : <><span>Taberna</span>{" "}<em>Don Juan</em></>}</h1></Reveal>
            <Reveal delay={0.12}><p className="hero-tagline">{t("heroLine")}</p></Reveal>
            <Reveal delay={0.18}><p className="hero-description">{t("description")}</p></Reveal>
            <Reveal delay={0.24} className="hero-actions">
              <Link href={`/${locale}/carta`} className={buttonVariants({ variant: "accent" })}>{t("explore")}<ArrowRight aria-hidden="true" /></Link>
              <a href="#historia" className={cn(buttonVariants({ variant: "outline" }), "border-parchment/60 bg-walnut/20 text-parchment hover:bg-walnut/65")}>{t("meetUs")}</a>
            </Reveal>
          </div>
          <div className="hero-contact" role="group" aria-label={t("quickContact")}>
            <a href={restaurant.mobile.href} className="group">
              <Phone aria-hidden="true" />
              <span><span className="hero-contact-label">{t("callNow")}</span><span className="hero-contact-value hero-phone group-hover:underline group-hover:underline-offset-4">{readablePhone(restaurant.mobile.display)}</span></span>
            </a>
            <a href={restaurant.mapUrl} target="_blank" rel="noopener noreferrer" className="group">
              <MapPin aria-hidden="true" />
              <span><span className="hero-contact-label">{t("findUs")}</span><span className="hero-contact-value group-hover:underline group-hover:underline-offset-4">{restaurant.address}</span></span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          {!heroImage && <p className="hero-photo-label"><ImageIcon aria-hidden="true" strokeWidth={1} />{t("imageSpace")}</p>}
        </div>
      </section>

      <div className="signature-band"><div className="site-container"><span>{t("location")}</span><span aria-hidden="true">✦</span><span>{t("storyQuote")}</span><span aria-hidden="true">✦</span><span>{t("specialtiesEyebrow")}</span></div></div>

      <section id="especialidades" aria-labelledby="specialties-title" className="specialties-section section-space">
        <div className="site-container">
          <Reveal className="editorial-heading">
            <div><p className="eyebrow text-oak">{t("specialtiesEyebrow")}</p><p className="section-index mt-3" aria-hidden="true">01 —</p></div>
            <div><h2 id="specialties-title" className="section-heading max-w-xl">{t("specialtiesTitle")}</h2><p className="mt-4 text-sm leading-relaxed text-oak">{t("specialtiesDescription")}</p></div>
          </Reveal>
          {slides.length ? <SpecialtiesCarousel slides={slides} labels={{ carousel: t("carousel"), slide: t("slide"), previous: t("previous"), next: t("next"), image: t("managedImage"), placeholder: t("imageSpace"), source: t("viewSource"), price: t("price") }} /> : <p className="border-t border-border py-6 text-sm text-oak">{t("noSpecialties")}</p>}
        </div>
      </section>

      <section id="carta" aria-labelledby="menu-title" className="category-section section-space">
        <div className="site-container">
          <Reveal className="editorial-heading">
            <div><p className="eyebrow text-oak">{t("menuEyebrow")}</p><p className="section-index mt-3" aria-hidden="true">02 —</p></div>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="menu-title" className="section-heading">{t("menuTitle")}</h2><p className="mt-4 max-w-xl text-sm text-oak">{t("menuDescription")}</p></div><Link href={`/${locale}/carta`} className="editorial-link">{t("fullMenu")}<ArrowUpRight aria-hidden="true" className="size-4" /></Link></div>
          </Reveal>
          <div className="category-gallery">
            {categoryCards.map((category, index) => (
              <Reveal key={category.id} delay={(index % 3) * 0.04} className="category-tile">
                <Link href={`/${locale}${category.href}`} className="category-card interactive-card group relative isolate flex-col justify-end overflow-hidden bg-walnut text-parchment">
                  <MediaPlaceholder label={t("imageSpace")} className="category-media-slot absolute inset-0 -z-20" />
                  <div aria-hidden="true" className="category-shade absolute inset-0 -z-10" />
                  <span aria-hidden="true" className="category-number">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{category.label}</h3>
                  <span className="category-action">{t("viewCategory")}<ArrowUpRight aria-hidden="true" className="size-4 text-honey" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <aside id="bebidas" className="drinks-ribbon" aria-labelledby="drinks-title">
            <div className="flex items-start gap-4"><Wine aria-hidden="true" className="mt-1 size-7 shrink-0 text-honey" strokeWidth={1} /><div><h3 id="drinks-title">{t("drinks")}</h3><p className="mt-2">{t("drinksDescription")}</p></div></div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1"><Link href={`/${locale}/bebidas`} className="editorial-link">{t("viewDrinks")}<ArrowRight aria-hidden="true" className="size-4" /></Link><a href={restaurant.mobile.href} className="editorial-link"><Phone aria-hidden="true" className="size-4" />{t("drinksContact")}</a></div>
          </aside>
        </div>
      </section>

      <section id="historia" aria-labelledby="story-title" className="story-section section-space">
        <div className="site-container">
          <div className="story-grid">
            <Reveal className="story-copy">
              <p className="eyebrow text-oak">{t("storyEyebrow")} · 03</p>
              <h2 id="story-title" className="section-heading mt-5">{t("storyTitle")}</h2>
              <p className="story-lead">{t("storyLead")}</p>
              <p className="story-body">{t("storyDescription")}</p>
              <p className="story-quote">{t("storyQuote")}</p>
              <a href="#contacto" className="editorial-link mt-5">{t("contactTitle")}<ArrowRight aria-hidden="true" className="size-4" /></a>
            </Reveal>
            <Reveal delay={0.08}><div className="story-photo overflow-hidden">{storyImage ? <Image src={storyImage} alt={content?.[`image_caption_${contentLocale}`] ?? ""} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover object-[25%_center]" /> : <MediaPlaceholder label={t("imageSpace")} className="story-media-slot" />}</div></Reveal>
          </div>
        </div>
      </section>

      <section id="contacto" aria-labelledby="contact-title" className="contact-section section-space">
        <div className="site-container">
          <Reveal className="editorial-heading">
            <div><p className="eyebrow text-oak">{t("contactEyebrow")}</p><p className="section-index mt-3" aria-hidden="true">04 —</p></div>
            <div><h2 id="contact-title" className="section-heading">{t("contactTitle")}</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-oak">{t("contactDescription")}</p></div>
          </Reveal>
          <div className="contact-grid">
            <div className="contact-item"><MapPin aria-hidden="true" className="size-5 text-olive" /><h3>{t("addressLabel")}</h3><address className="not-italic">{restaurant.address}</address><div className="footer-contact-links mt-3"><a href={restaurant.mapUrl} target="_blank" rel="noopener noreferrer" className="editorial-link">Google Maps<ArrowUpRight aria-hidden="true" className="size-4" /></a><a href={restaurant.directionsUrl} target="_blank" rel="noopener noreferrer" className="editorial-link">{t("directions")}<ArrowRight aria-hidden="true" className="size-4" /></a></div></div>
            <div className="contact-item"><Clock3 aria-hidden="true" className="size-5 text-olive" /><h3>{t("hoursLabel")}</h3><p>{restaurant.hours[locale]}</p></div>
            <div className="contact-item"><Phone aria-hidden="true" className="size-5 text-olive" /><h3>{t("phoneLabel")}</h3><div className="contact-phone-list mt-3"><a href={restaurant.mobile.href} className="editorial-link"><span className="text-xs text-oak">{t("mobileLabel")}</span><span>{readablePhone(restaurant.mobile.display)}</span></a>{restaurant.landline.href && <a href={restaurant.landline.href} className="editorial-link"><span className="text-xs text-oak">{t("landlineLabel")}</span><span>{readablePhone(restaurant.landline.display)}</span></a>}{restaurant.email && <a href={`mailto:${restaurant.email}`} className="editorial-link break-all">{restaurant.email}</a>}</div></div>
          </div>
          {restaurant.closures.length > 0 && <section className="mt-8 border-t border-border pt-5" aria-label={t("closures")}><h3 className="font-serif text-2xl">{t("closures")}</h3><ul className="mt-4 space-y-3 text-sm">{restaurant.closures.map((closure, index) => <li key={`${closure.date}-${index}`}><time dateTime={closure.date}>{new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(`${closure.date}T12:00:00Z`))}</time> · {closure.label}</li>)}</ul></section>}
        </div>
      </section>
    </>
  );
}
