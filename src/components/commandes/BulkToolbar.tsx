"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", damping: 28, stiffness: 350 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-1 bg-[#1A1A1A] text-white rounded-2xl px-2 py-2 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35)]"
    >
      {/* Count badge */}
      <div className="flex items-center gap-2 pl-3 pr-2">
        <div className="w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center text-[11px] font-bold">
          {count}
        </div>
        <span className="text-[13px] font-medium text-white/90 whitespace-nowrap">
          sélectionné{count > 1 ? "s" : ""}
        </span>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Move */}
      <button
        ref={moveRef}
        onClick={(e) => { e.stopPropagation(); openMove(); }}
        className="text-[13px] text-white/70 hover:text-white h-9 px-3 rounded-xl hover:bg-white/8 transition-all cursor-pointer flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        Déplacer
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="text-[13px] text-white/70 hover:text-white h-9 px-3 rounded-xl hover:bg-white/8 transition-all cursor-pointer flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Dupliquer
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Delete */}
      <button
        onClick={onDelete}
        className="text-[13px] text-red-400 hover:text-red-300 h-9 px-3 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer flex items-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Supprimer
      </button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Clear selection */}
      <button
        onClick={onClear}
        className="text-white/40 hover:text-white h-9 w-9 rounded-xl hover:bg-white/8 transition-all cursor-pointer flex items-center justify-center"
        title="Désélectionner"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Move dropdown (portal) */}
      {moveOpen && movePos && createPortal(
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{ position: "fixed", top: movePos.top, left: movePos.left, zIndex: 99999 }}
          className="bg-white border border-[#E6E6E4] rounded-xl shadow-xl min-w-[180px] overflow-hidden py-1"
        >
          <div className="px-3 py-2 text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
            Déplacer vers
          </div>
          {MOVE_STATUSES.map((s) => (
            <button
              key={s.slug}
              onClick={() => { onMove(s.slug); setMoveOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-[13px] text-[#191919] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
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
