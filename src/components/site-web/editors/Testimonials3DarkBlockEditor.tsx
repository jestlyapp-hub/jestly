"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function Testimonials3DarkBlockEditor({ block }: { block: Extract<Block, { type: "testimonials-3dark" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const testimonials = block.content.testimonials ?? [];

  const updateTestimonial = (index: number, field: string, value: unknown) => {
    const updated = testimonials.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    update({ testimonials: updated });
  };

  const addTestimonial = () => {
    update({
      testimonials: [...testimonials, { name: "", role: "", company: "", text: "", rating: 5 }],
    });
  };

  const removeTestimonial = (index: number) => {
    update({ testimonials: testimonials.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Temoignages</label>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Temoignage {index + 1}</span>
              <button
                type="button"
                onClick={() => removeTestimonial(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={testimonial.name}
              onChange={(e) => updateTestimonial(index, "name", e.target.value)}
              placeholder="Nom"
            />
            <input
              className={inputClass}
              value={testimonial.role}
              onChange={(e) => updateTestimonial(index, "role", e.target.value)}
              placeholder="Role"
            />
            <input
              className={inputClass}
              value={testimonial.company}
              onChange={(e) => updateTestimonial(index, "company", e.target.value)}
              placeholder="Entreprise"
            />
            <textarea
              className={inputClass}
              rows={3}
              value={testimonial.text}
              onChange={(e) => updateTestimonial(index, "text", e.target.value)}
              placeholder="Texte du temoignage"
            />
            <div>
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Note (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                className={inputClass}
                value={testimonial.rating ?? 5}
                onChange={(e) => updateTestimonial(index, "rating", Math.min(5, Math.max(1, Number(e.target.value))))}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addTestimonial}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter un temoignage
        </button>
      </div>
    </div>
  );
}
