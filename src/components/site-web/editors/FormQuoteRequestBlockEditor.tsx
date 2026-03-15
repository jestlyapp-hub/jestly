"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import LeadConfigEditor from "./shared/LeadConfigEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function FormQuoteRequestBlockEditor({ block }: { block: Extract<Block, { type: "form-quote-request" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const fields = block.content.fields;

  const updateField = (i: number, key: string, value: unknown) => {
    const next = fields.map((f, j) => (j === i ? { ...f, [key]: value } : f));
    update({ fields: next });
  };

  const addField = () => update({ fields: [...fields, { label: "Nouveau champ", type: "text", placeholder: "", required: false }] });
  const removeField = (i: number) => update({ fields: fields.filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <input type="text" value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.submitLabel} onChange={(e) => update({ submitLabel: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Texte latéral</label>
        <textarea value={block.content.sideText ?? ""} onChange={(e) => update({ sideText: e.target.value })} rows={3} className={inputClass} />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Champs ({fields.length})</label>
        {fields.map((f, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeField(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={f.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="Label" className={inputClass} />
            <select value={f.type} onChange={(e) => updateField(i, "type", e.target.value)} className={inputClass}>
              <option value="text">Texte</option>
              <option value="email">Email</option>
              <option value="tel">Téléphone</option>
              <option value="textarea">Zone de texte</option>
              <option value="select">Liste déroulante</option>
            </select>
            <input type="text" value={f.placeholder ?? ""} onChange={(e) => updateField(i, "placeholder", e.target.value)} placeholder="Placeholder" className={inputClass} />
            <label className="flex items-center gap-2 text-[12px] text-[#5A5A58]">
              <input type="checkbox" checked={f.required ?? false} onChange={(e) => updateField(i, "required", e.target.checked)} />
              Obligatoire
            </label>
            {f.type === "select" && (
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Options (une par ligne)</label>
                <textarea
                  value={(f.options ?? []).join("\n")}
                  onChange={(e) => updateField(i, "options", e.target.value.split("\n").filter((s) => s.trim()))}
                  rows={3}
                  placeholder="Option 1&#10;Option 2"
                  className={inputClass}
                />
              </div>
            )}
          </div>
        ))}
        <button onClick={addField} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un champ</button>
      </div>
      <LeadConfigEditor
        config={{
          saveAsLead: block.content.saveAsLead,
          successMessage: block.content.successMessage,
          notifyEmail: block.content.notifyEmail,
          leadSource: block.content.leadSource,
          leadTags: block.content.leadTags,
        }}
        onChange={(cfg) => update({ ...cfg })}
        showSource={true}
        showTags={true}
        defaultSource="quote-request"
      />
    </div>
  );
}
