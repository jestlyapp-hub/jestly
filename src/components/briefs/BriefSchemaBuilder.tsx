"use client";

import { useState, useCallback } from "react";
import type { BriefField, BriefFieldType, BoardField } from "@/types";
import BriefFieldEditor from "./BriefFieldEditor";

const ADD_MENU_ITEMS: { type: BriefFieldType; label: string; icon: string; color: string; bg: string }[] = [
  { type: "text",     label: "Texte court",      icon: "T",  color: "text-blue-600",    bg: "bg-blue-50" },
  { type: "textarea", label: "Texte long",       icon: "\u00B6",  color: "text-indigo-600",  bg: "bg-indigo-50" },
  { type: "select",   label: "Liste deroulante", icon: "\u25BE",  color: "text-violet-600",  bg: "bg-violet-50" },
  { type: "radio",    label: "Choix unique",     icon: "\u25C9",  color: "text-purple-600",  bg: "bg-purple-50" },
  { type: "checkbox", label: "Choix multiples",  icon: "\u2611",  color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
  { type: "date",     label: "Date",             icon: "\uD83D\uDCC5", color: "text-amber-600",   bg: "bg-amber-50" },
  { type: "number",   label: "Nombre",           icon: "#",  color: "text-emerald-600", bg: "bg-emerald-50" },
  { type: "url",      label: "URL",              icon: "\uD83D\uDD17", color: "text-cyan-600",    bg: "bg-cyan-50" },
  { type: "email",    label: "Email",            icon: "@",  color: "text-sky-600",     bg: "bg-sky-50" },
  { type: "phone",    label: "Telephone",        icon: "\uD83D\uDCDE", color: "text-teal-600",    bg: "bg-teal-50" },
  { type: "file",     label: "Fichier",          icon: "\uD83D\uDCCE", color: "text-orange-600",  bg: "bg-orange-50" },
];

interface BriefSchemaBuilderProps {
  fields: BriefField[];
  onChange: (fields: BriefField[]) => void;
  orderFields?: BoardField[];
}

export default function BriefSchemaBuilder({ fields, onChange, orderFields }: BriefSchemaBuilderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  // Track which field keys are expanded — empty = all collapsed
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleField = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const addField = (type: BriefFieldType) => {
    const key = `field_${Date.now()}`;
    const newField: BriefField = { key, type, label: "", required: false };
    if (type === "select" || type === "radio" || type === "checkbox") {
      newField.options = ["Option 1"];
    }
    onChange([...fields, newField]);
    // New field stays collapsed (not added to expandedKeys)
    setShowAddMenu(false);
  };

  const updateField = (index: number, field: BriefField) => {
    onChange(fields.map((f, i) => (i === index ? field : f)));
  };

  const deleteField = (index: number) => {
    const key = fields[index]?.key;
    if (key) {
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const next = [...fields];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      {/* Field counter */}
      {fields.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-[#F0F0EE]" />
          <span className="text-[11px] font-medium text-[#B0B0AE] uppercase tracking-wider">
            {fields.length} champ{fields.length > 1 ? "s" : ""}
          </span>
          <div className="h-px flex-1 bg-[#F0F0EE]" />
        </div>
      )}

      {/* Empty state */}
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-[#E6E6E4] rounded-xl bg-[#FAFAF9]">
          <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-[#5A5A58]">Aucun champ</p>
          <p className="text-[12px] text-[#B0B0AE] mt-0.5">Ajoutez des champs pour construire votre questionnaire</p>
        </div>
      )}

      {/* Field list */}
      {fields.map((field, i) => (
        <div key={field.key || `field_${i}`} className="relative group">
          {/* Move handles */}
          <div className="absolute -left-9 top-2.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveField(i, -1)}
              disabled={i === 0}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#B0B0AE] hover:bg-[#F7F7F5] hover:text-[#5A5A58] disabled:opacity-20 cursor-pointer disabled:cursor-default transition-all"
              title="Monter"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
            </button>
            <button
              onClick={() => moveField(i, 1)}
              disabled={i === fields.length - 1}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[#B0B0AE] hover:bg-[#F7F7F5] hover:text-[#5A5A58] disabled:opacity-20 cursor-pointer disabled:cursor-default transition-all"
              title="Descendre"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          <BriefFieldEditor
            field={field}
            onChange={(f) => updateField(i, f)}
            onDelete={() => deleteField(i)}
            orderFields={orderFields}
            expanded={expandedKeys.has(field.key)}
            onToggle={() => toggleField(field.key)}
          />
        </div>
      ))}

      {/* Add field button + dropdown */}
      <div className="relative pt-1">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E6E6E4] rounded-xl text-[13px] font-medium text-[#8A8A88] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] hover:bg-[#EEF2FF]/30 transition-all cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un champ
        </button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[280px] bg-white border border-[#E6E6E4] rounded-xl shadow-lg z-20 p-1.5">
              <p className="px-3 pt-1.5 pb-2 text-[11px] font-medium text-[#B0B0AE] uppercase tracking-wider">Type de champ</p>
              <div className="grid grid-cols-2 gap-1">
                {ADD_MENU_ITEMS.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => addField(item.type)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer text-left group/item"
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-md ${item.bg} ${item.color} text-[11px] font-medium shrink-0 group-hover/item:scale-110 transition-transform`}>
                      {item.icon}
                    </span>
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
