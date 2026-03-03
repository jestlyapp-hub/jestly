"use client";

import { useState, useRef } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { serviceToProduct } from "@/lib/adapters";
import type { Product, ProductType } from "@/types";
import type { Service } from "@/types/database";

interface ProductMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  filterType?: ProductType;
}

export default function ProductMultiSelect({ selectedIds, onChange, filterType }: ProductMultiSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: rawServices } = useApi<Service[]>("/api/products");
  const products: Product[] = rawServices ? rawServices.map(serviceToProduct) : [];

  const available = products.filter((p) => {
    if (filterType && p.type !== filterType) return false;
    if (selectedIds.includes(p.id)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const remove = (id: string) => onChange(selectedIds.filter((sid) => sid !== id));

  const add = (id: string) => {
    onChange([...selectedIds, id]);
    setSearch("");
    setOpen(false);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newIds = [...selectedIds];
    const [moved] = newIds.splice(dragIdx, 1);
    newIds.splice(idx, 0, moved);
    onChange(newIds);
    setDragIdx(idx);
  };

  const handleDragEnd = () => setDragIdx(null);

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProducts.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1.5 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] cursor-grab active:cursor-grabbing transition-opacity ${
                dragIdx === i ? "opacity-50" : ""
              }`}
            >
              <span className="font-medium text-[#1A1A1A]">{p.name}</span>
              <span className="text-[#999]">{p.price} €</span>
              <button
                onClick={() => remove(p.id)}
                className="ml-0.5 text-[#999] hover:text-red-500 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search + dropdown */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit…"
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
        />
        {open && available.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E6E6E4] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p.id)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors text-left"
              >
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A1A]">{p.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-medium text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded">{p.category}</span>
                    {!p.active && <span className="text-[10px] text-red-400">Inactif</span>}
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-[#4F46E5]">{p.price} €</span>
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

      {/* Click-outside handler */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
