"use client";

const PRIORITIES = [
  { value: "low", label: "Basse", bg: "bg-gray-100", text: "text-gray-600", ring: "ring-gray-300" },
  { value: "normal", label: "Normale", bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-300" },
  { value: "high", label: "Haute", bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-300" },
  { value: "urgent", label: "Urgente", bg: "bg-red-50", text: "text-red-600", ring: "ring-red-300" },
] as const;

interface PriorityPickerProps {
  value: string;
  onChange: (priority: string) => void;
}

export default function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PRIORITIES.map((p) => {
        const active = value === p.value;
        return (
          <button
            key={p.value}
            onClick={() => { if (!active) onChange(p.value); }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              active
                ? `${p.bg} ${p.text} ring-1 ${p.ring}`
                : "bg-transparent text-[#8A8A88] hover:bg-[#F7F7F5]"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
