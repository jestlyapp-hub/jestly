"use client";

import { createContext, useContext, useMemo } from "react";
import type { Product } from "@/types";

interface ProductContextValue {
  products: Map<string, Product>;
  isPublic: boolean;
}

const ProductContext = createContext<ProductContextValue>({
  products: new Map(),
  isPublic: false,
});

interface ProductProviderProps {
  products: Product[];
  children: React.ReactNode;
}

/**
 * Provides prefetched products to block renderers in the public site.
 * In builder mode, this context is absent and blocks fall back to mock data.
 */
export function ProductProvider({ products, children }: ProductProviderProps) {
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      map.set(p.id, p);
    }
    return map;
  }, [products]);

  return (
    <ProductContext.Provider value={{ products: productMap, isPublic: true }}>
      {children}
    </ProductContext.Provider>
  );
}

/**
 * Hook to access products from context.
 * Returns the product map and whether we're in public mode.
 */
export function useProducts() {
  return useContext(ProductContext);
}

/**
 * Get products by IDs from context, falling back to empty array.
 */
export function useProductsByIds(ids: string[]): Product[] {
  const { products } = useProducts();
  return ids
    .map((id) => products.get(id))
    .filter((p): p is Product => p !== undefined);
}

/**
 * Get a single product by ID from context.
 */
export function useProductById(id: string): Product | undefined {
  const { products } = useProducts();
  return products.get(id);
}
