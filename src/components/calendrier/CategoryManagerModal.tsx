"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_PALETTE } from "@/lib/calendar-utils";
import type { CustomCategory } from "@/lib/calendar-utils";

interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onSave: (cat: { id?: string; name: string; color: string; icon?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ICON_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "phone", label: "Téléphone" },
  { value: "camera", label: "Caméra" },
  { value: "edit", label: "Montage" },
  { value: "send", label: "Livraison" },
  { value: "file-text", label: "Facture" },
  { value: "users", label: "Réunion" },
  { value: "star", label: "Priorité" },
  { value: "calendar", label: "Rendez-vous" },
  { value: "briefcase", label: "Business" },
  { value: "heart", label: "Personnel" },
  { value: "zap", label: "Urgent" },
];

function IconPreview({ icon, size = 14 }: { icon?: string; size?: number }) {
  const s = size;
  const props = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (icon) {
    case "phone": return <svg {...props}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
    case "camera": return <svg {...props}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "edit": return <svg {...props}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
    case "send": return <svg {...props}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
    case "file-text": return <svg {...props}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "users": return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "star": return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "briefcase": return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>;
    case "heart": return <svg {...props}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
    case "zap": return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    default: return null;
  }
}

export default function CategoryManagerModal({ open, onClose, categories, onSave, onDelete }: CategoryManagerModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366F1");
  const [icon, setIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (open) {
      setEditingId(null);
      setShowForm(false);
      resetForm();
    }
  }, [open]);

  function resetForm() {
    setName("");
    setColor("#6366F1");
    setIcon("");
    setEditingId(null);
  }

  function startEdit(cat: CustomCategory) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon || "");
    setShowForm(true);
  }

  function startCreate() {
    resetForm();
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave({
        id: editingId || undefined,
        name: name.trim(),
        color,
        icon: icon || undefined,
      });
      resetForm();
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
          >
            <div
              className="bg-white rounded-2xl border border-[#E2E2E0] shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE] flex-shrink-0">
                <h2 className="text-[15px] font-bold text-[#191919]">Gérer les catégories</h2>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4F4F2] transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Category list */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                {categories.length === 0 && !showForm && (
                  <p className="text-[13px] text-[#999] text-center py-6">
                    Aucune catégorie personnalisée.<br />
                    Créez-en une pour organiser votre calendrier.
                  </p>
                )}

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FAFAF9] group transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.icon && (
                      <span className="text-[#666] flex-shrink-0">
                        <IconPreview icon={cat.icon} size={14} />
                      </span>
                    )}
                    <span className="flex-1 text-[13px] font-semibold text-[#191919]">{cat.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#F0F0EE] transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        {deletingId === cat.id ? (
                          <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Create/Edit form */}
                <AnimatePresence>
                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#FAFAF9] rounded-xl border border-[#E6E6E4] p-4 space-y-4 mt-2">
                        <h3 className="text-[12px] font-bold text-[#666] uppercase tracking-wider">
                          {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
                        </h3>

                        {/* Name */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Tournage, Montage, Call client..."
                            autoFocus
                            className="w-full bg-white border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] font-medium text-[#191919] placeholder-[#C0C0BE] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all"
                          />
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1">
                            Couleur
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {EVENT_PALETTE.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                                  color === c ? "ring-2 ring-offset-2 ring-[#191919]/30 scale-110" : "hover:scale-110"
                                }`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Icon */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#A0A09E] uppercase tracking-widest mb-1">
                            Icône (optionnel)
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {ICON_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setIcon(opt.value)}
                                className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                  icon === opt.value
                                    ? "border-[#4F46E5] bg-[#4F46E5]/[0.06] text-[#4F46E5]"
                                    : "border-[#E6E6E4] bg-white text-[#888] hover:bg-[#F4F4F2]"
                                }`}
                              >
                                {opt.value && <IconPreview icon={opt.value} size={11} />}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => { setShowForm(false); resetForm(); }}
                            className="flex-1 px-3 py-2 rounded-lg border border-[#E2E2E0] text-[12px] font-bold text-[#666] hover:bg-white transition-all cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={!name.trim() || saving}
                            className={`flex-1 text-white rounded-lg px-3 py-2 text-[12px] font-bold transition-all cursor-pointer ${
                              name.trim() && !saving ? "hover:brightness-110 shadow-sm" : "opacity-35 cursor-not-allowed"
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {saving ? "..." : editingId ? "Enregistrer" : "Créer"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer — Add button */}
              {!showForm && (
                <div className="px-6 py-4 border-t border-[#F0F0EE] flex-shrink-0">
                  <button
                    onClick={startCreate}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#4F46E5] text-white text-[12px] font-bold hover:bg-[#4338CA] transition-all cursor-pointer shadow-sm shadow-[#4F46E5]/20"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Nouvelle catégorie
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { IconPreview };
