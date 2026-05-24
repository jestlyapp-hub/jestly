"use client";

interface Props {
  value: "7d" | "30d" | "90d" | "custom";
  onChange: (v: "7d" | "30d" | "90d" | "custom") => void;
}

const OPTIONS: { value: Props["value"]; label: string }[] = [
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
  { value: "90d", label: "90 jours" },
];

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-md p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            value === opt.value
              ? "bg-white text-[#191919] shadow-sm"
              : "text-[#5A5A58] hover:text-[#191919]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
