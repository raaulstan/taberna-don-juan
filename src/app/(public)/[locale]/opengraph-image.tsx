import { ImageResponse } from "next/og";
import { officialLogoDataUrl } from "@/config/brand";
import { isLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

export const alt = "Taberna Don Juan · Málaga";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const logo = officialLogoDataUrl();
  const messages = await dictionaries[isLocale(locale) ? locale : "es"]();
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", padding: "70px", background: "#3B2115", color: "#F4E4C8", flexDirection: "column", justifyContent: "center", border: "18px solid #D5A65E" }}>{logo && <div style={{ display: "flex", width: 220, height: 120, marginBottom: 25, backgroundImage: `url(${logo})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "left center" }} />}<div style={{ display: "flex", fontSize: 26, letterSpacing: "6px", color: "#D5A65E", marginBottom: 35 }}>{messages.Home.location}</div><div style={{ display: "flex", fontSize: 92, fontWeight: 700 }}>Taberna Don Juan</div><div style={{ display: "flex", fontSize: 34, marginTop: 35 }}>{messages.Home.heroLine}</div></div>, size);
}
