"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { useApi } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import { formatPrice } from "@/lib/productTypes";
import type { BlockLink, BlockLinkType, Product } from "@/types";
import type { ProductRow } from "@/types/database";
import { normalizeLink } from "@/lib/links";

interface LinkEditorProps {
  value: BlockLink | undefined;
  onChange: (link: BlockLink) => void;
  label?: string;
}

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const tabs: { value: BlockLinkType; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "internal", label: "Page interne" },
  { value: "external", label: "URL externe" },
  { value: "product", label: "Produit" },
];

export default function LinkEditor({ value, onChange, label }: LinkEditorProps) {
  const { state } = useBuilder();
  const { data: rawProducts } = useApi<ProductRow[]>("/api/products");
  const products: Product[] = rawProducts ? rawProducts.map(dbToProduct) : [];
  const [productSearch, setProductSearch] = useState("");
  const [productOpen, setProductOpen] = useState(false);

  const current = normalizeLink(value);

  const setType = (type: BlockLinkType) => {
    switch (type) {
      case "none": onChange({ type: "none" }); break;
      case "internal": onChange({ type: "internal", pageId: "" }); break;
      case "external": onChange({ type: "external", url: "", newTab: true }); break;
      case "product": onChange({ type: "product", productId: "", mode: "checkout" }); break;
    }
  };

  const pages = state.site.pages;

  // Products filtered by search
  const filteredProducts = products.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = current.type === "product"
    ? products.find((p) => p.id === current.productId)
    : undefined;

  return (
    <div className="space-y-2">
      {label && <label className="block text-[11px] font-medium text-[#999]">{label}</label>}

      {/* Tab pills */}
      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
              current.type === t.value
                ? "bg-[#4F46E5] text-white"
                : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Internal page */}
      {current.type === "internal" && (
        <div className="space-y-2">
          <select
            value={current.pageId}
            onChange={(e) => onChange({ ...current, pageId: e.target.value })}
            className={inputClass}
          >
            <option value="">Choisir une page...</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
            ))}
          </select>
          <input
            type="text"
            value={current.anchor ?? ""}
            onChange={(e) => onChange({ ...current, anchor: e.target.value || undefined })}
            placeholder="Ancre optionnelle (ex: section-tarifs)"
            className={inputClass}
          />
        </div>
      )}

      {/* External URL */}
      {current.type === "external" && (
        <div className="space-y-2">
          <input
            type="url"
            value={current.url}
            onChange={(e) => onChange({ ...current, url: e.target.value })}
            placeholder="https://..."
            className={inputClass}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={current.newTab}
              onChange={(e) => onChange({ ...current, newTab: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
            />
            <span className="text-[11px] text-[#999]">Ouvrir dans un nouvel onglet</span>
          </label>
        </div>
      )}

      {/* Product */}
      {current.type === "product" && (
        <div className="space-y-2">
          <div className="relative">
            {selectedProduct ? (
              <div className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg p-2 flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-[#1A1A1A]">{selectedProduct.name}</div>
                  <div className="text-[10px] text-[#999]">{formatPrice(selectedProduct.priceCents)} — {selectedProduct.category}</div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setProductOpen(true)} className="text-[10px] font-medium text-[#4F46E5] hover:underline">Changer</button>
                  <button onClick={() => onChange({ ...current, productId: "" })} className="text-[10px] font-medium text-[#999] hover:text-red-500">x</button>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setProductOpen(true); }}
                onFocus={() => setProductOpen(true)}
                placeholder="Rechercher un produit..."
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
                    placeholder="Rechercher un produit..."
                    className={`${inputClass} mt-1 relative z-20`}
                  />
                )}
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg max-h-36 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { onChange({ ...current, productId: p.id }); setProductOpen(false); setProductSearch(""); }}
                      className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#F7F7F5] transition-colors text-left"
                    >
                      <span className="text-[12px] text-[#1A1A1A]">{p.name}</span>
                      <span className="text-[10px] text-[#4F46E5]">{formatPrice(p.priceCents)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Warning: no product selected */}
          {!selectedProduct && current.productId === "" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span className="text-[11px] text-amber-700 font-medium">Produit obligatoire — le CTA sera desactive</span>
            </div>
          )}

          {/* Mode: page produit vs checkout */}
          <div className="flex gap-1.5">
            {(["checkout", "page"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onChange({ ...current, mode: m })}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                  current.mode === m
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"
                }`}
              >
                {m === "checkout" ? "Checkout" : "Page produit"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
