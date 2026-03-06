"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import CheckoutStepper from "@/components/site-public/CheckoutStepper";
import type { Product } from "@/types";
import type { ProductRow } from "@/types/database";

export default function OrderPage() {
  const params = useParams<{ siteId: string; slug: string }>();
  const searchParams = useSearchParams();
  const briefTemplateId = searchParams.get("brief");

  const { data: rawProducts } = useApi<ProductRow[]>("/api/products");
  const products: Product[] = useMemo(() => rawProducts ? rawProducts.map(dbToProduct) : [], [rawProducts]);
  const product = products.find((p) => p.slug === params.slug);

  if (!rawProducts) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="h-8 w-48 bg-[#F7F7F5] rounded animate-pulse mx-auto mb-4" />
        <div className="h-4 w-32 bg-[#F7F7F5] rounded animate-pulse mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-5xl mb-4">404</div>
        <h1 className="text-xl font-bold text-[#1A1A1A] mb-2">Produit introuvable</h1>
        <p className="text-[13px] text-[#999]">Ce produit n&apos;existe pas ou a été retiré.</p>
      </div>
    );
  }

  return (
    <CheckoutStepper
      product={product}
      siteId={params.siteId}
      siteSlug=""
      briefTemplateId={briefTemplateId}
      useProductDefaultBrief={!briefTemplateId}
    />
  );
}
