"use client";

import { formatDateFR } from "@/lib/notion-colors";
import { useState, useRef, useEffect } from "react";

interface CustomDateCellProps {
  value: string | null | undefined;
  onCommit: (value: string | null) => void;
}

export default function CustomDateCell({ value, onCommit }: CustomDateCellProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={value ?? ""}
        onChange={(e) => {
          onCommit(e.target.value || null);
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }}
        onClick={(e) => e.stopPropagation()}
        className="text-[12px] bg-white border border-[#4F46E5]/30 rounded px-2 py-1 text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
      />
    );
  }

  const display = formatDateFR(value);

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setEditing(true); }}
      className="cursor-text hover:bg-[#F7F7F5] rounded px-1 -mx-1 py-0.5 transition-colors text-[13px] text-[#5A5A58]"
      title="Cliquer pour modifier"
    >
      {display ?? <span className="text-[#D0D0CE]">—</span>}
    </span>
  );
}
