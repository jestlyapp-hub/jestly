"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function PricingMiniFaqBlockEditor({ block }: { block: Extract<Block, { type: "pricing-mini-faq" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const plans = block.content.plans ?? [];
  const faq = block.content.faq ?? [];

  const updatePlan = (index: number, field: string, value: unknown) => {
    const updated = plans.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    update({ plans: updated });
  };

  const addPlan = () => {
    update({ plans: [...plans, { name: "", price: "", features: [], ctaLabel: "Choisir" }] });
  };

  const removePlan = (index: number) => {
    update({ plans: plans.filter((_, i) => i !== index) });
  };

  const updateFaq = (index: number, field: string, value: string) => {
    const updated = faq.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    update({ faq: updated });
  };

  const addFaq = () => {
    update({ faq: [...faq, { question: "", answer: "" }] });
  };

  const removeFaq = (index: number) => {
    update({ faq: faq.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <ProductModeEditor
        mode={block.content.mode || "manual"}
        onModeChange={(mode) => update({ mode })}
        productIds={block.content.productIds || []}
        onProductIdsChange={(productIds) => update({ productIds })}
      />
      <div className="border-t border-[#E6E6E4] my-3" />
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section (optionnel)"
        />
      </div>

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
            <div>
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Features (une par ligne)</label>
              <textarea
                className={inputClass}
                rows={3}
                value={(plan.features ?? []).join("\n")}
                onChange={(e) =>
                  updatePlan(index, "features", e.target.value.split("\n").filter(Boolean))
                }
                placeholder={"Feature 1\nFeature 2\nFeature 3"}
              />
            </div>
            <input
              className={inputClass}
              value={plan.ctaLabel}
              onChange={(e) => updatePlan(index, "ctaLabel", e.target.value)}
              placeholder="Texte du bouton"
            />
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

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">FAQ</label>
        {faq.map((item, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removeFaq(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={item.question}
              onChange={(e) => updateFaq(index, "question", e.target.value)}
              placeholder="Question"
            />
            <textarea
              className={inputClass}
              rows={2}
              value={item.answer}
              onChange={(e) => updateFaq(index, "answer", e.target.value)}
              placeholder="Reponse"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addFaq}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  );
}
