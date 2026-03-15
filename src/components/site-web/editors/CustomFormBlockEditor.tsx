"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import LeadConfigEditor from "./shared/LeadConfigEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function CustomFormBlockEditor({ block }: { block: Extract<Block, { type: "custom-form" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateField = (index: number, field: string, value: unknown) => {
    const fields = [...block.content.fields];
    fields[index] = { ...fields[index], [field]: value };
    update({ fields });
  };

  const addField = () => {
    update({ fields: [...block.content.fields, { label: "Nouveau champ", type: "text" as const, required: false }] });
  };

  return (
    <div className="space-y-3">
      {block.content.fields.map((field, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Champ {i + 1}</div>
          <input type="text" value={field.label} onChange={(e) => updateField(i, "label", e.target.value)} placeholder="Label" className={inputClass} />
          <select value={field.type} onChange={(e) => updateField(i, "type", e.target.value)} className={inputClass}>
            <option value="text">Texte</option>
            <option value="email">Email</option>
            <option value="textarea">Zone de texte</option>
            <option value="select">Sélection</option>
          </select>
          <label className="flex items-center gap-2 text-[12px] text-[#666]">
            <input type="checkbox" checked={field.required} onChange={(e) => updateField(i, "required", e.target.checked)} className="rounded" />
            Obligatoire
          </label>
        </div>
      ))}
      <button onClick={addField} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un champ</button>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.submitLabel} onChange={(e) => update({ submitLabel: e.target.value })} className={inputClass} />
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
      />
    </div>
  );
}
