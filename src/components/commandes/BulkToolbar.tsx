"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { STATUS_LABELS } from "@/lib/kanban-config";

const MOVE_STATUSES = [
  { slug: "new", label: "À faire" },
  { slug: "in_progress", label: "En cours" },
  { slug: "delivered", label: "Livré" },
  { slug: "paid", label: "Payé" },
];

interface BulkToolbarProps {
  count: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (status: string) => void;
  onClear: () => void;
}

export default function BulkToolbar({ count, onDelete, onDuplicate, onMove, onClear }: BulkToolbarProps) {
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef<HTMLButtonElement>(null);
  const [movePos, setMovePos] = useState<{ top: number; left: number } | null>(null);

  const openMove = () => {
    if (!moveRef.current) return;
    const rect = moveRef.current.getBoundingClientRect();
    setMovePos({ top: rect.top - 180, left: rect.left });
    setMoveOpen(true);
  };

  useEffect(() => {
    if (!moveOpen) return;
    const close = () => setMoveOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moveOpen]);

  if (count === 0) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[#191919] text-white rounded-xl px-5 py-3 shadow-2xl"
    >
      <span className="text-[13px] font-medium">
        {count} sélectionné{count > 1 ? "s" : ""}
      </span>

      <div className="w-px h-5 bg-white/20" />

      {/* Move */}
      <button
        ref={moveRef}
        onClick={(e) => { e.stopPropagation(); openMove(); }}
        className="text-[13px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Déplacer
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="text-[13px] text-white/80 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Dupliquer
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-[13px] text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Supprimer
      </button>

      <div className="w-px h-5 bg-white/20" />

      {/* Clear selection */}
      <button
        onClick={onClear}
        className="text-[13px] text-white/50 hover:text-white px-1.5 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
        title="Désélectionner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Move dropdown (portal) */}
      {moveOpen && movePos && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: movePos.top, left: movePos.left, zIndex: 99999 }}
          className="bg-white border border-[#E6E6E4] rounded-lg shadow-lg min-w-[160px] overflow-hidden"
        >
          <div className="px-3 py-2 text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
            Déplacer vers
          </div>
          {MOVE_STATUSES.map((s) => (
            <button
              key={s.slug}
              onClick={() => { onMove(s.slug); setMoveOpen(false); }}
              className="w-full text-left px-3 py-2 text-[13px] text-[#191919] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </motion.div>,
    document.body
  );
}
