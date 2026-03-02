"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function CalendarBookingBlockEditor({ block }: { block: Extract<Block, { type: "calendar-booking" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateSlot = (index: number, value: string) => {
    const slots = [...block.content.slots];
    slots[index] = value;
    update({ slots });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Fournisseur</label>
        <select value={block.content.provider} onChange={(e) => update({ provider: e.target.value })} className={inputClass}>
          <option value="calendly">Calendly</option>
          <option value="cal">Cal.com</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL d&apos;intégration</label>
        <input type="text" value={block.content.embedUrl} onChange={(e) => update({ embedUrl: e.target.value })} placeholder="https://calendly.com/..." className={inputClass} />
        <p className="text-[10px] text-[#BBB] mt-0.5">Laissez vide pour utiliser les créneaux manuels</p>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={inputClass} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Ouvrir en modal</span>
        <button onClick={() => update({ openModal: !block.content.openModal })} className={`${toggleClass} ${block.content.openModal ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.openModal ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="border-t border-[#E6E6E4] pt-3 mt-3">
        <div>
          <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
          <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
        </div>
        <div className="mt-2">
          <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
          <textarea value={block.content.description} onChange={(e) => update({ description: e.target.value })} rows={2} className={inputClass} />
        </div>
      </div>

      <div className="border-t border-[#E6E6E4] pt-3 mt-3">
        <label className="block text-[11px] font-medium text-[#999] mb-1">Créneaux (fallback)</label>
        {block.content.slots.map((slot, i) => (
          <div key={i} className="flex gap-1.5 mb-1.5">
            <input type="text" value={slot} onChange={(e) => updateSlot(i, e.target.value)} className={`${inputClass} flex-1`} />
            {block.content.slots.length > 1 && (
              <button onClick={() => update({ slots: block.content.slots.filter((_: string, j: number) => j !== i) })} className="text-[#999] hover:text-red-500 text-sm px-1">&times;</button>
            )}
          </div>
        ))}
        <button onClick={() => update({ slots: [...block.content.slots, "Nouveau créneau"] })} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un créneau</button>
      </div>
    </div>
  );
}
