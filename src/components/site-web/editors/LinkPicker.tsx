"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { useApi } from "@/lib/hooks/use-api";
import { serviceToProduct } from "@/lib/adapters";
import type { Link, LinkType, Product } from "@/types";

interface LinkPickerProps {
  value: Link | undefined;
  onChange: (link: Link) => void;
  label?: string;
}

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const linkTypes: { value: LinkType; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "internal_page", label: "Page interne" },
  { value: "external_url", label: "URL externe" },
  { value: "product", label: "Produit" },
  { value: "anchor", label: "Ancre (#)" },
];

export default function LinkPicker({ value, onChange, label }: LinkPickerProps) {
  const { state } = useBuilder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawServices } = useApi<any[]>("/api/products");
  const products: Product[] = rawServices ? rawServices.map(serviceToProduct) : [];
  const [productSearch, setProductSearch] = useState("");
  const [productOpen, setProductOpen] = useState(false);

  const current: Link = value ?? { type: "none", value: "" };

  const setType = (type: LinkType) => onChange({ type, value: "" });
  const setValue = (v: string) => onChange({ ...current, value: v });

  // All pages in the site
  const pages = state.site.pages;

  // All anchor IDs from all blocks in current page
  const currentPage = pages.find((p) => p.id === state.activePageId);
  const anchors = (currentPage?.blocks ?? [])
    .map((b) => b.settings?.anchorId)
    .filter((a): a is string => !!a);

  // Products filtered by search
  const filteredProducts = products.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = current.type === "product"
    ? products.find((p) => p.id === current.value)
    : undefined;

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] font-medium text-[#999]">{label}</label>}

      {/* Type selector */}
      <div className="flex flex-wrap gap-1">
        {linkTypes.map((lt) => (
          <button
            key={lt.value}
            onClick={() => setType(lt.value)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              current.type === lt.value
                ? "bg-[#4F46E5] text-white"
                : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
            }`}
          >
            {lt.label}
          </button>
        ))}
      </div>

      {/* Value input based on type */}
      {current.type === "internal_page" && (
        <select
          value={current.value}
          onChange={(e) => setValue(e.target.value)}
          className={inputClass}
        >
          <option value="">Choisir une page…</option>
          {pages.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
          ))}
        </select>
      )}

      {current.type === "external_url" && (
        <input
          type="url"
          value={current.value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      )}

      {current.type === "product" && (
        <div className="relative">
          {selectedProduct ? (
            <div className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg p-2 flex items-center justify-between">
              <div>
                <div className="text-[12px] font-medium text-[#1A1A1A]">{selectedProduct.name}</div>
                <div className="text-[10px] text-[#999]">{selectedProduct.price} € — {selectedProduct.category}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setProductOpen(true)} className="text-[10px] font-medium text-[#4F46E5] hover:underline">Changer</button>
                <button onClick={() => setValue("")} className="text-[10px] font-medium text-[#999] hover:text-red-500">×</button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setProductOpen(true); }}
              onFocus={() => setProductOpen(true)}
              placeholder="Rechercher un produit…"
              className={inputClass}
            />
          )}
          {productOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProductOpen(false)} />
              {selectedProduct && (
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  autoFocus
                  placeholder="Rechercher un produit…"
                  className={`${inputClass} mt-1 relative z-20`}
                />
              )}
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg max-h-36 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setValue(p.id); setProductOpen(false); setProductSearch(""); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#F7F7F5] transition-colors text-left"
                  >
                    <span className="text-[12px] text-[#1A1A1A]">{p.name}</span>
                    <span className="text-[10px] text-[#4F46E5]">{p.price} €</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {current.type === "anchor" && (
        anchors.length > 0 ? (
          <select
            value={current.value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
          >
            <option value="">Choisir une ancre…</option>
            {anchors.map((a) => (
              <option key={a} value={`#${a}`}>#{a}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={current.value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="#section-id"
            className={inputClass}
          />
        )
      )}
    </div>
  );
}
