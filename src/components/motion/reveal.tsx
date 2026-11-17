"use client";

import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { motionDuration, motionEase } from "@/config/motion";

// La presentación en servidor siempre es visible, también sin JavaScript.
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        className={className}
        initial={false}
        whileInView={reduceMotion === false ? { y: [12, 0] } : { y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion === false ? motionDuration.reveal : 0, delay: reduceMotion === false ? Math.min(delay, 0.32) : 0, ease: motionEase }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
