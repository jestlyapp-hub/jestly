"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function TestimonialsBlockEditor({ block }: { block: Extract<Block, { type: "testimonials" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateTestimonial = (index: number, field: string, value: string) => {
    const testimonials = [...block.content.testimonials];
    testimonials[index] = { ...testimonials[index], [field]: value };
    update({ testimonials });
  };

  const addTestimonial = () => {
    update({ testimonials: [...block.content.testimonials, { name: "Nouveau client", role: "Poste", text: "Témoignage..." }] });
  };

  return (
    <div className="space-y-3">
      {block.content.testimonials.map((t, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E8F0] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Témoignage {i + 1}</div>
          <input type="text" value={t.name} onChange={(e) => updateTestimonial(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
          <input type="text" value={t.role} onChange={(e) => updateTestimonial(i, "role", e.target.value)} placeholder="Poste" className={inputClass} />
          <textarea value={t.text} onChange={(e) => updateTestimonial(i, "text", e.target.value)} rows={2} placeholder="Texte" className={inputClass} />
        </div>
      ))}
      <button onClick={addTestimonial} className="text-[12px] font-medium text-[#6a18f1] hover:underline">+ Ajouter un témoignage</button>
    </div>
  );
}
