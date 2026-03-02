"use client";

import { useState } from "react";
import { siteTemplates } from "@/lib/mock-data";

export default function TemplateSelector({ onSelect }: { onSelect?: (templateId: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Choisir un template</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {siteTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => {
              setSelectedId(template.id);
              onSelect?.(template.id);
            }}
            className={`text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md ${
              selectedId === template.id
                ? "border-[#4F46E5] ring-2 ring-[#4F46E5]/20"
                : "border-[#E6E6E4]"
            }`}
          >
            {/* Preview gradient */}
            <div className={`h-32 bg-gradient-to-br ${template.gradient} flex items-center justify-center`}>
              <span className="text-white/80 text-[13px] font-semibold">{template.name}</span>
            </div>
            <div className="p-4">
              <div className="text-[14px] font-semibold text-[#1A1A1A] mb-1">{template.name}</div>
              <p className="text-[12px] text-[#999] leading-relaxed mb-3">{template.description}</p>
              <span
                className={`text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  selectedId === template.id
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#EEF2FF] text-[#4F46E5]"
                }`}
              >
                {selectedId === template.id ? "Sélectionné" : "Utiliser"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
