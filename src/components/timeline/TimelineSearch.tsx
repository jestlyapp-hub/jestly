"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface TimelineSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimelineSearch({ value, onChange }: TimelineSearchProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(local);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [local, onChange]);

  // Sync external changes
  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <div className="relative">
      <Search
        size={15}
        strokeWidth={1.8}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B0AE] pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Rechercher un événement…"
        className="w-full pl-9 pr-8 py-2 text-[13px] text-[#191919] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg placeholder:text-[#B0B0AE] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            onChange("");
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#B0B0AE] hover:text-[#5A5A58] transition-colors cursor-pointer"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}
