import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { isLocale, locales } from "@/i18n/config";
import { site } from "@/config/site";
import { isLegalDocument, legalConfiguration, legalDocuments, legalIdentity } from "@/config/legal";
import { legalCopy } from "@/features/legal/content";
import { getPublicRestaurant } from "@/services/public/content";
import { readablePhone } from "@/lib/format/phone";

type Props = { params: Promise<{ locale: string; document: string }> };
export function generateStaticParams() { return legalDocuments.map((document) => ({ document })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, document } = await params;
  if (!isLocale(locale) || !isLegalDocument(document)) notFound();
  const content = legalCopy[locale].documents[document];
  return {
    title: `${content.title} | ${site.name}`, description: content.intro,
    robots: { index: false, follow: true },
    alternates: { canonical: `${site.url}/${locale}/legal/${document}`, languages: Object.fromEntries(locales.map((language) => [language, `${site.url}/${language}/legal/${document}`])) },
  };
}

export default async function LegalPage({ params }: Props) {
  const { locale, document } = await params;
  if (!isLocale(locale) || !isLegalDocument(document)) notFound();
  setRequestLocale(locale);
  const labels = legalCopy[locale];
  const content = labels.documents[document];
  const restaurant = await getPublicRestaurant();
  const fields: (keyof typeof legalIdentity)[] = ["name", "taxId", "registeredAddress", "contactEmail"];
  if (legalConfiguration.businessType !== "individual" || legalIdentity.registryDetails) fields.push("registryDetails");
  const pending: string[] = fields.filter((field) => !legalIdentity[field].trim()).map((field) => labels.identityFields[field]);
  if (legalConfiguration.businessType === "unconfirmed") pending.push(labels.businessTypePending);
  if (!legalConfiguration.hostingTermsConfirmed) pending.push(labels.hostingPending);
  if (!legalConfiguration.retentionCriteriaConfirmed) pending.push(labels.retentionPending);
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Europe/Madrid" }).format(new Date(`${legalConfiguration.updatedAt}T12:00:00Z`));

  return <article className="legal-document site-container section-space">
    <header className="max-w-3xl"><p className="eyebrow text-oak">{site.name}</p><h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">{content.title}</h1><p className="mt-5 text-sm leading-relaxed text-oak">{content.intro}</p><p className="mt-4 text-xs text-oak">{labels.updated}: <time dateTime={legalConfiguration.updatedAt}>{updated}</time></p></header>
    <div className="mt-8 max-w-3xl space-y-9">
      {pending.length > 0 && <aside aria-labelledby="legal-pending-title" className="legal-pending"><h2 id="legal-pending-title" className="font-semibold">{labels.pendingTitle}</h2><p className="mt-3">{labels.pendingIntro}</p><ul className="mt-3 list-disc space-y-1.5 pl-5">{pending.map((item) => <li key={item}>{item}</li>)}</ul></aside>}
      <nav aria-label={labels.pageContents} className="legal-index"><p className="font-semibold">{labels.pageContents}</p><ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><li><a href="#titular">{labels.identityTitle}</a></li>{content.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
      <section id="titular" aria-labelledby="legal-identity-title"><h2 id="legal-identity-title" className="font-serif text-2xl sm:text-3xl">{labels.identityTitle}</h2><dl className="legal-identity mt-5">{fields.map((field) => <div key={field}><dt>{labels.identityFields[field]}</dt><dd data-pending={!legalIdentity[field]}>{legalIdentity[field] || labels.pendingValue}</dd></div>)}</dl><div className="mt-5 text-sm leading-relaxed text-oak"><p className="font-semibold">{labels.restaurantContact}: {site.name}</p><address className="mt-2 not-italic">{restaurant.address}</address><a href={restaurant.mobile.href} className="editorial-link mt-1">{readablePhone(restaurant.mobile.display)}</a></div></section>
      {content.sections.map((section) => <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}><h2 id={`${section.id}-title`} className="font-serif text-2xl leading-tight sm:text-3xl">{section.title}</h2><div className="mt-4 space-y-4 leading-relaxed text-oak">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}
      <section aria-labelledby="legal-references-title" className="border-t border-border pt-6"><h2 id="legal-references-title" className="font-serif text-2xl">{labels.references}</h2><ul className="mt-3 space-y-2 text-sm"><li><a className="editorial-link" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel · Privacy Notice</a></li><li><a className="editorial-link" href="https://vercel.com/legal/dpa" target="_blank" rel="noopener noreferrer">Vercel · Data Processing Addendum</a></li><li><a className="editorial-link" href="https://www.aepd.es/" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos</a></li></ul></section>
      <nav aria-label={labels.otherDocuments} className="border-t border-border pt-6"><p className="font-semibold">{labels.otherDocuments}</p><ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">{legalDocuments.filter((value) => value !== document).map((value) => <li key={value}><Link className="editorial-link" href={`/${locale}/legal/${value}`}>{labels.documents[value].title}</Link></li>)}</ul></nav>
    </div>
  </article>;
}
