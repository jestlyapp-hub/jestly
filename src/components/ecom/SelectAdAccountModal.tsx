"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, AlertCircle, X } from "lucide-react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface AdAccount {
  pinterest_ad_account_id: string;
  name: string;
  country: string | null;
  currency: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelected: (adAccountId: string, adAccountName: string) => void;
}

export default function SelectAdAccountModal({ open, onClose, onSelected }: Props) {
  const { data, loading, error, mutate } = useApi<{ accounts: AdAccount[]; selected_ad_account_id: string | null }>(
    open ? "/api/integrations/pinterest/ad-accounts" : null,
  );
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (open) mutate();
  }, [open, mutate]);

  const handleSelect = async (account: AdAccount) => {
    setSelecting(account.pinterest_ad_account_id);
    try {
      await apiFetch("/api/integrations/pinterest/select-account", {
        method: "POST",
        body: {
          ad_account_id: account.pinterest_ad_account_id,
          ad_account_name: account.name,
        },
      });
      toast.success(`${account.name} sélectionné — sync 90j en cours`);
      onSelected(account.pinterest_ad_account_id, account.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
      setSelecting(null);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E6E6E4] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E6E6E4]">
            <div>
              <h2 className="text-[15px] font-bold text-[#191919]">Choisir un ad account</h2>
              <p className="text-[11px] text-[#8A8A88]">Pinterest peut héberger plusieurs comptes publicitaires</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#F7F7F5] rounded">
              <X size={14} className="text-[#8A8A88]" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3">
            {loading && (
              <div className="py-8 text-center">
                <Loader2 size={20} className="mx-auto animate-spin text-[#7C3AED] mb-2" />
                <p className="text-[12px] text-[#8A8A88]">Récupération des ad accounts…</p>
              </div>
            )}

            {error && (
              <div className="m-2 p-3 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2">
                <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-medium text-rose-700">Erreur Pinterest</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    {error.includes("403") || error.includes("Trial")
                      ? "Votre app Pinterest est en attente de validation Trial Access. Réessayez dans quelques heures."
                      : error}
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && data && data.accounts.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[12px] text-[#8A8A88]">Aucun ad account trouvé sur ce compte Pinterest.</p>
              </div>
            )}

            {!loading && data && data.accounts.length > 0 && (
              <ul className="space-y-1">
                {data.accounts.map((account) => {
                  const isCurrent = data.selected_ad_account_id === account.pinterest_ad_account_id;
                  const isSelecting = selecting === account.pinterest_ad_account_id;
                  return (
                    <li key={account.pinterest_ad_account_id}>
                      <button
                        onClick={() => handleSelect(account)}
                        disabled={Boolean(selecting)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                          isCurrent
                            ? "border-[#7C3AED] bg-[#F0EEFF]"
                            : "border-[#E6E6E4] hover:bg-[#FBFBFA] hover:border-[#DDD6FE]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[#191919] truncate">{account.name}</div>
                          <div className="text-[11px] text-[#8A8A88] mt-0.5">
                            {[account.country, account.currency].filter(Boolean).join(" · ")} · ID {account.pinterest_ad_account_id}
                          </div>
                        </div>
                        {isSelecting ? (
                          <Loader2 size={14} className="text-[#7C3AED] animate-spin flex-shrink-0" />
                        ) : isCurrent ? (
                          <Check size={14} className="text-[#7C3AED] flex-shrink-0" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
