"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { BoardField } from "@/types";

const TYPE_OPTIONS = [
  { value: "text", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "date", label: "Date" },
  { value: "select", label: "Selection" },
  { value: "url", label: "URL" },
  { value: "boolean", label: "Case" },
];

interface ColumnHeaderMenuProps {
  field: BoardField;
  onRename: (label: string) => void;
  onChangeType: (fieldType: string) => void;
  onHide: () => void;
  onDelete: () => void;
}

export default function ColumnHeaderMenu({ field, onRename, onChangeType, onHide, onDelete }: ColumnHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [typeMenu, setTypeMenu] = useState(false);
  const [draft, setDraft] = useState(field.label);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const handleOpen = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
    setRenaming(false);
    setTypeMenu(false);
    setDraft(field.label);
  }, [field.label]);

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

  useEffect(() => {
    if (renaming) setTimeout(() => { renameRef.current?.focus(); renameRef.current?.select(); }, 10);
  }, [renaming]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== field.label) onRename(trimmed);
    setRenaming(false);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="opacity-0 group-hover/th:opacity-100 p-0.5 rounded hover:bg-[#F0F0EE] text-[#C0C0BE] hover:text-[#5A5A58] transition-all cursor-pointer ml-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && pos && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg min-w-[180px] overflow-hidden"
        >
          {renaming ? (
            <div className="p-2">
              <input
                ref={renameRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") { setRenaming(false); setOpen(false); }
                }}
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2.5 py-1.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30"
              />
            </div>
          ) : typeMenu ? (
            <>
              <button
                onClick={() => setTypeMenu(false)}
                className="w-full text-left px-3 py-2 text-[12px] text-[#8A8A88] hover:bg-[#F7F7F5] cursor-pointer flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour
              </button>
              <div className="border-t border-[#EFEFEF]" />
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { onChangeType(t.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2 ${
                    field.fieldType === t.value ? "bg-[#F7F7F5] font-medium" : ""
                  }`}
                >
                  {t.label}
                  {field.fieldType === t.value && (
                    <svg className="ml-auto text-[#4F46E5]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          ) : (
            <>
              {/* Rename */}
              <button
                onClick={() => setRenaming(true)}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Renommer
              </button>

              {/* Change type (custom only) */}
              {!field.isSystem && (
                <button
                  onClick={() => setTypeMenu(true)}
                  className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Changer le type
                </button>
              )}

              {/* Hide */}
              <button
                onClick={() => { onHide(); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#F7F7F5] transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Masquer
              </button>

              {/* Delete (custom only) */}
              {!field.isSystem && (
                <>
                  <div className="border-t border-[#EFEFEF]" />
                  <button
                    onClick={() => { onDelete(); setOpen(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] hover:bg-red-50 text-red-500 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Supprimer
                  </button>
                </>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
