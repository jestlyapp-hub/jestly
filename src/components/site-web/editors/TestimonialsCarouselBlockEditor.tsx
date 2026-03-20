"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function TestimonialsCarouselBlockEditor({ block }: { block: Extract<Block, { type: "testimonials-carousel" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const testimonials = block.content.testimonials;

  const updateTestimonial = (i: number, field: string, value: unknown) => {
    const next = testimonials.map((t, j) => (j === i ? { ...t, [field]: value } : t));
    update({ testimonials: next });
  };

  const addTestimonial = () => update({ testimonials: [...testimonials, { name: "Nom", role: "Rôle", text: "Témoignage...", rating: 5 }] });
  const removeTestimonial = (i: number) => update({ testimonials: testimonials.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Autoplay</span>
          <button onClick={() => update({ autoplay: !block.content.autoplay })} className={`${toggleClass} ${block.content.autoplay ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
            <div className={`${toggleDotClass} ${block.content.autoplay ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        {block.content.autoplay && (
          <div>
            <label className="block text-[11px] font-medium text-[#999] mb-1">Intervalle (ms)</label>
            <input type="number" value={block.content.autoplayInterval} onChange={(e) => update({ autoplayInterval: Number(e.target.value) })} step={500} min={1000} className={inputClass} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Témoignages ({testimonials.length})</label>
        {testimonials.map((t, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeTestimonial(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
            <input type="text" value={t.role} onChange={(e) => updateTestimonial(i, "role", e.target.value)} placeholder="Rôle" className={inputClass} />
            <textarea value={t.text} onChange={(e) => updateTestimonial(i, "text", e.target.value)} rows={2} placeholder="Témoignage" className={inputClass} />
            <div>
              <label className="block text-[10px] text-[#999] mb-1">Note</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => updateTestimonial(i, "rating", s)} className={`text-lg ${s <= t.rating ? "text-[#4F46E5]" : "text-[#E6E6E4]"}`}>★</button>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button onClick={addTestimonial} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un témoignage</button>
      </div>
    </div>
  );
}
