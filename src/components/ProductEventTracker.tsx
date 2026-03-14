"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ProductEvents } from "@/lib/product-events";

// Composant invisible qui track les page views du dashboard
export default function ProductEventTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track les vues de pages dashboard (dédupliqué par la librairie)
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/site-web") ||
      pathname.startsWith("/commandes") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/produits") ||
      pathname.startsWith("/projets")
    ) {
      ProductEvents.pageViewed(pathname);
    }
  }, [pathname]);

  return null; // Composant invisible
}
