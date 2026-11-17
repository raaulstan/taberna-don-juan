"use client";

import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="site-container section-space"><h1 className="font-serif text-3xl">No se ha podido cargar la información / Information unavailable</h1><p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">Inténtalo de nuevo en unos instantes. / Please try again shortly.</p><Button className="mt-6" onClick={reset}>Reintentar / Retry</Button></section>;
}
