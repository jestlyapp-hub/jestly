"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { FieldOption } from "@/types";

const NOTION_PALETTE = [
  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-400",  hex: "violet" },
  { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400",    hex: "blue" },
  { bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-400",    hex: "cyan" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", hex: "emerald" },
  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   hex: "amber" },
  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200",  dot: "bg-orange-400",  hex: "orange" },
  { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    dot: "bg-rose-400",    hex: "rose" },
  { bg: "bg-pink-50",    text: "text-pink-700",    border: "border-pink-200",    dot: "bg-pink-400",    hex: "pink" },
  { bg: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-400",  hex: "indigo" },
  { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-400",    hex: "teal" },
];

function getColorClasses(color: string) {
  return NOTION_PALETTE.find((p) => p.hex === color) ?? NOTION_PALETTE[0];
}

interface CustomSelectCellProps {
  value: string | null | undefined;
  options: FieldOption[];
  onCommit: (value: string | null) => void;
  onAddOption: (label: string) => Promise<FieldOption>;
}

export default function CustomSelectCell({ value, options, onCommit, onAddOption }: CustomSelectCellProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openDropdown = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownH = 260;
    const width = Math.max(rect.width, 200);
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

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const select = (label: string) => {
    onCommit(label === value ? null : label);
    setOpen(false);
  };

  const handleCreate = async () => {
    const label = search.trim();
    if (!label) return;
    await onAddOption(label);
    onCommit(label);
    setOpen(false);
  };

  const showCreate = search.trim() && !filtered.some((o) => o.label.toLowerCase() === search.trim().toLowerCase());

  // Current option
  const currentOpt = options.find((o) => o.label === value);

  if (!value || !currentOpt) {
    return (
      <>
        <button
          ref={triggerRef}
          onClick={(e) => { e.stopPropagation(); openDropdown(); }}
          className="text-[#D0D0CE] hover:bg-[#F7F7F5] rounded px-1 py-0.5 transition-colors text-[13px] cursor-pointer"
        >
          —
        </button>
        {open && pos && createPortal(
          <DropdownContent
            pos={pos}
            search={search}
            setSearch={setSearch}
            inputRef={inputRef}
            filtered={filtered}
            value={value}
            select={select}
            showCreate={!!showCreate}
            onCreateLabel={search.trim()}
            handleCreate={handleCreate}
          />,
          document.body
        )}
      </>
    );
  }

  const color = getColorClasses(currentOpt.color);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); openDropdown(); }}
        className="cursor-pointer"
        title="Changer la valeur"
      >
        <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] rounded-md text-[11px] font-medium border ${color.bg} ${color.text} ${color.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
          <span className="truncate max-w-[120px]">{currentOpt.label}</span>
        </span>
      </button>
      {open && pos && createPortal(
        <DropdownContent
          pos={pos}
          search={search}
          setSearch={setSearch}
          inputRef={inputRef}
          filtered={filtered}
          value={value}
          select={select}
          showCreate={!!showCreate}
          onCreateLabel={search.trim()}
          handleCreate={handleCreate}
        />,
        document.body
      )}
    </>
  );
}

function DropdownContent({
  pos,
  search,
  setSearch,
  inputRef,
  filtered,
  value,
  select,
  showCreate,
  onCreateLabel,
  handleCreate,
}: {
  pos: { top: number; left: number; width: number };
  search: string;
  setSearch: (s: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  filtered: FieldOption[];
  value: string | null | undefined;
  select: (label: string) => void;
  showCreate: boolean;
  onCreateLabel: string;
  handleCreate: () => void;
}) {
  return (
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
          placeholder="Rechercher ou creer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && showCreate) handleCreate(); }}
          className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2.5 py-1.5 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.map((o) => {
          const c = getColorClasses(o.color);
          return (
            <button
              key={o.label}
              onClick={() => select(o.label)}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2 ${
                o.label === value ? "bg-[#F7F7F5]" : ""
              }`}
            >
              <span className={`inline-flex items-center gap-1.5 px-2 py-[2px] rounded-md text-[11px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {o.label}
              </span>
              {o.label === value && (
                <svg className="ml-auto text-[#4F46E5] flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && !showCreate && (
          <div className="px-3 py-3 text-[12px] text-[#8A8A88] text-center">Aucune option</div>
        )}
        {showCreate && (
          <button
            onClick={handleCreate}
            className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2 text-[#4F46E5]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Creer &quot;{onCreateLabel}&quot;
          </button>
        )}
      </div>
    </div>
  );
}
