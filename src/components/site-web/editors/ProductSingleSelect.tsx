"use client";

import { useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import { formatPrice } from "@/lib/productTypes";
import type { Product, ProductType } from "@/types";
import type { ProductRow } from "@/types/database";

interface ProductSingleSelectProps {
  selectedId: string;
  onChange: (id: string) => void;
  filterType?: ProductType;
  label?: string;
}

export default function ProductSingleSelect({ selectedId, onChange, filterType, label }: ProductSingleSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: rawProducts } = useApi<ProductRow[]>("/api/products");
  const products: Product[] = rawProducts ? rawProducts.map(dbToProduct) : [];

  const selected = products.find((p) => p.id === selectedId);

  const available = products.filter((p) => {
    if (filterType && p.type !== filterType) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const select = (id: string) => {
    onChange(id);
    setSearch("");
    setOpen(false);
  };

  if (selected) {
    return (
      <div className="space-y-1.5">
        {label && <label className="block text-[11px] font-medium text-[#999]">{label}</label>}
        <div className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[#191919]">{selected.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-medium text-[#999] bg-white px-1.5 py-0.5 rounded">{selected.category}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  selected.type === "pack" ? "bg-[#4F46E5]/10 text-[#4F46E5]" :
                  selected.type === "digital" ? "bg-emerald-50 text-emerald-600" :
                  "bg-blue-50 text-blue-600"
                }`}>
                  {selected.type === "pack" ? "Pack" : selected.type === "digital" ? "Digital" : "Service"}
                </span>
              </div>
              <div className="text-[11px] text-[#999] mt-1">{selected.shortDescription}</div>
              <div className="text-[14px] font-bold text-[#4F46E5] mt-1">{formatPrice(selected.priceCents)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setOpen(true)}
              className="text-[11px] font-medium text-[#4F46E5] hover:underline"
            >
              Changer
            </button>
            <button
              onClick={() => onChange("")}
              className="text-[11px] font-medium text-[#999] hover:text-red-500 transition-colors"
            >
              Retirer
            </button>
          </div>
        </div>

        {/* Dropdown overlay when "Changer" is clicked */}
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="relative z-20">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                placeholder="Rechercher un produit…"
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {available.map((p) => (
                  <button
                    key={p.id}
                    data-testid="product-option"
                    data-guide="product-option"
                    onClick={() => select(p.id)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors text-left"
                  >
                    <div>
                      <div className="text-[13px] font-medium text-[#191919]">{p.name}</div>
                      <span className="text-[10px] font-medium text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded">{p.category}</span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#4F46E5]">{formatPrice(p.priceCents)}</span>
                  </button>
                ))}
                {available.length === 0 && (
                  <div className="p-3 text-[12px] text-[#999]">Aucun produit trouvé</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // No product selected — show search
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[11px] font-medium text-[#999]">{label}</label>}
      <div className="relative">
        <input
          data-guide="products-search"
          data-testid="products-search"
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit…"
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
        />
        {open && available.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {available.map((p) => (
              <button
                key={p.id}
                data-testid="product-option"
                data-guide="product-option"
                onClick={() => select(p.id)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors text-left"
              >
                <div>
                  <div className="text-[13px] font-medium text-[#191919]">{p.name}</div>
                  <span className="text-[10px] font-medium text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded">{p.category}</span>
                </div>
                <span className="text-[12px] font-semibold text-[#4F46E5]">{formatPrice(p.priceCents)}</span>
              </button>
            ))}
          </div>
        )}
        {open && available.length === 0 && search && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg p-3 text-[12px] text-[#999]">
            Aucun produit trouvé
          </div>
        )}
      </div>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
}
