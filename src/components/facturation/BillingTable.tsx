"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  MoreHorizontal,
  ArrowRight,
  Trash2,
  Calendar,
  User,
} from "lucide-react";
import { isOrderDelivered } from "@/lib/billing-utils";
import type { PipelineItem, BillingStatusKey } from "./facturation-types";
import {
  billingStatusConfig,
  orderStatusLabels,
  billingTransitions,
  formatEur,
} from "./facturation-types";
import { SummaryBar } from "./BillingKpiCards";

/* ══════════════════════════════════════════════════════════════════════
   BILLING BADGE
   ══════════════════════════════════════════════════════════════════════ */

export function BillingBadge({ status, size = "sm" }: { status: BillingStatusKey; size?: "sm" | "md" }) {
  const c = billingStatusConfig[status] || billingStatusConfig.in_progress;
  const sizeClass = size === "md" ? "px-3 py-1 text-[12px]" : "px-2.5 py-0.5 text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ORDER STATUS BADGE
   ══════════════════════════════════════════════════════════════════════ */

export function OrderStatusBadge({ status }: { status: string }) {
  const label = orderStatusLabels[status] || status;
  const delivered = isOrderDelivered(status);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${
      delivered ? "bg-emerald-50 text-emerald-600" : "bg-[#F5F5F4] text-[#78716C]"
    }`}>
      {delivered && <CheckCircle2 size={9} />}
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ACTION MENU
   ══════════════════════════════════════════════════════════════════════ */

export function ActionMenu({ item, onStatusChange, onDelete, mutating }: {
  item: PipelineItem;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
  mutating?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const transitions = billingTransitions[item.billingStatus] || [];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-md text-[#D6D3D1] opacity-0 group-hover:opacity-100 hover:text-[#57534E] hover:bg-[#F5F5F4] transition-all"
      >
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-[#E6E6E4] shadow-lg shadow-black/8 z-30 py-1.5 overflow-hidden"
          >
            {transitions.length > 0 && (
              <>
                <div className="px-3.5 py-1">
                  <span className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider">Facturation</span>
                </div>
                {transitions.map(t => (
                  <button
                    key={t.next}
                    onClick={(e) => { e.stopPropagation(); onStatusChange(item, t.next); setOpen(false); }}
                    disabled={mutating}
                    className="w-full text-left px-3.5 py-2 text-[12px] text-[#57534E] hover:bg-[#FAFAF9] flex items-center gap-2.5 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                  >
                    <ArrowRight size={13} className="text-[#A8A29E]" />
                    {t.label}
                  </button>
                ))}
              </>
            )}
            {item.type !== "order" && (
              <>
                <div className="border-t border-[#F0F0EE] my-1.5 mx-3" />
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item); setOpen(false); }}
                  disabled={mutating}
                  className="w-full text-left px-3.5 py-2 text-[12px] text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                >
                  <Trash2 size={13} />
                  Supprimer
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ITEM ROW
   ══════════════════════════════════════════════════════════════════════ */

export function ItemRow({ item, selected, onToggle, onClick, onStatusChange, onDelete, mutating }: {
  item: PipelineItem;
  selected?: boolean;
  onToggle?: (shiftKey: boolean) => void;
  onClick: () => void;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
  mutating?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#F5F5F4] hover:bg-[#FAFAF9] transition-colors group cursor-pointer ${
        selected ? "bg-[#FAFAFF]" : ""
      }`}
    >
      {onToggle && (
        <td className="w-10 px-4 py-3.5" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => {}}
            onClick={(e) => { e.stopPropagation(); onToggle(e.shiftKey); }}
            className="w-3.5 h-3.5 rounded border-[#D6D3D1] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0 cursor-pointer accent-[#7C3AED]"
          />
        </td>
      )}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-medium text-[#191919]">{item.title}</div>
          {item.type !== "order" && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#F5F5F4] text-[#A8A29E] uppercase">
              {item.type === "recurring" ? "Récurrent" : "Manuel"}
            </span>
          )}
        </div>
        {item.category && (
          <div className="text-[11px] text-[#A8A29E] mt-0.5">{item.category}</div>
        )}
      </td>
      <td className="px-4 py-3.5 text-[13px] text-[#57534E]">
        {item.clientName || <span className="text-[#D6D3D1]">—</span>}
      </td>
      <td className="px-4 py-3.5">
        {item.orderStatus ? (
          <OrderStatusBadge status={item.orderStatus} />
        ) : (
          <span className="text-[11px] text-[#C4C4C2]">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        <BillingBadge status={item.billingStatus} />
      </td>
      <td className="px-4 py-3.5 text-right">
        <span className="text-[13px] font-semibold text-[#191919] tabular-nums">
          {formatEur(item.amount)}
        </span>
      </td>
      <td className="px-2 py-3.5">
        <ActionMenu item={item} onStatusChange={onStatusChange} onDelete={onDelete} mutating={mutating} />
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   GROUPED VIEW
   ══════════════════════════════════════════════════════════════════════ */

export function GroupedView({ groups, icon, items, onRowClick, onStatusChange, onDelete, mutating }: {
  groups: [string, { name?: string; label?: string; items: PipelineItem[]; total: number }][];
  icon: React.ReactNode;
  items: PipelineItem[];
  onRowClick: (item: PipelineItem) => void;
  onStatusChange: (item: PipelineItem, status: BillingStatusKey) => void;
  onDelete: (item: PipelineItem) => void;
  mutating?: boolean;
}) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  return (
    <div>
      {groups.map(([key, group]) => (
        <div key={key}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAF9] border-b border-[#F0F0EE]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#F0EEFF] flex items-center justify-center shrink-0">
                {icon}
              </div>
              <span className="text-[13px] font-semibold text-[#191919] capitalize">{group.name || group.label}</span>
              <span className="text-[11px] text-[#A8A29E] tabular-nums">{group.items.length}</span>
            </div>
            <span className="text-[13px] font-bold text-[#191919] tabular-nums">{formatEur(group.total)}</span>
          </div>
          <table className="w-full">
            <tbody>
              {group.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onClick={() => onRowClick(item)}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  mutating={mutating}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <SummaryBar count={items.length} total={total} />
    </div>
  );
}
