"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ResultsLogosQuotesBlockEditor({ block }: { block: Extract<Block, { type: "results-logos-quotes" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const logos = block.content.logos ?? [];
  const quotes = block.content.quotes ?? [];

  const updateLogo = (index: number, field: string, value: string) => {
    const updated = logos.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    update({ logos: updated });
  };

  const addLogo = () => {
    update({ logos: [...logos, { name: "", imageUrl: "" }] });
  };

  const removeLogo = (index: number) => {
    update({ logos: logos.filter((_, i) => i !== index) });
  };

  const updateQuote = (index: number, field: string, value: string) => {
    const updated = quotes.map((q, i) => (i === index ? { ...q, [field]: value } : q));
    update({ quotes: updated });
  };

  const addQuote = () => {
    update({ quotes: [...quotes, { text: "", name: "", role: "" }] });
  };

  const removeQuote = (index: number) => {
    update({ quotes: quotes.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
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
        <label className="block text-[12px] font-medium text-[#5A5A58]">Logos</label>
        {logos.map((logo, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Logo {index + 1}</span>
              <button
                type="button"
                onClick={() => removeLogo(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={logo.name}
              onChange={(e) => updateLogo(index, "name", e.target.value)}
              placeholder="Nom de l'entreprise"
            />
            <ImageUploader value={logo.imageUrl ?? ""} onChange={(url) => updateLogo(index, "imageUrl", url)} label="Logo" previewAspect="1 / 1" />
          </div>
        ))}
        <button
          type="button"
          onClick={addLogo}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter un logo
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Citations</label>
        {quotes.map((quote, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Citation {index + 1}</span>
              <button
                type="button"
                onClick={() => removeQuote(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <textarea
              className={inputClass}
              rows={3}
              value={quote.text}
              onChange={(e) => updateQuote(index, "text", e.target.value)}
              placeholder="Texte de la citation"
            />
            <input
              className={inputClass}
              value={quote.name}
              onChange={(e) => updateQuote(index, "name", e.target.value)}
              placeholder="Nom"
            />
            <input
              className={inputClass}
              value={quote.role}
              onChange={(e) => updateQuote(index, "role", e.target.value)}
              placeholder="Role"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addQuote}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter une citation
        </button>
      </div>
    </div>
  );
}
