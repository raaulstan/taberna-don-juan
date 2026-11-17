"use client";

import Image from "next/image";
import { useState } from "react";

import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { MenuProduct } from "../domain/catalog";
import { localize } from "../domain/queries";
import { DishArtwork } from "@/components/ui/dish-artwork";

export function ProductImage({ product, locale, label, large = false, thumbnail = false }: { product: MenuProduct; locale: Locale; label: string; large?: boolean; thumbnail?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const image = product.image;
  const showImage = image && failedSource !== image.src;

  return (
    <div className={cn("product-picture relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden", large && "aspect-[4/3]", thumbnail && "product-picture-thumbnail aspect-square")}>
      {showImage ? (
        <Image src={image.src} alt={localize(image.alt, locale)} fill sizes={thumbnail ? "88px" : large ? "(min-width: 768px) 420px, 100vw" : "(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw"} className="interactive-photo object-cover" onError={() => setFailedSource(image.src)} />
      ) : (
        <DishArtwork label={label} drink={product.kind === "drink"} />
      )}
    </div>
  );
}
