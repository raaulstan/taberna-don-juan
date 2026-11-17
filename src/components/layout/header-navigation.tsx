"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { AnimatePresence, LazyMotion, domAnimation, m, useAnimate, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { motionDuration, motionEase } from "@/config/motion";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { cn } from "@/lib/utils";

type NavigationItem = { id: string; label: string };
type HeaderNavigationProps = {
  brand: ReactNode;
  items: NavigationItem[];
  locale: Locale;
  labels: { navigation: string; languages: string; menu: string; close: string; call: string };
  phoneHref: string;
};

export function HeaderNavigation({ brand, items, locale, labels, phoneHref }: HeaderNavigationProps) {
  const [activeSection, setActiveSection] = useState("inicio");
  const [scrolled, setScrolled] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [panelRef, animatePanel] = useAnimate<HTMLDivElement>();
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const animationVersion = useRef(0);
  const closingRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const routeSuffix = pathname.split("/").slice(2).join("/") ? `/${pathname.split("/").slice(2).join("/")}` : "";
  const activeId = routeSuffix === "/carta" ? "carta" : routeSuffix === "/bebidas" ? "bebidas" : activeSection;

  function navigationHref(section: string) {
    if (section === "carta" || section === "bebidas") return `/${locale}/${section}`;
    return `/${locale}#${section}`;
  }

  const revealMenu = useCallback(() => {
    const details = detailsRef.current;
    const panel = panelRef.current;
    if (!details || !panel) return;
    const reversing = closingRef.current;
    const version = ++animationVersion.current;
    animationRef.current?.stop();
    closingRef.current = false;
    details.open = true;
    panel.inert = false;
    panel.dataset.state = "opening";
    const animation = animatePanel(panel, {
      y: reduceMotion === false && !reversing ? [-12, 0] : 0,
      opacity: reduceMotion === false && !reversing ? [0, 1] : 1,
      clipPath: reduceMotion === false && !reversing ? ["inset(0 0 100% 0)", "inset(0 0 0% 0)"] : "inset(0 0 0% 0)",
    }, { duration: reduceMotion === false ? motionDuration.standard : 0, ease: motionEase });
    animationRef.current = animation;
    void animation.then(() => {
      if (animationVersion.current === version) panel.dataset.state = "open";
    });
  }, [animatePanel, panelRef, reduceMotion]);

  const closeMenu = useCallback((immediate = false) => {
    const details = detailsRef.current;
    const panel = panelRef.current;
    if (!details?.open || !panel || (closingRef.current && !immediate)) return;
    const version = ++animationVersion.current;
    animationRef.current?.stop();
    closingRef.current = true;
    if (panel.contains(document.activeElement)) details.querySelector("summary")?.focus();
    panel.inert = true;
    panel.dataset.state = "closing";
    function finish() {
      if (animationVersion.current !== version || !details || !panel) return;
      details.open = false;
      panel.inert = false;
      panel.dataset.state = "closed";
      closingRef.current = false;
    }
    if (reduceMotion !== false || immediate) {
      finish();
      return;
    }
    const animation = animatePanel(panel, { y: -8, opacity: 0, clipPath: "inset(0 0 100% 0)" }, { duration: motionDuration.fast, ease: motionEase });
    animationRef.current = animation;
    void animation.then(finish);
  }, [animatePanel, panelRef, reduceMotion]);

  useEffect(() => {
    let frame = 0;
    function update() {
      frame = 0;
      setScrolled(window.scrollY > 20);
      let active = "inicio";
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= 180) active = item.id;
      }
      setActiveSection(active);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [items, pathname]);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const details = detailsRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) closeMenu();
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [closeMenu]);

  useEffect(() => {
    if (reduceMotion !== true) return;
    if (closingRef.current) {
      closeMenu(true);
    } else if (detailsRef.current?.open && panelRef.current) {
      animationVersion.current += 1;
      animationRef.current?.stop();
      panelRef.current.style.transform = "none";
      panelRef.current.style.opacity = "1";
      panelRef.current.style.clipPath = "inset(0 0 0% 0)";
      panelRef.current.dataset.state = "open";
    }
  }, [closeMenu, panelRef, reduceMotion]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    function update() { if (desktop.matches) closeMenu(true); }
    desktop.addEventListener("change", update);
    update();
    return () => desktop.removeEventListener("change", update);
  }, [closeMenu]);

  useEffect(() => () => {
    animationVersion.current += 1;
    animationRef.current?.stop();
  }, []);

  const navigationLinks = (mobile = false) => items.map((item) => (
    <Link
      key={item.id}
      href={navigationHref(item.id)}
      aria-current={activeId === item.id ? "location" : undefined}
      onClick={() => closeMenu()}
      className={cn(
        "relative flex min-h-11 items-center text-sm transition-colors hover:text-honey",
        mobile ? "border-b border-parchment/15 px-3 py-3" : "px-1",
        activeId === item.id && "text-honey",
      )}
    >
      {item.label}
      <AnimatePresence initial={false}>
        {activeId === item.id && <m.span
          key={item.id}
          aria-hidden="true"
          data-active-indicator
          initial={reduceMotion === false ? mobile ? { scaleY: 0 } : { scaleX: 0 } : false}
          animate={mobile ? { scaleY: 1 } : { scaleX: 1 }}
          exit={mobile ? { scaleY: 0 } : { scaleX: 0 }}
          transition={{ duration: reduceMotion === false ? motionDuration.fast : 0, ease: motionEase }}
          className={mobile ? "absolute top-3 bottom-3 left-0 w-0.5 bg-honey" : "absolute inset-x-1 bottom-0 h-px bg-honey"}
        />}
      </AnimatePresence>
    </Link>
  ));

  return (
    <LazyMotion features={domAnimation} strict>
      <header
        data-scrolled={scrolled}
        data-home={routeSuffix === "" || routeSuffix === "/"}
        className="public-header sticky top-0 z-40 isolate border-b border-honey/20 bg-walnut text-parchment"
      >
        <m.div aria-hidden="true" data-header-chrome initial={false} animate={{ opacity: scrolled ? 1 : 0 }} transition={{ duration: reduceMotion === false ? motionDuration.standard : 0 }} className="pointer-events-none absolute inset-0 -z-10 bg-[#2a180f] shadow-[0_8px_24px_#21110926]" />
        <div className="header-row site-container relative flex items-center justify-between gap-2">
          {brand}
          <nav aria-label={labels.navigation} className="hidden items-center gap-7 xl:flex">
            {navigationLinks()}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <LanguageSwitcher locale={locale} routeSuffix={routeSuffix} label={labels.languages} />
            <a href={phoneHref} className="header-call interactive-control hidden min-h-11 items-center gap-2 text-parchment hover:text-honey md:inline-flex">
              <Phone aria-hidden="true" className="size-4" />{labels.call}
            </a>
            <details
              ref={detailsRef}
              data-mobile-menu
              className="group xl:hidden"
              onToggle={(event) => {
                if (event.currentTarget.open && !closingRef.current) revealMenu();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && detailsRef.current?.open) {
                  event.preventDefault();
                  closeMenu();
                  detailsRef.current.querySelector("summary")?.focus();
                }
              }}
              onBlur={(event) => {
                if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) closeMenu();
              }}
            >
              <summary
                onClick={(event) => {
                  if (detailsRef.current?.open) {
                    event.preventDefault();
                    if (closingRef.current) revealMenu();
                    else closeMenu();
                  }
                }}
                className="interactive-control flex size-11 cursor-pointer list-none items-center justify-center rounded-sm border border-honey/50 hover:bg-parchment/10 marker:content-none [&::-webkit-details-marker]:hidden"
              >
                <Menu aria-hidden="true" className="size-5 group-open:hidden" />
                <X aria-hidden="true" className="hidden size-5 group-open:block" />
                <span className="sr-only group-open:hidden">{labels.menu}</span>
                <span className="sr-only hidden group-open:inline">{labels.close}</span>
              </summary>
              <div ref={panelRef} data-mobile-panel className="absolute inset-x-0 top-full max-h-[calc(100dvh-6rem)] origin-top overflow-y-auto overscroll-contain border-b border-honey/40 bg-walnut px-6 pb-6 shadow-xl">
                <nav aria-label={labels.navigation}>{navigationLinks(true)}</nav>
                <a href={phoneHref} className="interactive-control mt-5 flex min-h-11 items-center justify-center gap-2 rounded-sm bg-honey px-4 py-3 text-sm font-semibold text-walnut hover:bg-parchment">
                  <Phone aria-hidden="true" className="size-4" />{labels.call}
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>
    </LazyMotion>
  );
}
