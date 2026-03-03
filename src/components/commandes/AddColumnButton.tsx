"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const TYPES = [
  { value: "text", label: "Texte", icon: "T" },
  { value: "number", label: "Nombre", icon: "#" },
  { value: "date", label: "Date", icon: "D" },
  { value: "select", label: "Selection", icon: "S" },
  { value: "url", label: "URL", icon: "U" },
  { value: "boolean", label: "Case", icon: "C" },
];

interface AddColumnButtonProps {
  onAdd: (label: string, fieldType: string) => Promise<string | null>;
}

export default function AddColumnButton({ onAdd }: AddColumnButtonProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = async (type: string) => {
    setOpen(false);
    await onAdd("Nouvelle colonne", type);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="p-1 rounded hover:bg-[#F7F7F5] text-[#C0C0BE] hover:text-[#5A5A58] transition-colors cursor-pointer"
        title="Ajouter une colonne"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {open && pos && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg min-w-[180px] overflow-hidden"
        >
          <div className="px-3 py-2 text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider border-b border-[#EFEFEF]">
            Type de colonne
          </div>
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleSelect(t.value)}
              className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <span className="w-5 h-5 rounded bg-[#F7F7F5] border border-[#E6E6E4] flex items-center justify-center text-[10px] font-bold text-[#5A5A58]">
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
