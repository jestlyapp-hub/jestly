"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import IconPicker from "@/components/ui/IconPicker";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function FeatureGridBlockEditor({ block }: { block: Extract<Block, { type: "feature-grid" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const features = block.content.features;

  const updateFeature = (i: number, field: string, value: string) => {
    const next = features.map((f, j) => (j === i ? { ...f, [field]: value } : f));
    update({ features: next });
  };

  const addFeature = () => update({ features: [...features, { icon: "star", title: "Nouvelle feature", description: "Description" }] });
  const removeFeature = (i: number) => update({ features: features.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Sous-titre</label>
        <input type="text" value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <div className="flex gap-1.5">
          {([2, 3, 4] as const).map((n) => (
            <button key={n} onClick={() => update({ columns: n })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Features ({features.length})</label>
        {features.map((f, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeFeature(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <IconPicker value={f.icon} onChange={(key) => updateFeature(i, "icon", key)} />
            <input type="text" value={f.title} onChange={(e) => updateFeature(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            <textarea value={f.description} onChange={(e) => updateFeature(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
          </div>
        ))}
        <button onClick={addFeature} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une feature</button>
      </div>
    </div>
  );
}
