"use client";

import { motion } from "framer-motion";
import {
  FileText,
  X,
  User,
  Calendar,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Hash,
  StickyNote,
  Info,
  Tag,
  Trash2,
} from "lucide-react";
import type { PipelineItem, BillingStatusKey } from "./facturation-types";
import {
  billingTransitions,
  orderStatusLabels,
  sourceLabels,
  formatEur,
  formatDateLong,
} from "./facturation-types";
import { BillingBadge, OrderStatusBadge } from "./BillingTable";

/* ══════════════════════════════════════════════════════════════════════
   DETAIL ROW
   ══════════════════════════════════════════════════════════════════════ */

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[#A8A29E] mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[13px] text-[#191919]">{value}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DETAIL DRAWER
   ══════════════════════════════════════════════════════════════════════ */

export default function DetailDrawer({ item, onClose, onStatusChange, onDelete, mutating }: {
  item: PipelineItem;
  onClose: () => void;
  onStatusChange: (status: BillingStatusKey) => void;
  onDelete: () => void;
  mutating?: boolean;
}) {
  const transitions = billingTransitions[item.billingStatus] || [];

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/15 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 h-screen w-[520px] max-w-full bg-white border-l border-[#E6E6E4] z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F0EE]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center shrink-0">
              <FileText size={16} className="text-[#7C3AED]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#191919] truncate">{item.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {item.type === "order" && item.orderStatus && (
                  <OrderStatusBadge status={item.orderStatus} />
                )}
                {item.type !== "order" && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F4] text-[#A8A29E]">
                    {item.type === "recurring" ? "Récurrent" : "Manuel"}
                  </span>
                )}
                {item.category && <span className="text-[11px] text-[#A8A29E]">{item.category}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Amount hero */}
          <div className="px-6 py-6 border-b border-[#F0F0EE] bg-[#FAFAF9]">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1">Montant</div>
                <div className="text-[28px] font-bold text-[#191919] tabular-nums tracking-tight">{formatEur(item.amount)}</div>
              </div>
              <BillingBadge status={item.billingStatus} size="md" />
            </div>
            {(item.taxRate || 0) > 0 && (
              <div className="flex items-center gap-4 mt-3 text-[12px] text-[#78716C]">
                <span className="tabular-nums">TVA {item.taxRate}% → TTC {formatEur(item.totalTtc || item.amount)}</span>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 space-y-4">
            <DetailRow icon={<User size={14} />} label="Client" value={item.clientName || "—"} />
            <DetailRow icon={<Calendar size={14} />} label="Date de création" value={formatDateLong(item.createdAt)} />
            {item.deadline && (
              <DetailRow icon={<Calendar size={14} />} label="Deadline" value={formatDateLong(item.deadline)} />
            )}
            {item.deliveredAt && (
              <DetailRow icon={<CheckCircle2 size={14} />} label="Date de livraison" value={formatDateLong(item.deliveredAt)} />
            )}
            {item.invoicedAt && (
              <DetailRow icon={<Receipt size={14} />} label="Date de facturation" value={formatDateLong(item.invoicedAt)} />
            )}
            {item.paidAt && (
              <DetailRow icon={<CheckCircle2 size={14} />} label="Date de paiement" value={formatDateLong(item.paidAt)} />
            )}
            <DetailRow icon={<Hash size={14} />} label="Source" value={sourceLabels[item.source] || item.source} />
            {item.type === "order" && item.orderStatus && (
              <DetailRow icon={<Info size={14} />} label="Statut commande" value={orderStatusLabels[item.orderStatus] || item.orderStatus} />
            )}
            {item.description && (
              <DetailRow icon={<FileText size={14} />} label="Description" value={item.description} />
            )}
            {item.tags.length > 0 && (
              <div className="flex items-start gap-3">
                <Tag size={14} className="text-[#A8A29E] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 text-[11px] font-medium bg-[#F5F5F4] text-[#57534E] rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {item.notes && (
              <div className="flex items-start gap-3">
                <StickyNote size={14} className="text-[#A8A29E] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-1.5">Notes</div>
                  <div className="text-[13px] text-[#57534E] whitespace-pre-wrap leading-relaxed bg-[#FAFAF9] rounded-lg p-3 border border-[#F0F0EE]">
                    {item.notes}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status actions */}
          {transitions.length > 0 && (
            <div className="px-6 pb-5">
              <div className="text-[11px] font-semibold text-[#A8A29E] uppercase tracking-wider mb-2.5">Actions de facturation</div>
              <div className="space-y-1.5">
                {transitions.map(t => (
                  <button
                    key={t.next}
                    onClick={() => onStatusChange(t.next)}
                    disabled={mutating}
                    className={`w-full text-left px-3.5 py-2.5 text-[13px] bg-[#FAFAF9] hover:bg-[#F0EEFF] border border-[#F0F0EE] hover:border-[#DDD6FE] rounded-lg flex items-center gap-2.5 transition-all disabled:opacity-60 disabled:pointer-events-none ${
                      t.next === "paid" ? "text-emerald-700 font-medium" : "text-[#57534E]"
                    }`}
                  >
                    <ArrowRight size={13} className={t.next === "paid" ? "text-emerald-500" : "text-[#A8A29E]"} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-2.5">
          {item.type !== "order" && (
            <button
              onClick={onDelete}
              disabled={mutating}
              className="px-3.5 py-2.5 text-[12px] font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              <Trash2 size={13} className="inline mr-1.5" />
              Supprimer
            </button>
          )}
          <div className="flex-1" />
        </div>
      </motion.div>
    </>
  );
}
