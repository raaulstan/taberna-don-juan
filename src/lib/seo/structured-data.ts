import { site } from "@/config/site";
import { restaurant } from "@/features/home/data/restaurant";
import { hasOfficialLogo } from "@/config/brand";

export function restaurantStructuredData(data: { mobile: { href: string }; instagram: string; facebook: string; street: string; postcode: string } = restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${site.url}/#restaurant`,
    name: site.name,
    url: site.url,
    ...(hasOfficialLogo ? { logo: `${site.url}/images/logo-oficial.webp` } : {}),
    telephone: data.mobile.href.replace("tel:", ""),
    sameAs: [data.instagram, data.facebook].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: data.street,
      ...(data.postcode ? { postalCode: data.postcode } : {}),
      addressLocality: "Málaga",
      addressCountry: "ES",
    },
  };
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
