"use client";

import { useState, useRef, useEffect } from "react";

interface CustomUrlCellProps {
  value: string | null | undefined;
  onCommit: (value: string | null) => void;
}

export default function CustomUrlCell({ value, onCommit }: CustomUrlCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === (value ?? "")) return;
    onCommit(trimmed || null);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value ?? ""); setEditing(false); }
        }}
        onClick={(e) => e.stopPropagation()}
        placeholder="https://..."
        className="w-full bg-white border border-[#4F46E5]/30 rounded px-2 py-1 text-[12px] text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
      />
    );
  }

  if (!value) {
    return (
      <span
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="cursor-text text-[#D0D0CE] hover:bg-[#F7F7F5] rounded px-1 -mx-1 py-0.5 transition-colors text-[13px]"
      >
        —
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 max-w-[180px]">
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[12px] text-[#4F46E5] hover:underline truncate"
      >
        {value.replace(/^https?:\/\//, "").slice(0, 30)}
      </a>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="flex-shrink-0 text-[#C0C0BE] hover:text-[#5A5A58] transition-colors cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </span>
  );
}
