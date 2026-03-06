"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Site, Product } from "@/types";

export interface LinkContextValue {
  site: Site;
  productSlugMap: Map<string, string>; // productId → slug
}

const LinkContext = createContext<LinkContextValue | null>(null);

export function LinkProvider({ site, products, children }: { site: Site; products?: Product[]; children: ReactNode }) {
  const productSlugMap = useMemo(() => {
    const map = new Map<string, string>();
    if (products) {
      for (const p of products) {
        if (p.slug) map.set(p.id, p.slug);
      }
    }
    return map;
  }, [products]);

  return <LinkContext.Provider value={{ site, productSlugMap }}>{children}</LinkContext.Provider>;
}

export function useLinkContext(): LinkContextValue | null {
  return useContext(LinkContext);
}
