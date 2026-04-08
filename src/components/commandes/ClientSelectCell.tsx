"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { getNotionColor } from "@/lib/notion-colors";
import { normalizeForSearch, sortClientsByName } from "./ClientCombobox";

interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface ClientSelectCellProps {
  currentName: string;
  currentId?: string;
  clients: ClientOption[];
  onCommit: (clientId: string) => void;
}

export default function ClientSelectCell({ currentName, currentId, clients, onCommit }: ClientSelectCellProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownH = 240;
    const width = Math.max(rect.width, 240);
    const spaceBelow = window.innerHeight - rect.bottom;
    const rawTop = spaceBelow < dropdownH ? rect.top - dropdownH : rect.bottom + 4;
    const top = Math.max(8, Math.min(rawTop, window.innerHeight - dropdownH - 8));
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    setPos({ top, left, width });
    setOpen(true);
    setSearch("");
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  // Close on outside click / escape / scroll
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

  const filtered = (() => {
    const sorted = sortClientsByName(clients);
    const q = normalizeForSearch(search);
    if (!q) return sorted;
    return sorted.filter((c) => {
      const hay = `${normalizeForSearch(c.name)} ${normalizeForSearch(c.email)}`;
      return hay.includes(q);
    });
  })();

  const select = (id: string) => {
    if (id !== currentId) onCommit(id);
    setOpen(false);
  };

  const color = getNotionColor(currentId || currentName);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); openDropdown(); }}
        className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium border cursor-pointer hover:opacity-80 transition-opacity ${color.bg} ${color.text} ${color.border}`}
        title="Changer le client"
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
        <span className="truncate max-w-[140px]">{currentName}</span>
      </span>

      {open && pos && createPortal(
        <div
          data-dropdown-portal
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-2 border-b border-[#EFEFEF]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2.5 py-1.5 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-[#8A8A88] text-center">Aucun client</div>
            ) : (
              filtered.map((c) => {
                const cc = getNotionColor(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => select(c.id)}
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2 ${
                      c.id === currentId ? "bg-[#F7F7F5]" : ""
                    }`}
                  >
                    <span className={`inline-flex items-center gap-1.5 px-2 py-[2px] rounded-md text-[11px] font-medium border ${cc.bg} ${cc.text} ${cc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cc.dot}`} />
                      {c.name}
                    </span>
                    {c.id === currentId && (
                      <svg className="ml-auto text-[#4F46E5] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
