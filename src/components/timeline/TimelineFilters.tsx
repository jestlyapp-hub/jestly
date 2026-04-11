"use client";

import {
  ShoppingBag,
  FileText,
  Palette,
  CheckSquare,
  Users,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import type { TimelineEventType, TimelineFilterChip } from "@/types/timeline";
import { TIMELINE_FILTER_CHIPS } from "@/types/timeline";

// ── Icon mapping pour les chips ──────────────────────────────

const CHIP_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  "shopping-bag": ShoppingBag,
  "file-text": FileText,
  "palette": Palette,
  "check-square": CheckSquare,
  "users": Users,
  "alert-triangle": AlertTriangle,
  "credit-card": CreditCard,
};

interface TimelineFiltersProps {
  activeTypes: TimelineEventType[];
  onToggleTypes: (types: TimelineEventType[]) => void;
  onReset: () => void;
}

export default function TimelineFilters({
  activeTypes,
  onToggleTypes,
  onReset,
}: TimelineFiltersProps) {
  const isActive = (chip: TimelineFilterChip) =>
    chip.types.some((t) => activeTypes.includes(t));

  const handleToggle = (chip: TimelineFilterChip) => {
    if (isActive(chip)) {
      // Retirer les types de ce chip
      const next = activeTypes.filter((t) => !chip.types.includes(t));
      onToggleTypes(next);
    } else {
      // Ajouter les types de ce chip
      onToggleTypes([...activeTypes, ...chip.types]);
    }
  };

  const hasFilters = activeTypes.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Chip "Tous" */}
      <button
        type="button"
        onClick={onReset}
        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border cursor-pointer ${
          !hasFilters
            ? "bg-[#191919] text-white border-[#191919]"
            : "bg-white text-[#5A5A58] border-[#E6E6E4] hover:bg-[#F7F7F5]"
        }`}
      >
        Tous
      </button>

      {TIMELINE_FILTER_CHIPS.map((chip) => {
        const active = isActive(chip);
        const Icon = CHIP_ICONS[chip.icon];

        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => handleToggle(chip)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border cursor-pointer ${
              active
                ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                : "bg-white text-[#5A5A58] border-[#E6E6E4] hover:bg-[#F7F7F5]"
            }`}
          >
            {Icon && <Icon size={13} strokeWidth={1.8} />}
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
