"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Order, ChecklistItem, BoardStatus, BoardField } from "@/types";
import { PRIORITIES } from "@/lib/kanban-config";
import StatusPicker from "./StatusPicker";
import OrderDrawerChecklist from "./OrderDrawerChecklist";
import OrderDrawerNotes from "./OrderDrawerNotes";

export default function OrderDrawer({
  order,
  boardStatuses,
  boardFields,
  onClose,
  onStatusChange,
  onUpdate,
}: {
  order: Order | null;
  boardStatuses: BoardStatus[];
  boardFields: BoardField[];
  onClose: () => void;
  onStatusChange: (orderId: string, statusId: string) => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => void;
}) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l border-[#E6E6E4] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6E6E4]">
              <div>
                <div className="text-[11px] font-mono text-[#8A8A88] mb-0.5">
                  #{order.id.slice(0, 8)}
                </div>
                <h2 className="text-[16px] font-semibold text-[#191919]">
                  {order.product}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Client section */}
              <div>
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">
                  Client
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[12px] font-bold text-[#4F46E5]">
                    {order.client
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#191919]">
                      {order.client}
                    </div>
                    <div className="text-[12px] text-[#8A8A88]">
                      {order.clientEmail}
                      {order.clientPhone && ` \u00B7 ${order.clientPhone}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E6E6E4]" />

              {/* Details section */}
              <div className="space-y-4">
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                  Details
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Montant</span>
                  <span className="text-[15px] font-bold text-[#191919]">{order.price} &euro;</span>
                </div>

                {/* Status picker — Notion-like with color dots */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Statut</span>
                  <StatusPicker
                    value={order.statusId}
                    statuses={boardStatuses}
                    onChange={(statusId) => onStatusChange(order.id, statusId)}
                  />
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Priorite</span>
                  <select
                    value={order.priority}
                    onChange={(e) => onUpdate(order.id, { priority: e.target.value as Order["priority"] })}
                    className="text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Deadline</span>
                  <input
                    type="date"
                    value={order.deadline ?? ""}
                    onChange={(e) => onUpdate(order.id, { deadline: e.target.value || undefined })}
                    className="text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 cursor-pointer"
                  />
                </div>

                {/* Paid toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Paye</span>
                  <button
                    onClick={() => onUpdate(order.id, { paid: !order.paid })}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
                      order.paid ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        order.paid ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58]">Date</span>
                  <span className="text-[13px] text-[#191919]">{order.date}</span>
                </div>

                {/* Tags */}
                {order.tags.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-[13px] text-[#5A5A58]">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {order.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[#E6E6E4] text-[#5A5A58]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom fields section */}
              {boardFields.length > 0 && (
                <>
                  <div className="h-px bg-[#E6E6E4]" />
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">
                      Proprietes
                    </div>
                    {boardFields.map((field) => (
                      <CustomFieldRow
                        key={field.id}
                        field={field}
                        value={order.customFields?.[field.key]}
                        onChange={(val) => {
                          const updated = { ...(order.customFields ?? {}), [field.key]: val };
                          onUpdate(order.id, { customFields: updated });
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="h-px bg-[#E6E6E4]" />

              {/* Checklist */}
              <OrderDrawerChecklist
                checklist={order.checklist}
                onChange={(items: ChecklistItem[]) => onUpdate(order.id, { checklist: items })}
              />

              <div className="h-px bg-[#E6E6E4]" />

              {/* Notes */}
              <OrderDrawerNotes
                notes={order.notes ?? ""}
                onChange={(value: string) => onUpdate(order.id, { notes: value })}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CustomFieldRow({
  field,
  value,
  onChange,
}: {
  field: BoardField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const cls = "text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30";

  switch (field.fieldType) {
    case "text":
    case "url":
      return (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
          <input
            type={field.fieldType === "url" ? "url" : "text"}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${cls} w-40 text-right`}
            placeholder="..."
          />
        </div>
      );
    case "number":
    case "money":
      return (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
          <input
            type="number"
            value={(value as number) ?? ""}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            className={`${cls} w-24 text-right`}
            placeholder="0"
          />
        </div>
      );
    case "date":
      return (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
          <input
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${cls} cursor-pointer`}
          />
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
          <button
            onClick={() => onChange(!value)}
            className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${
              value ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                value ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      );
    case "select":
      return (
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5A5A58]">{field.label}</span>
          <select
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={`${cls} cursor-pointer`}
          >
            <option value="">—</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    default:
      return null;
  }
}
