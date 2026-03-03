"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getStatusColor } from "@/lib/notion-colors";

interface StatusOption {
  slug: string;
  label: string;
}

const STATUSES: StatusOption[] = [
  { slug: "new", label: "À faire" },
  { slug: "in_progress", label: "En cours" },
  { slug: "delivered", label: "Livré" },
  { slug: "paid", label: "Payé" },
];

interface StatusSelectCellProps {
  currentStatus: string;
  onCommit: (status: string) => void;
}

export default function StatusSelectCell({ currentStatus, onCommit }: StatusSelectCellProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = STATUSES.find((s) => s.slug === currentStatus) ?? STATUSES[0];
  const color = getStatusColor(currentStatus);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownH = 180;
    const minW = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const rawTop = spaceBelow < dropdownH ? rect.top - dropdownH : rect.bottom + 4;
    const top = Math.max(8, Math.min(rawTop, window.innerHeight - dropdownH - 8));
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - minW - 8));
    setPos({ top, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    const onScroll = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-dropdown-portal]")) return;
      close();
    };
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const select = (slug: string) => {
    if (slug !== currentStatus) onCommit(slug);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); openDropdown(); }}
        className="cursor-pointer"
        title="Changer le statut"
      >
        <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
          {current.label}
        </span>
      </button>

      {open && pos && createPortal(
        <div
          data-dropdown-portal
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg min-w-[160px] overflow-hidden"
        >
          {STATUSES.map((s) => {
            const sc = getStatusColor(s.slug);
            return (
              <button
                key={s.slug}
                onClick={() => select(s.slug)}
                className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2.5 ${
                  s.slug === currentStatus ? "bg-[#F7F7F5]" : ""
                }`}
              >
                <span className={`inline-flex items-center gap-1.5 px-2 py-[2px] rounded-md text-[11px] font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {s.label}
                </span>
                {s.slug === currentStatus && (
                  <svg className="ml-auto text-[#4F46E5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
