"use client";

import { useApi } from "@/lib/hooks/use-api";
import type { BriefField } from "@/types";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-md px-3 py-1.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface TemplateRow {
  id: string;
  name: string;
  version: number;
  schema: BriefField[];
}

interface BriefSelectProps {
  briefTemplateId?: string | null;
  useProductDefaultBrief?: boolean;
  briefRequired?: boolean;
  onChange: (settings: {
    briefTemplateId?: string | null;
    useProductDefaultBrief?: boolean;
    briefRequired?: boolean;
  }) => void;
}

const EMPTY_TEMPLATES: TemplateRow[] = [];

export default function BriefSelect({
  briefTemplateId,
  useProductDefaultBrief = true,
  briefRequired = true,
  onChange,
}: BriefSelectProps) {
  const { data: templates, loading, error } = useApi<TemplateRow[]>("/api/brief-templates", EMPTY_TEMPLATES);

  const list = templates ?? EMPTY_TEMPLATES;

  // Single dropdown value:
  // "product_default" | "none" | "<template-uuid>"
  const selectValue = briefTemplateId
    ? briefTemplateId
    : useProductDefaultBrief
      ? "product_default"
      : "none";

  const handleChange = (v: string) => {
    if (v === "none") {
      onChange({ briefTemplateId: null, useProductDefaultBrief: false, briefRequired: false });
    } else if (v === "product_default") {
      onChange({ briefTemplateId: null, useProductDefaultBrief: true, briefRequired });
    } else {
      // v is a template UUID
      onChange({ briefTemplateId: v, useProductDefaultBrief: false, briefRequired });
    }
  };

  const showRequired = selectValue !== "none";

  return (
    <div className="space-y-3 pt-3 border-t border-[#E6E6E4]">
      <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
        Brief / Questionnaire
      </div>

      <div>
        <label className="block text-[11px] text-[#8A8A88] mb-1">Brief à envoyer au client</label>
        {loading ? (
          <div className="h-8 bg-[#F7F7F5] rounded-md animate-pulse" />
        ) : (
          <select
            value={selectValue}
            onChange={(e) => handleChange(e.target.value)}
            className={inputClass}
          >
            <option value="product_default">Brief par défaut du produit</option>
            {list.length > 0 && (
              <optgroup label="Mes briefs">
                {list.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (v{t.version} — {Array.isArray(t.schema) ? t.schema.length : 0} champs)
                  </option>
                ))}
              </optgroup>
            )}
            <option value="none">Aucun brief</option>
          </select>
        )}
        {error && (
          <p className="text-[10px] text-red-500 mt-1">Erreur : {error}</p>
        )}
        {!loading && !error && list.length === 0 && (
          <p className="text-[10px] text-[#8A8A88] mt-1">
            <a href="/briefs" className="text-[#4F46E5] hover:underline">Créer un brief</a> pour le proposer ici.
          </p>
        )}
      </div>

      {/* Required toggle */}
      {showRequired && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#5A5A58]">Brief obligatoire</span>
          <button
            onClick={() => onChange({ briefTemplateId, useProductDefaultBrief, briefRequired: !briefRequired })}
            className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${briefRequired ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${briefRequired ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
