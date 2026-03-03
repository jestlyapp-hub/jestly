"use client";

import { useState, useRef, useEffect } from "react";

interface EditableCellProps {
  value: string | number;
  type?: "text" | "number";
  suffix?: string;
  placeholder?: string;
  className?: string;
  onCommit: (value: string | number) => void;
}

export default function EditableCell({
  value,
  type = "text",
  suffix,
  placeholder,
  className = "",
  onCommit,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  // Sync external value changes when not editing
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === String(value)) return;
    if (type === "number") {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) onCommit(num);
    } else {
      // Allow empty commit when placeholder is set (e.g. clearing a field)
      if (trimmed || placeholder) onCommit(trimmed);
    }
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white border border-[#4F46E5]/30 rounded px-2 py-1 text-[13px] text-[#191919] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]/20"
        step={type === "number" ? "0.01" : undefined}
      />
    );
  }

  const isEmpty = String(value).trim() === "";
  const display =
    type === "number"
      ? `${Number(value).toLocaleString("fr-FR", { minimumFractionDigits: 0 })}${suffix ? ` ${suffix}` : ""}`
      : isEmpty && placeholder
        ? placeholder
        : String(value);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={`cursor-text hover:bg-[#F7F7F5] rounded px-1 -mx-1 py-0.5 transition-colors ${className} ${isEmpty && placeholder ? "text-[#8A8A88]" : ""}`}
      title="Cliquer pour modifier"
    >
      {display}
    </span>
  );
}
