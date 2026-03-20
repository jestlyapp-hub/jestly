"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/lib/hooks/use-api";
import type { BillingItemStatus } from "@/types";
import { Plus, X } from "lucide-react";
import { tw, formatEur } from "./facturation-types";

/* ══════════════════════════════════════════════════════════════════════
   MANUAL ITEM DRAWER (create)
   ══════════════════════════════════════════════════════════════════════ */

export default function ManualItemDrawer({ clients, onClose, onSave }: {
  clients: { id: string; name: string }[];
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawTemplates } = useApi<any[]>("/api/billing/templates");
  const activeTemplates = useMemo(
    () => (rawTemplates || []).filter((t: { archived?: boolean }) => !t.archived),
    [rawTemplates]
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    client_id: "",
    category: "",
    quantity: "1",
    unit: "unité",
    unit_price: "",
    tax_rate: "0",
    performed_at: new Date().toISOString().slice(0, 10),
    notes: "",
    status: "draft" as BillingItemStatus,
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applyTemplate = (tplId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tpl = activeTemplates.find((t: any) => t.id === tplId);
    if (!tpl) return;
    setForm(f => ({
      ...f,
      title: tpl.title,
      description: tpl.description || "",
      category: tpl.category || "",
      quantity: String(tpl.quantity || 1),
      unit: tpl.unit || "unité",
      unit_price: String(tpl.unit_price || 0),
      tax_rate: String(tpl.tax_rate || 0),
      tags: (tpl.tags || []).join(", "),
    }));
  };

  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
  const taxAmount = total * (Number(form.tax_rate) / 100);
  const totalTtc = total + taxAmount;
  const canSave = form.title.trim() && Number(form.unit_price) > 0;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    await onSave({
      title: form.title,
      description: form.description,
      client_id: form.client_id || null,
      category: form.category,
      quantity: Number(form.quantity),
      unit: form.unit,
      unit_price: Number(form.unit_price),
      tax_rate: Number(form.tax_rate),
      performed_at: form.performed_at || null,
      notes: form.notes,
      status: form.status,
      tags,
    });
    setSaving(false);
  };

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#F0EEFF]">
              <Plus size={16} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#191919]">Ligne manuelle</h2>
              <p className="text-[10px] text-[#A8A29E]">Pour les cas hors commande</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Template prefill */}
          {activeTemplates.length > 0 && (
            <div className="bg-[#FAFAF9] border border-[#E6E6E4] rounded-lg p-3">
              <label className="text-[11px] font-medium text-[#78716C] uppercase tracking-wide mb-1.5 block">Préremplir depuis un template</label>
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) applyTemplate(e.target.value); e.target.value = ""; }}
                className={tw.select}
              >
                <option value="">Choisir un template…</option>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {activeTemplates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.title} — {formatEur(Number(t.unit_price || 0))}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={tw.label}>Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Ex: Montage vidéo Reel Instagram"
              className={tw.input}
              autoFocus
            />
          </div>

          {/* Client + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>Client</label>
              <select value={form.client_id} onChange={e => set("client_id", e.target.value)} className={tw.select}>
                <option value="">Aucun client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={tw.label}>Catégorie</label>
              <input
                type="text"
                value={form.category}
                onChange={e => set("category", e.target.value)}
                placeholder="Ex: Vidéo, Design..."
                className={tw.input}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={tw.label}>Description</label>
            <textarea
              value={form.description}
              onChange={e => set("description", e.target.value)}
              rows={2}
              placeholder="Détails de la prestation..."
              className={`${tw.input} resize-none`}
            />
          </div>

          {/* Quantity + Unit + Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={tw.label}>Quantité</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={e => set("quantity", e.target.value)}
                className={`${tw.input} tabular-nums`}
              />
            </div>
            <div>
              <label className={tw.label}>Unité</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)} className={tw.select}>
                <option value="unité">Unité</option>
                <option value="heure">Heure</option>
                <option value="jour">Jour</option>
                <option value="forfait">Forfait</option>
                <option value="lot">Lot</option>
                <option value="mois">Mois</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Prix unitaire *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_price}
                onChange={e => set("unit_price", e.target.value)}
                placeholder="0,00"
                className={`${tw.input} tabular-nums`}
              />
            </div>
          </div>

          {/* Tax + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={tw.label}>TVA (%)</label>
              <select value={form.tax_rate} onChange={e => set("tax_rate", e.target.value)} className={tw.select}>
                <option value="0">0% (non assujetti)</option>
                <option value="5.5">5,5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label className={tw.label}>Date de réalisation</label>
              <input
                type="date"
                value={form.performed_at}
                onChange={e => set("performed_at", e.target.value)}
                className={tw.input}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={tw.label}>Tags <span className="text-[#C4C4C2] font-normal">(séparés par des virgules)</span></label>
            <input
              type="text"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
              placeholder="design, urgent, sprint-3..."
              className={tw.input}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={tw.label}>Notes internes</label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              placeholder="Notes privées pour votre suivi..."
              className={`${tw.input} resize-none`}
            />
          </div>

          {/* Total preview */}
          <div className="rounded-xl bg-[#FAFAFF] border border-[#E8E5F5] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#78716C]">Total HT</span>
              <span className="text-[18px] font-bold text-[#191919] tabular-nums">{formatEur(total)}</span>
            </div>
            {Number(form.tax_rate) > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#A8A29E]">TVA ({form.tax_rate}%)</span>
                  <span className="text-[13px] text-[#78716C] tabular-nums">{formatEur(taxAmount)}</span>
                </div>
                <div className="border-t border-[#E8E5F5] pt-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#78716C]">Total TTC</span>
                  <span className="text-[15px] font-bold text-[#6D28D9] tabular-nums">{formatEur(totalTtc)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F0EE] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-[13px] font-medium text-[#57534E] border border-[#E6E6E4] rounded-lg hover:bg-[#F5F5F4] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave || saving}
            className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all ${
              canSave && !saving
                ? "text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-sm shadow-[#7C3AED]/20"
                : "text-[#D6D3D1] bg-[#F5F5F4] border border-[#E6E6E4] cursor-not-allowed"
            }`}
          >
            {saving ? "Enregistrement..." : "Créer la ligne"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
