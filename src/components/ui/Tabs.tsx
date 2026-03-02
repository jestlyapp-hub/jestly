"use client";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-[#E6E6E4]">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 -mb-px cursor-pointer ${
            active === tab
              ? "border-[#4F46E5] text-[#4F46E5]"
              : "border-transparent text-[#999] hover:text-[#666]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
