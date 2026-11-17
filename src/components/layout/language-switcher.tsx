"use client";

import Link from "next/link";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent } from "react";

import { locales, localeNames, type Locale } from "@/i18n/config";

function subscribeHash(callback: () => void) { window.addEventListener("hashchange", callback); return () => window.removeEventListener("hashchange", callback); }
function currentHash() { return window.location.hash; }
function serverHash() { return ""; }

export function LanguageSwitcher({ locale, routeSuffix, label }: { locale: Locale; routeSuffix: string; label: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const hash = useSyncExternalStore(subscribeHash, currentHash, serverHash);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && ref.current?.open && !ref.current.contains(event.target)) ref.current.open = false;
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function handleKeys(event: KeyboardEvent<HTMLDetailsElement>) {
    const details = ref.current;
    if (!details) return;
    if (event.key === "Escape" && details.open) {
      event.preventDefault(); details.open = false; details.querySelector("summary")?.focus(); return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    details.open = true;
    const links = Array.from(details.querySelectorAll<HTMLAnchorElement>("a"));
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : event.key === "ArrowUp" ? (index - 1 + links.length) % links.length : (index + 1) % links.length;
    links[next]?.focus();
  }

  return (
    <details ref={ref} className="header-language language-switcher" data-language-switcher onKeyDown={handleKeys} onBlur={(event) => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
      <summary aria-label={label} className="language-trigger"><Globe2 aria-hidden="true" /><span className="language-current-name" lang={locale}>{localeNames[locale]}</span><span className="language-current-code">{locale.toUpperCase()}</span><ChevronDown aria-hidden="true" className="language-chevron" /></summary>
      <div className="language-options"><p>{label}</p><ul aria-label={label}>
        {locales.map((language) => <li key={language}><Link href={`/${language}${routeSuffix}${hash}`} prefetch={false} hrefLang={language} lang={language} aria-label={localeNames[language]} aria-current={locale === language ? "true" : undefined} onClick={() => { if (ref.current) ref.current.open = false; }}><span className="language-option-check">{locale === language && <Check aria-hidden="true" />}</span><span>{localeNames[language]}</span><span className="language-option-code" aria-hidden="true">{language.toUpperCase()}</span></Link></li>)}
      </ul></div>
    </details>
  );
}
