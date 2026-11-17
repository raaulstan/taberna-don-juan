"use client";

import { Button } from "@/components/ui/button";

export default function PrivateError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="font-serif text-3xl">No se ha podido cargar el área privada</h1>
      <p className="mt-5 leading-relaxed text-muted-foreground">Inténtalo de nuevo en unos instantes.</p>
      <Button className="mt-6" onClick={reset}>Volver a intentar</Button>
    </main>
  );
}
