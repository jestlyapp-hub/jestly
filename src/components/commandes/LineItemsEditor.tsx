"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LineItemDraft {
  id: string;
  label: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  items: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  discount: number;
  onDiscountChange: (v: number) => void;
  deposit: number;
  onDepositChange: (v: number) => void;
}

let _nextId = 0;
const genId = () => `li_${++_nextId}_${Date.now()}`;

const fmtEur = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export default function LineItemsEditor({ items, onChange, discount, onDiscountChange, deposit, onDepositChange }: Props) {
  const addItem = useCallback(() => {
    onChange([...items, { id: genId(), label: "", description: "", quantity: 1, unitPrice: 0 }]);
  }, [items, onChange]);

  const updateItem = useCallback((id: string, field: keyof LineItemDraft, value: string | number) => {
    onChange(items.map((it) => it.id === id ? { ...it, [field]: value } : it));
  }, [items, onChange]);

  const removeItem = useCallback((id: string) => {
    onChange(items.filter((it) => it.id !== id));
  }, [items, onChange]);

  const duplicateItem = useCallback((id: string) => {
    const src = items.find((it) => it.id === id);
    if (!src) return;
    const idx = items.indexOf(src);
    const copy = { ...src, id: genId() };
    const next = [...items];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  }, [items, onChange]);

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider">Prestations</span>
        <span className="text-[11px] text-[#BBB]">{items.length} ligne{items.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="bg-[#FBFBFA] border border-[#EFEFEF] rounded-lg p-3 space-y-2">
                {/* Row 1: Label + actions */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateItem(item.id, "label", e.target.value)}
                    placeholder="Nom de la prestation..."
                    className="flex-1 text-[13px] bg-white border border-[#E6E6E4] rounded-md px-2.5 py-1.5 text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30"
                  />
                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateItem(item.id)}
                    title="Dupliquer"
                    className="p-1 text-[#CCC] hover:text-[#4F46E5] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    title="Supprimer"
                    className="p-1 text-[#CCC] hover:text-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Row 2: Price × Qty = Total */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                      placeholder="Prix"
                      min={0}
                      step="0.01"
                      className="w-full text-[12px] bg-white border border-[#E6E6E4] rounded-md px-2.5 py-1.5 text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-[11px] text-[#BBB]">×</span>
                  <div className="w-16">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="w-full text-[12px] bg-white border border-[#E6E6E4] rounded-md px-2 py-1.5 text-center text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-[11px] text-[#BBB]">=</span>
                  <div className="w-20 text-right text-[12px] font-semibold text-[#191919] tabular-nums">
                    {fmtEur(item.quantity * item.unitPrice)}
                  </div>
                </div>

                {/* Row 3: Description (optional, compact) */}
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Description courte (facultatif)"
                  className="w-full text-[11px] bg-transparent border-0 px-0 py-0.5 text-[#8A8A88] placeholder-[#CCC] focus:outline-none"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add button */}
      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajouter une prestation
      </button>

      {/* Totals */}
      {items.length > 0 && (
        <div className="border-t border-[#EFEFEF] pt-3 space-y-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8A8A88]">Sous-total</span>
            <span className="font-medium text-[#191919] tabular-nums">{fmtEur(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8A8A88]">Remise</span>
            <div className="flex items-center gap-1">
              <span className="text-[#BBB]">-</span>
              <input
                type="number"
                value={discount || ""}
                onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                min={0}
                className="w-20 text-[12px] text-right bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-[#BBB]">€</span>
            </div>
          </div>

          {/* Deposit */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#8A8A88]">Acompte demandé</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={deposit || ""}
                onChange={(e) => onDepositChange(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                min={0}
                className="w-20 text-[12px] text-right bg-[#F7F7F5] border border-[#E6E6E4] rounded px-2 py-1 text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-[#BBB]">€</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E6E6E4]">
            <span className="text-[13px] font-semibold text-[#191919]">Total</span>
            <span className="text-[15px] font-bold text-[#191919] tabular-nums">{fmtEur(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
