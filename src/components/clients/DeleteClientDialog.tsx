"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface DeleteClientDialogProps {
  client: { id: string; name: string } | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteClientDialog({ client, open, onClose, onDeleted }: DeleteClientDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [dependencies, setDependencies] = useState<number | null>(null);

  const canDelete = confirmation === "SUPPRIMER";

  const handleClose = () => {
    setConfirmation("");
    setDependencies(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!client || !canDelete) return;
    setLoading(true);
    try {
      const result = await apiFetch<{ ok: boolean; dependencies?: number }>(`/api/clients/${client.id}`, {
        method: "DELETE",
      });
      if (result.dependencies) {
        setDependencies(result.dependencies);
      }
      toast.success(`${client.name} a été supprimé`);
      setConfirmation("");
      setDependencies(null);
      onDeleted();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const dialog = (
    <AnimatePresence>
      {open && client && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

          {/* Dialog */}
          <motion.div
            className="relative bg-white rounded-xl border border-[#E6E6E4] shadow-xl max-w-md w-full mx-4 p-6"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-[#191919] mb-2">
              Supprimer {client.name} ?
            </h3>

            {/* Description */}
            <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-4">
              Cette action retirera le client de toutes les listes. Les commandes et factures associées seront conservées pour l&apos;historique.
            </p>

            {/* Dependencies info */}
            {dependencies !== null && dependencies > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                <p className="text-[12px] text-amber-700">
                  {dependencies} commande{dependencies > 1 ? "s" : ""} sera{dependencies > 1 ? "ont" : ""} conservée{dependencies > 1 ? "s" : ""}.
                </p>
              </div>
            )}

            {/* Confirmation input */}
            <div className="mb-6">
              <label className="block text-[12px] text-[#8A8A88] mb-1.5">
                Tapez <span className="font-semibold text-[#191919]">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-red-300 focus:ring-1 focus:ring-red-200 transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#FBFBFA] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!canDelete || loading}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Supprimer définitivement
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== "undefined") {
    return createPortal(dialog, document.body);
  }
  return dialog;
}
