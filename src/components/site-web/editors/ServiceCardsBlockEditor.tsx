"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductMultiSelect from "./ProductMultiSelect";
import BriefSelect from "./BriefSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const iconOptions = ["zap", "shield", "heart", "star", "clock", "globe", "palette"];

export default function ServiceCardsBlockEditor({ block }: { block: Extract<Block, { type: "service-cards" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const mode = block.content.mode || "static";
  const services = block.content.services;

  const updateService = (i: number, field: string, value: unknown) => {
    const next = services.map((s, j) => (j === i ? { ...s, [field]: value } : s));
    update({ services: next });
  };

  const addService = () => update({ services: [...services, { icon: "star", name: "Nouveau service", description: "Description...", features: [], ctaLabel: "Commander" }] });
  const removeService = (i: number) => update({ services: services.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Mode</label>
        <div className="flex gap-1.5">
          {(["static", "product_reference"] as const).map((m) => (
            <button key={m} onClick={() => update({ mode: m })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${mode === m ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>
              {m === "static" ? "Statique" : "Produits DB"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <div className="flex gap-1.5">
          {([2, 3] as const).map((n) => (
            <button key={n} onClick={() => update({ columns: n })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
          ))}
        </div>
      </div>

      {mode === "product_reference" ? (
        <>
          {/* Product selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Produits</label>
            <ProductMultiSelect
              selectedIds={block.content.productIds || []}
              onChange={(ids) => update({ productIds: ids })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Afficher le prix</label>
            <label className="flex items-center gap-2 text-[12px] text-[#666]">
              <input type="checkbox" checked={block.content.showPrice ?? true} onChange={(e) => update({ showPrice: e.target.checked })} />
              Afficher le prix
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Action CTA</label>
            <select value={block.content.ctaMode || "product_checkout"} onChange={(e) => update({ ctaMode: e.target.value })} className={inputClass}>
              <option value="product_page">Page produit</option>
              <option value="product_checkout">Checkout direct</option>
            </select>
          </div>

          {/* Brief settings */}
          <div className="border-t border-[#E6E6E4] pt-3">
            <BriefSelect
              briefTemplateId={block.content.briefTemplateId ?? null}
              useProductDefaultBrief={block.content.useProductDefaultBrief ?? false}
              briefRequired={block.content.briefRequired ?? false}
              onChange={(val) => update(val)}
            />
          </div>
        </>
      ) : (
        <>
          {/* Static services */}
          <div className="space-y-3">
            <label className="block text-[11px] font-medium text-[#999]">Services ({services.length})</label>
            {services.map((s, i) => (
              <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
                <button onClick={() => removeService(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
                <div className="flex gap-2">
                  <select value={s.icon} onChange={(e) => updateService(i, "icon", e.target.value)} className={`${inputClass} w-28`}>
                    {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input type="text" value={s.name} onChange={(e) => updateService(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
                </div>
                <textarea value={s.description} onChange={(e) => updateService(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
                <div className="flex gap-2">
                  <input type="number" value={s.price ?? ""} onChange={(e) => updateService(i, "price", e.target.value ? Number(e.target.value) : undefined)} placeholder="Prix (optionnel)" className={`${inputClass} w-32`} />
                  <input type="text" value={s.ctaLabel} onChange={(e) => updateService(i, "ctaLabel", e.target.value)} placeholder="CTA" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#999] mb-0.5">Features (une par ligne)</label>
                  <textarea value={s.features.join("\n")} onChange={(e) => updateService(i, "features", e.target.value.split("\n"))} rows={2} className={inputClass} />
                </div>
              </div>
            ))}
            <button onClick={addService} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un service</button>
          </div>
        </>
      )}
    </div>
  );
}
