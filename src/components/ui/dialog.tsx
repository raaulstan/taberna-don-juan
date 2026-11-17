"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

export function DialogContent({ children, className, closeLabel, ...props }: ComponentProps<typeof DialogPrimitive.Content> & { closeLabel: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-50 bg-[#211109]/75" />
      <DialogPrimitive.Content
        className={cn("dialog-content fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-sm border border-border bg-card p-6 text-foreground shadow-2xl outline-none [scrollbar-gutter:stable] sm:p-8", className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close aria-label={closeLabel} className="interactive-control absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-border bg-card text-walnut hover:bg-secondary">
          <X aria-hidden="true" className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
