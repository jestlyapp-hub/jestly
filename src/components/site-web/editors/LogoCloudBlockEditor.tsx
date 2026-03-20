"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function LogoCloudBlockEditor({ block }: { block: Extract<Block, { type: "logo-cloud" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const logos = block.content.logos;

  const updateLogo = (i: number, field: string, value: string) => {
    const next = logos.map((l, j) => (j === i ? { ...l, [field]: value } : l));
    update({ logos: next });
  };

  const addLogo = () => update({ logos: [...logos, { name: "Logo", imageUrl: "" }] });
  const removeLogo = (i: number) => update({ logos: logos.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="Ils nous font confiance" className={inputClass} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Colonnes</span>
        <div className="flex gap-1.5">
          {([3, 4, 5, 6] as const).map((n) => (
            <button key={n} onClick={() => update({ columns: n })} className={`px-2.5 py-1 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Niveaux de gris</span>
        <button onClick={() => update({ grayscale: !block.content.grayscale })} className={`${toggleClass} ${block.content.grayscale ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.grayscale ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Logos ({logos.length})</label>
        {logos.map((logo, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeLogo(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={logo.name} onChange={(e) => updateLogo(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
            <input type="text" value={logo.imageUrl} onChange={(e) => updateLogo(i, "imageUrl", e.target.value)} placeholder="URL de l'image" className={inputClass} />
          </div>
        ))}
        <button onClick={addLogo} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un logo</button>
      </div>
    </div>
  );
}
