import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MediaPlaceholder({ label, className }: { label: string; className?: string }) {
  return <div role="img" aria-label={label} className={cn("media-placeholder", className)}><span><ImageIcon aria-hidden="true" strokeWidth={1} /><span>{label}</span></span></div>;
}
