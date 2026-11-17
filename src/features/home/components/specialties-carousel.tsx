"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { motionDuration, motionEase } from "@/config/motion";
import { DishArtwork } from "@/components/ui/dish-artwork";

export type SpecialtySlide = {
  id: string;
  image: string | null;
  name: string;
  description: string;
  price: string;
  sourceUrl: string;
};

type CarouselProps = {
  slides: SpecialtySlide[];
  labels: { carousel: string; previous: string; next: string; image: string; source: string; slide: string; price: string; placeholder?: string };
  onSelect?: (id: string, trigger: HTMLButtonElement) => void;
};

// Scroll snap nativo: gestos táctiles y contenido accesible incluso sin hidratación.
export function SpecialtiesCarousel({ slides, labels, onSelect }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      }
    }, { root: track, threshold: 0.6 });
    for (const slide of track.children) observer.observe(slide);
    return () => observer.disconnect();
  }, []);

  function goTo(index: number) {
    const track = trackRef.current;
    const slide = track?.children.item(index) as HTMLElement | null;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: reduceMotion ? "instant" : "smooth" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const index = event.key === "ArrowRight" ? Math.min(active + 1, slides.length - 1)
      : event.key === "ArrowLeft" ? Math.max(active - 1, 0)
        : event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : null;
    if (index !== null) { event.preventDefault(); goTo(index); }
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div role="region" aria-roledescription={labels.carousel} aria-label={labels.carousel} className="specialty-editorial min-w-0">
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={labels.carousel}
          className="specialties-track relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {slides.map((slide, index) => (
            <article key={slide.id} data-index={index} role="group" aria-roledescription={labels.slide} aria-label={`${index + 1} / ${slides.length}: ${slide.name}`} className="specialty-slide grid w-full min-w-0 shrink-0 snap-start snap-always md:grid-cols-[1fr_1.1fr]">
              <figure className="specialty-media relative overflow-hidden">
                <m.div initial={{ scale: 1 }} animate={{ scale: reduceMotion === false && active !== index ? 1.025 : 1 }} transition={{ duration: reduceMotion === false ? motionDuration.reveal : 0, ease: motionEase }} className="absolute inset-0 overflow-hidden">
                  {slide.image ? <Image src={slide.image} alt="" fill sizes="(min-width: 1280px) 520px, (min-width: 768px) 45vw, 100vw" className="object-cover" /> : <DishArtwork label={labels.placeholder ?? labels.image} />}
                </m.div>
                <figcaption className="sr-only">{slide.image ? labels.image : labels.placeholder ?? labels.image}</figcaption>
              </figure>
              <m.div initial={{ x: 0 }} animate={{ x: reduceMotion === false && active !== index ? 6 : 0 }} transition={{ duration: reduceMotion === false ? motionDuration.standard : 0, ease: motionEase }} className="specialty-copy flex min-w-0 flex-col justify-center">
                <p className="eyebrow text-oak">0{index + 1} / 0{slides.length}</p>
                <h3 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{slide.name}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-oak">{slide.description}</p>
                <p className="mt-4 font-serif text-3xl text-olive"><span className="sr-only">{labels.price}: </span>{slide.price}</p>
                {onSelect ? (
                  <button type="button" aria-haspopup="dialog" onClick={(event) => onSelect(slide.id, event.currentTarget)} className="editorial-link mt-3 self-start text-left">
                    {labels.source}<ArrowUpRight aria-hidden="true" className="size-4" />
                  </button>
                ) : (
                  <a href={slide.sourceUrl} className="editorial-link mt-3 self-start">
                    {labels.source}<ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                )}
              </m.div>
            </article>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm tabular-nums text-oak" aria-live="polite" aria-atomic="true">{active + 1} / {slides.length}<span className="sr-only"> · {slides[active]?.name}</span></p>
          <div className="flex gap-3">
            {[{ label: labels.previous, index: active - 1, disabled: active === 0, Icon: ArrowLeft }, { label: labels.next, index: active + 1, disabled: active === slides.length - 1, Icon: ArrowRight }].map(({ label, index, disabled, Icon }) => (
              <m.button key={label} type="button" aria-label={label} tabIndex={disabled ? -1 : 0} disabled={disabled} onClick={() => goTo(index)} whileHover={!disabled && reduceMotion === false ? { y: -2 } : undefined} whileTap={!disabled && reduceMotion === false ? { scale: 0.97 } : undefined} transition={{ duration: motionDuration.fast }} className="flex size-12 items-center justify-center rounded-full border border-oak text-walnut transition-colors enabled:hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40">
                <Icon className="size-5" aria-hidden="true" />
              </m.button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-1" role="group" aria-label={labels.carousel}>
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" aria-label={`${index + 1}: ${slide.name}`} aria-current={active === index ? "true" : undefined} onClick={() => goTo(index)} className="flex size-11 items-center justify-center rounded-full text-oak">
              <m.span aria-hidden="true" initial={false} animate={{ scale: active === index ? 1.3 : 1 }} transition={{ duration: reduceMotion === false ? motionDuration.fast : 0 }} className={`size-2 rounded-full border border-oak ${active === index ? "bg-oak" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
      </div>
    </LazyMotion>
  );
}
