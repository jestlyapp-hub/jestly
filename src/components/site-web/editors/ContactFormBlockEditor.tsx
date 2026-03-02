"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function ContactFormBlockEditor({ block }: { block: Extract<Block, { type: "contact-form" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const fields = block.content.fields;

  const updateField = (i: number, field: string, value: unknown) => {
    const next = fields.map((f, j) => (j === i ? { ...f, [field]: value } : f));
    update({ fields: next });
  };

  const addField = () => update({ fields: [...fields, { label: "Champ", type: "text" as const, required: false, placeholder: "" }] });
  const removeField = (i: number) => update({ fields: fields.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea value={block.content.description ?? ""} onChange={(e) => update({ description: e.target.value })} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.submitLabel} onChange={(e) => update({ submitLabel: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Message de succès</label>
        <input type="text" value={block.content.successMessage} onChange={(e) => update({ successMessage: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Email de notification</label>
        <input type="email" value={block.content.notifyEmail ?? ""} onChange={(e) => update({ notifyEmail: e.target.value })} placeholder="vous@domaine.fr" className={inputClass} />
        <p className="text-[10px] text-[#BBB] mt-0.5">Recevez une notification à chaque soumission</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Sauvegarder comme lead</span>
        <button onClick={() => update({ saveAsLead: !block.content.saveAsLead })} className={`${toggleClass} ${block.content.saveAsLead ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.saveAsLead ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Champs ({fields.length})</label>
        {fields.map((f, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeField(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={f.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="Label" className={inputClass} />
            <div className="flex gap-2">
              <select value={f.type} onChange={(e) => updateField(i, "type", e.target.value)} className={`${inputClass} flex-1`}>
                <option value="text">Texte</option>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="textarea">Zone de texte</option>
                <option value="select">Sélection</option>
              </select>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#999]">Requis</span>
                <button onClick={() => updateField(i, "required", !f.required)} className={`${toggleClass} ${f.required ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                  <div className={`${toggleDotClass} ${f.required ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <input type="text" value={f.placeholder ?? ""} onChange={(e) => updateField(i, "placeholder", e.target.value)} placeholder="Placeholder" className={inputClass} />
            {f.type === "select" && (
              <div>
                <label className="block text-[10px] text-[#999] mb-0.5">Options (une par ligne)</label>
                <textarea value={(f.options ?? []).join("\n")} onChange={(e) => updateField(i, "options", e.target.value.split("\n"))} rows={2} className={inputClass} />
              </div>
            )}
          </div>
        ))}
        <button onClick={addField} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un champ</button>
      </div>
    </div>
  );
}
