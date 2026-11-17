import "server-only";

import Image from "next/image";
import transparentDarkLogo from "../../../public/images/logo-oficial-transparente.png";
import transparentLightLogo from "../../../public/images/logo-oficial-claro.webp";
import { cn } from "@/lib/utils";
import { officialLogo as official } from "@/config/brand";

export function BrandLogo({ className, adaptive = false }: { className?: string; adaptive?: boolean }) {
  if (official && adaptive) return <span style={{ aspectRatio: `${official.width}/${official.height}` }} className={cn("brand-adaptive relative block h-16 w-auto max-w-32 sm:h-18 sm:max-w-36", className)}><Image src={transparentLightLogo} unoptimized alt="Taberna Don Juan" width={official.width} height={official.height} className="brand-logo-light absolute inset-0 size-full object-contain" /><Image src={transparentDarkLogo} unoptimized alt="" aria-hidden="true" width={official.width} height={official.height} className="brand-logo-dark absolute inset-0 size-full object-contain" /></span>;
  if (official) return <Image src="/images/logo-oficial-claro.webp" alt="Taberna Don Juan" width={official.width} height={official.height} style={{ aspectRatio: `${official.width}/${official.height}` }} className={cn("h-16 w-auto max-w-32 object-contain sm:h-18 sm:max-w-36", className)} />;
  return <span className={cn("flex items-center gap-2 sm:gap-3", className)}><Image src="/images/brand.webp" alt="" width={38} height={49} className="h-11 w-auto shrink-0 brightness-0 invert" /><span className="font-serif text-[1.05rem] leading-tight tracking-wide sm:text-xl"><span className="block text-[0.6rem] tracking-[0.28em] text-honey uppercase">Taberna</span>Don Juan</span></span>;
}
