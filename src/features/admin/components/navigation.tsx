"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminNavigation({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return <nav aria-label="Navegación del panel" className="flex flex-wrap gap-2 lg:flex-col">{items.map((item) => <Link key={item.href} href={item.href} prefetch={false} aria-current={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-sm px-4 py-2 text-sm hover:bg-parchment/10", (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))) && "bg-honey font-semibold text-walnut hover:bg-honey")}>{item.label}</Link>)}</nav>;
}
