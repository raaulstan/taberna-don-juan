import { Utensils, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

// Ilustración abstracta, no fotografía sintética de un producto.
export function DishArtwork({ label, drink = false, className }: { label: string; drink?: boolean; className?: string }) {
  const Icon = drink ? Wine : Utensils;
  return <div role="img" aria-label={label} className={cn("dish-artwork", className)}><div className="dish-artwork-plate" aria-hidden="true"><Icon strokeWidth={0.8} /></div><span aria-hidden="true" className="dish-artwork-signature">Don Juan</span></div>;
}
