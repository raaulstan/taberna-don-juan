"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

// Un único desplazamiento de escala, sin listeners de scroll, bucles ni parallax.
// El next/image se compone en servidor y conserva la precarga y los sizes.
export function HeroBackdrop({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        data-hero-backdrop
        className="pointer-events-none absolute inset-0 -z-20"
        initial={false}
        whileInView={reduceMotion === false ? { scale: [1.025, 1] } : { scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: reduceMotion === false ? 6 : 0, ease: "easeOut" }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
