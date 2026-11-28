"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The public navbar and footer; the admin panel has its own chrome. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return children;
}
