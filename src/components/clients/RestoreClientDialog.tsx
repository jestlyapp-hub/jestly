"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface RestoreClientDialogProps {
  client: { id: string; name: string } | null;
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export default function RestoreClientDialog({ client, open, onClose, onRestored }: RestoreClientDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    if (!client) return;
    setLoading(true);
    try {
      await apiFetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        body: { status: "active" },
      });
      toast.success(`${client.name} a été restauré`);
      onRestored();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la restauration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && client && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" onClick={onClose} />

          {/* Dialog */}
          <motion.div
            className="relative bg-white rounded-xl border border-[#E6E6E4] shadow-xl max-w-md w-full mx-4 p-6"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-semibold text-[#191919] mb-2">
              Restaurer {client.name} ?
            </h3>

            {/* Description */}
            <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-6">
              Le client sera remis dans la liste active.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-[#5A5A58] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#FBFBFA] transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleRestore}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Restaurer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
