"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const fieldTypes = ["text", "email", "textarea", "phone", "select"] as const;
type FieldType = (typeof fieldTypes)[number];

interface FormField {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export default function ContactPremiumBlockEditor({ block }: { block: Extract<Block, { type: "contact-premium" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    title?: string;
    subtitle?: string;
    fields?: FormField[];
    submitLabel?: string;
    successMessage?: string;
    saveAsLead?: boolean;
    productId?: string;
    briefTemplateId?: string;
  };

  const fields: FormField[] = c.fields ?? [];

  const updateField = (index: number, patch: Partial<FormField>) => {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    update({ fields: next });
  };

  const addField = () => {
    update({
      fields: [...fields, { label: "", type: "text" as FieldType, required: false, placeholder: "" }],
    });
  };

  const removeField = (index: number) => {
    update({ fields: fields.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input
          type="text"
          value={c.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Contactez-nous"
          className={inputClass}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Sous-titre</label>
        <textarea
          value={c.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          rows={2}
          placeholder="Decrivez votre besoin..."
          className={inputClass}
        />
      </div>

      {/* Submit Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={c.submitLabel ?? ""}
          onChange={(e) => update({ submitLabel: e.target.value })}
          placeholder="Envoyer"
          className={inputClass}
        />
      </div>

      {/* Success Message */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Message de confirmation</label>
        <input
          type="text"
          value={c.successMessage ?? ""}
          onChange={(e) => update({ successMessage: e.target.value })}
          placeholder="Merci, nous reviendrons vers vous rapidement !"
          className={inputClass}
        />
      </div>

      {/* Save as Lead */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={c.saveAsLead ?? false}
          onChange={(e) => update({ saveAsLead: e.target.checked })}
          className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
        />
        <span className="text-[11px] text-[#999]">Enregistrer comme lead</span>
      </label>

      {/* Fields array */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-2">Champs du formulaire</label>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="bg-white border border-[#E6E6E4] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-[#BBB]">Champ {index + 1}</span>
                <button
                  onClick={() => removeField(index)}
                  className="text-[10px] font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>

              {/* Label */}
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Label du champ"
                className={inputClass}
              />

              {/* Type */}
              <select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                className={inputClass}
              >
                {fieldTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Placeholder */}
              <input
                type="text"
                value={field.placeholder ?? ""}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                placeholder="Placeholder"
                className={inputClass}
              />

              {/* Required */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
                />
                <span className="text-[11px] text-[#999]">Obligatoire</span>
              </label>

              {/* Options — shown only if type is select */}
              {field.type === "select" && (
                <div>
                  <label className="block text-[10px] text-[#BBB] mb-0.5">Options (separees par des virgules)</label>
                  <input
                    type="text"
                    value={(field.options ?? []).join(", ")}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Option 1, Option 2, Option 3"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addField}
          className="mt-2 w-full py-1.5 rounded-lg border border-dashed border-[#E6E6E4] text-[11px] font-medium text-[#999] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-colors"
        >
          + Ajouter un champ
        </button>
      </div>
    </div>
  );
}
