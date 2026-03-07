"use client";

interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
}

export default function FilterBar({ filters, activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
            activeFilter === filter.key
              ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20"
              : "text-[#666] hover:bg-[#F7F7F5] border border-transparent"
          }`}
        >
          {filter.label}
          {filter.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeFilter === filter.key ? "bg-[#4F46E5]/10 text-[#4F46E5]" : "bg-[#F7F7F5] text-[#999]"
            }`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
