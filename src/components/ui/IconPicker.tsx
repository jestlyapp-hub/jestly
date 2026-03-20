"use client";

import { useState, useRef, useEffect } from "react";
import { ICON_REGISTRY, getIcon } from "@/lib/icons";

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = search.trim()
    ? ICON_REGISTRY.filter((ic) => {
        const q = search.toLowerCase();
        return ic.label.toLowerCase().includes(q) || ic.keywords.some((k) => k.includes(q));
      })
    : ICON_REGISTRY;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg text-[13px] text-[#191919] hover:border-[#4F46E5]/30 transition-all cursor-pointer"
      >
        <span className="text-[#4F46E5]">{getIcon(value)}</span>
        <span className="flex-1 text-left truncate">{value || "Choisir une icone"}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-[#E6E6E4] rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#E6E6E4]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-2.5 py-1.5 text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#4F46E5]/30"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-0.5 p-2 max-h-[240px] overflow-y-auto">
            {filtered.map((ic) => (
              <button
                key={ic.key}
                type="button"
                onClick={() => { onChange(ic.key); setOpen(false); setSearch(""); }}
                title={ic.label}
                className={`flex items-center justify-center w-full aspect-square rounded-md transition-colors cursor-pointer ${
                  value === ic.key
                    ? "bg-[#EEF2FF] text-[#4F46E5]"
                    : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#4F46E5]"
                }`}
              >
                {ic.svg}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-6 py-4 text-center text-[12px] text-[#8A8A88]">
                Aucune icone trouvee
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
