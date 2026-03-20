"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";
import ProductMultiSelect from "./ProductMultiSelect";
import BriefSelect from "./BriefSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function PricingModernBlockEditor({ block }: { block: Extract<Block, { type: "pricing-modern" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const mode = block.content.mode || "manual";
  const plans = block.content.plans ?? [];

  const updatePlan = (index: number, field: string, value: unknown) => {
    const updated = plans.map((plan, i) => (i === index ? { ...plan, [field]: value } : plan));
    update({ plans: updated });
  };

  const addPlan = () => {
    update({
      plans: [
        ...plans,
        { name: "", price: "", period: "", description: "", features: [], isPopular: false, ctaLabel: "Choisir", productId: "", blockLink: undefined },
      ],
    });
  };

  const removePlan = (index: number) => {
    update({ plans: plans.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Mode</label>
        <div className="flex gap-1.5">
          {(["manual", "product"] as const).map((m) => (
            <button key={m} onClick={() => update({ mode: m })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${mode === m ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>
              {m === "manual" ? "Manuel" : "Produits DB"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass}
          rows={2}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre"
        />
      </div>

      {mode === "product" ? (
        <>
          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Produits</label>
            <ProductMultiSelect
              selectedIds={block.content.productIds || []}
              onChange={(ids) => update({ productIds: ids })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Produit mis en avant</label>
            <select
              value={block.content.highlightProductId ?? ""}
              onChange={(e) => update({ highlightProductId: e.target.value || undefined })}
              className={inputClass}
            >
              <option value="">Aucun</option>
              {(block.content.productIds || []).map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
            <p className="text-[10px] text-[#999] mt-0.5">Ce produit aura le badge &quot;Populaire&quot;</p>
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
        <div className="space-y-3">
          <label className="block text-[12px] font-medium text-[#5A5A58]">Plans</label>
          {plans.map((plan, index) => (
            <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium text-[#5A5A58]">Plan {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removePlan(index)}
                  className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
              <input
                className={inputClass}
                value={plan.name}
                onChange={(e) => updatePlan(index, "name", e.target.value)}
                placeholder="Nom du plan"
              />
              <input
                className={inputClass}
                value={plan.price}
                onChange={(e) => updatePlan(index, "price", e.target.value)}
                placeholder="Prix (ex: 29)"
              />
              <input
                className={inputClass}
                value={plan.period ?? ""}
                onChange={(e) => updatePlan(index, "period", e.target.value)}
                placeholder="Periode (ex: /mois)"
              />
              <textarea
                className={inputClass}
                rows={2}
                value={plan.description}
                onChange={(e) => updatePlan(index, "description", e.target.value)}
                placeholder="Description"
              />
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Features (separees par des virgules)</label>
                <input
                  className={inputClass}
                  value={(plan.features ?? []).join(", ")}
                  onChange={(e) =>
                    updatePlan(
                      index,
                      "features",
                      e.target.value.split(",").map((f) => f.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
              </div>
              <label className="flex items-center gap-2 text-[13px] text-[#191919] cursor-pointer">
                <input
                  type="checkbox"
                  checked={plan.isPopular ?? false}
                  onChange={(e) => updatePlan(index, "isPopular", e.target.checked)}
                  className="rounded border-[#E6E6E4]"
                />
                Populaire (mis en avant)
              </label>
              <input
                className={inputClass}
                value={plan.ctaLabel}
                onChange={(e) => updatePlan(index, "ctaLabel", e.target.value)}
                placeholder="Texte du bouton"
              />
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Lien du bouton</label>
                <LinkEditor
                  value={plan.blockLink}
                  onChange={(link: BlockLink | undefined) => updatePlan(index, "blockLink", link)}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addPlan}
            className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
          >
            + Ajouter un plan
          </button>
        </div>
      )}
    </div>
  );
}
