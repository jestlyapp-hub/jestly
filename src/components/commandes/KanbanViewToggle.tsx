"use client";

import type { KanbanView } from "@/lib/kanban-config";

const views: { value: KanbanView; label: string }[] = [
  { value: "production", label: "Production" },
  { value: "cashflow", label: "Cash" },
  { value: "table", label: "Table" },
];

export default function KanbanViewToggle({
  view,
  onChange,
}: {
  view: KanbanView;
  onChange: (v: KanbanView) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-white border border-[#E6E6E4] rounded-lg p-1">
      {views.map((v) => (
        <button
          key={v.value}
          onClick={() => onChange(v.value)}
          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all cursor-pointer ${
            view === v.value
              ? "bg-[#EEF2FF] text-[#4F46E5]"
              : "text-[#8A8A88] hover:text-[#5A5A58]"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
