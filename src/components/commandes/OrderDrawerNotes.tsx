"use client";

import { useState, useRef, useEffect } from "react";

export default function OrderDrawerNotes({
  notes,
  onChange,
}: {
  notes: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(notes);
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sync with prop changes
  useEffect(() => {
    setValue(notes);
  }, [notes]);

  const save = () => {
    if (value !== notes) {
      setSaving(true);
      onChange(value);
      setTimeout(() => setSaving(false), 800);
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    // Debounce auto-save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (newValue !== notes) {
        setSaving(true);
        onChange(newValue);
        setTimeout(() => setSaving(false), 800);
      }
    }, 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
          Notes
        </span>
        {saving && (
          <span className="text-[10px] text-[#4F46E5]">Sauvegarde...</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={save}
        placeholder="Ajouter des notes..."
        rows={4}
        className="w-full text-[13px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 resize-none transition-all"
      />
    </div>
  );
}
