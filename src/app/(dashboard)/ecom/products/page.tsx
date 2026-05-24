"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumber } from "@/lib/shopify/formatters";
import { Search } from "lucide-react";

interface ProductRow {
  id: string;
  shopify_product_id: string;
  title: string;
  handle: string | null;
  status: string;
  vendor: string | null;
  product_type: string | null;
  total_inventory: number | null;
  price_min: number | null;
  price_max: number | null;
  featured_image_url: string | null;
}

export default function EcomProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const { data, loading } = useApi<{ data: ProductRow[]; total: number }>(`/api/ecom/products?${params.toString()}`);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Produits</h1>
        <p className="text-[12px] text-[#8A8A88] mt-0.5">{data?.total ?? 0} produit{(data?.total ?? 0) > 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Titre…" className="w-full pl-8 pr-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30">
          <option value="">Tous statuts</option>
          <option value="ACTIVE">Actifs</option>
          <option value="DRAFT">Brouillons</option>
          <option value="ARCHIVED">Archivés</option>
        </select>
      </div>

      {loading ? (
        <div className="text-[12px] text-[#8A8A88] py-10 text-center">Chargement…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {data?.data.map((p) => (
            <Link key={p.id} href={`/ecom/products/${p.id}`} className="group bg-white border border-[#E6E6E4] rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
              <div className="aspect-square bg-[#F7F7F5] relative">
                {p.featured_image_url ? (
                  <Image src={p.featured_image_url} alt={p.title} fill className="object-cover" unoptimized />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#8A8A88]">Aucune image</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-[12px] font-semibold text-[#191919] line-clamp-2 group-hover:text-[#7C3AED] min-h-[2.4em]">{p.title}</h3>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-[12px] font-semibold text-[#191919] tabular-nums">
                    {p.price_min === p.price_max
                      ? formatCurrency(p.price_min ?? 0)
                      : `${formatCurrency(p.price_min ?? 0)} – ${formatCurrency(p.price_max ?? 0)}`}
                  </span>
                  {p.total_inventory != null && (
                    <span className={`text-[10px] font-medium ${p.total_inventory < 5 ? "text-rose-600" : "text-[#8A8A88]"}`}>
                      Stock {formatNumber(p.total_inventory)}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-[#8A8A88]">
                  <span className="uppercase tracking-wide">{p.status}</span>
                  {p.vendor && <> · {p.vendor}</>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
