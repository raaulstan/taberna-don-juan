"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="es"><head><meta name="robots" content="noindex,nofollow" /></head><body><main className="mx-auto max-w-xl px-6 py-20"><p className="text-sm font-semibold tracking-widest text-oak uppercase">Taberna Don Juan</p><h1 className="mt-5 font-serif text-3xl">La información no está disponible</h1><p className="mt-5 leading-relaxed text-muted-foreground">Inténtalo de nuevo en unos instantes. / Please try again shortly.</p><button type="button" onClick={reset} className="mt-7 min-h-11 rounded-sm bg-walnut px-5 py-3 text-parchment">Reintentar / Retry</button></main></body></html>;
}
