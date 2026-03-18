"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import { PRODUCT_TYPES, formatPrice } from "@/lib/productTypes";
import { slugify } from "@/lib/slug";
import { useColumns } from "@/lib/hooks/use-columns";
import BriefSchemaBuilder from "@/components/briefs/BriefSchemaBuilder";
import { LEGACY_SEEDED_KEYS } from "@/lib/kanban-config";
import type { Product, ProductType, ProductMode, BriefField } from "@/types";
import type { ProductRow } from "@/types/database";

/* ─── Shared constants ─── */
const TYPE_LABELS: Record<string, string> = {
  service: "Service", pack: "Pack", digital: "Digital", lead_magnet: "Lead magnet",
};
const TYPE_COLORS: Record<string, string> = {
  service: "bg-blue-50 text-blue-600", pack: "bg-[#4F46E5]/10 text-[#4F46E5]",
  digital: "bg-emerald-50 text-emerald-600", lead_magnet: "bg-amber-50 text-amber-600",
};
const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-emerald-50/90 text-emerald-600 border border-emerald-200/60" },
  draft: { label: "Brouillon", className: "bg-gray-100/90 text-[#8A8A88] border border-gray-200/60" },
  archived: { label: "Archivé", className: "bg-orange-50/90 text-orange-600 border border-orange-200/60" },
};
const INPUT_CLASS =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface TemplateRow {
  id: string; name: string; description: string | null; version: number;
  schema: BriefField[]; created_at: string; updated_at: string;
}

const DEFAULT_BRIEF_FIELDS: BriefField[] = [
  { key: "date_souhaitee", type: "date", label: "Date souhaitée", required: false, pinned: true, destinationType: "column_default", destinationKey: "deadline", target_kind: "order_field", target_ref: "deadline", destinationColumnLabel: "Deadline" },
  { key: "description_besoin", type: "textarea", label: "Description du besoin", required: true, placeholder: "Décrivez votre projet en détail...", destinationType: "detail_field", destinationKey: "briefing", target_kind: "order_field", target_ref: "briefing", destinationColumnLabel: "Briefing" },
  { key: "fichiers", type: "file", label: "Fichiers à fournir", required: false, destinationType: "detail_field", destinationKey: "resources", target_kind: "order_field", target_ref: "resources", destinationColumnLabel: "Ressources" },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CREATION MODAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CreationModal({ onClose, onCreated, briefTemplates }: {
  onClose: () => void; onCreated: () => void; briefTemplates: TemplateRow[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("service");
  const [priceEuros, setPriceEuros] = useState<number>(0);
  const [mode, setMode] = useState<ProductMode>("checkout");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBriefId, setSelectedBriefId] = useState<string>("");
  const [deliveryTimeDays, setDeliveryTimeDays] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<"file" | "url" | "none">("none");
  const [deliveryUrl, setDeliveryUrl] = useState("");

  const isLeadMagnet = type === "lead_magnet";
  const isDigital = type === "digital";

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(null);
    try {
      const res = await apiFetch("/api/products", {
        method: "POST",
        body: {
          title: name.trim(), type, price: isLeadMagnet ? 0 : priceEuros,
          checkout_mode: mode, slug: slugify(name.trim()),
          delivery_time_days: type === "service" && deliveryTimeDays > 0 ? deliveryTimeDays : null,
          delivery_type: (isDigital || isLeadMagnet) ? deliveryType : "none",
          delivery_url: deliveryType === "url" ? deliveryUrl : null,
        },
      });
      const productId = (res as { id?: string })?.id;
      if (selectedBriefId && productId) {
        await apiFetch(`/api/products/${productId}/brief`, {
          method: "PUT", body: { briefs: [{ brief_template_id: selectedBriefId, is_default: true }] },
        }).catch(() => {});
      }
      onCreated(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur lors de la création"); }
    finally { setSaving(false); }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/10 z-40" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.2, ease: "easeOut" as const }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-xl border border-[#E6E6E4] shadow-lg z-50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A]">Nouvelle offre</h2>
          <button onClick={onClose} className="text-[#8A8A88] hover:text-[#5A5A58] transition-colors p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Nom <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Logo Premium" className={INPUT_CLASS} autoFocus />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Type</label>
            <select value={type} onChange={(e) => { const t = e.target.value as ProductType; setType(t); if (t === "lead_magnet") setMode("contact"); }} className={INPUT_CLASS}>
              {PRODUCT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Mode</label>
            <div className="flex gap-2">
              {([{ value: "checkout" as const, label: "Paiement" }, { value: "contact" as const, label: "Contact" }]).map((m) => (
                <button key={m.value} type="button" onClick={() => setMode(m.value)}
                  className={`px-3.5 py-2 rounded-full text-[12px] font-medium transition-all ${mode === m.value ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4] hover:border-[#4F46E5]/30"}`}
                >{m.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Prix {mode === "contact" && !isLeadMagnet ? "(à partir de)" : ""}</label>
            <input type="number" min={0} step={1} value={isLeadMagnet ? 0 : priceEuros} onChange={(e) => setPriceEuros(Number(e.target.value))} disabled={isLeadMagnet} placeholder="0"
              className={`${INPUT_CLASS} ${isLeadMagnet ? "opacity-50 cursor-not-allowed" : ""}`} />
            {isLeadMagnet && <p className="text-[11px] text-[#8A8A88] mt-1">Gratuit</p>}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {type === "service" && (
            <motion.div key="svc" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Délai livraison (jours)</label>
              <input type="number" min={0} value={deliveryTimeDays} onChange={(e) => setDeliveryTimeDays(Number(e.target.value))} placeholder="0" className={INPUT_CLASS + " max-w-[200px]"} />
            </motion.div>
          )}
          {(isDigital || isLeadMagnet) && (
            <motion.div key="dig" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Livraison</label>
                  <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as "file" | "url" | "none")} className={INPUT_CLASS}>
                    <option value="none">Aucune</option><option value="file">Fichier</option><option value="url">URL externe</option>
                  </select>
                </div>
                {deliveryType === "url" && (
                  <div>
                    <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">URL</label>
                    <input type="url" value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} placeholder="https://..." className={INPUT_CLASS} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {briefTemplates.length > 0 && (
          <div className="mt-4">
            <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Brief associé</label>
            <select value={selectedBriefId} onChange={(e) => setSelectedBriefId(e.target.value)} className={INPUT_CLASS}>
              <option value="">Aucun brief</option>
              {briefTemplates.map((b) => (<option key={b.id} value={b.id}>{b.name} (v{b.version} — {(b.schema || []).length} champs)</option>))}
            </select>
            <p className="text-[11px] text-[#8A8A88] mt-1">Envoyé au client après achat</p>
          </div>
        )}
        {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-[#E6E6E4]">
          <button onClick={onClose} className="text-[13px] text-[#5A5A58] hover:text-[#1A1A1A] px-4 py-2 transition-colors">Annuler</button>
          <button onClick={handleCreate} disabled={!name.trim() || saving}
            className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            Créer
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OFFER CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Spinner() {
  return <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
}

function OfferCard({ product, index, onDuplicate, onArchive }: {
  product: Product; index: number;
  onDuplicate: (id: string) => void; onArchive: (id: string) => void;
}) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const handleDuplicate = async () => { setActionLoading("duplicate"); try { await onDuplicate(product.id); } finally { setActionLoading(null); } };
  const handleArchive = async () => { setActionLoading("archive"); try { await onArchive(product.id); } finally { setActionLoading(null); } };
  const badge = STATUS_BADGES[product.status] || STATUS_BADGES.draft;

  return (
    <motion.div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden hover:shadow-sm hover:border-[#D0D0CE] transition-all group" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.03, ease: "easeOut" as const }}>
      <div className="flex">
        <div className="relative w-28 flex-shrink-0 bg-[#F7F7F5] flex items-center justify-center overflow-hidden">
          {product.coverImageUrl ? (
            <img src={product.coverImageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4D4D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          )}
        </div>
        <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-transparent ${TYPE_COLORS[product.type] || "bg-gray-100 text-gray-600"}`}>{TYPE_LABELS[product.type] || product.type}</span>
            </div>
            <h3 className="text-[13px] font-semibold text-[#1A1A1A] truncate">{product.name}</h3>
            {product.shortDescription && <p className="text-[11px] text-[#8A8A88] line-clamp-1 mt-0.5">{product.shortDescription}</p>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[14px] font-bold text-[#1A1A1A]">
              {product.type === "lead_magnet" ? <span className="text-emerald-600 text-[12px] font-semibold">Gratuit</span> : formatPrice(product.priceCents)}
            </span>
            <span className="text-[10px] text-[#8A8A88]">{product.sales} vente{product.sales !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[#E6E6E4] px-3 py-1.5 flex items-center">
        <button onClick={() => router.push(`/produits/${product.id}`)} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#5A5A58] hover:text-[#4F46E5] py-1.5 rounded-md hover:bg-[#F7F7F5] transition-all">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          Éditer
        </button>
        <div className="w-px h-3.5 bg-[#E6E6E4]" />
        <button onClick={handleDuplicate} disabled={actionLoading === "duplicate"} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#5A5A58] hover:text-[#4F46E5] py-1.5 rounded-md hover:bg-[#F7F7F5] transition-all disabled:opacity-50">
          {actionLoading === "duplicate" ? <Spinner /> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>}
          Dupliquer
        </button>
        <div className="w-px h-3.5 bg-[#E6E6E4]" />
        <button onClick={handleArchive} disabled={actionLoading === "archive"} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-[#5A5A58] hover:text-red-500 py-1.5 rounded-md hover:bg-red-50/50 transition-all disabled:opacity-50">
          {actionLoading === "archive" ? <Spinner /> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>}
          Archiver
        </button>
      </div>
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BRIEFS SECTION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BriefsSection({ templates, loading: briefsLoading, mutate: mutateBriefs }: {
  templates: TemplateRow[] | null | undefined; loading: boolean; mutate: () => void;
}) {
  const { fields: allBoardFields } = useColumns();
  const orderColumns = allBoardFields.filter(
    (f) => !LEGACY_SEEDED_KEYS.has(f.key) && !(f.config as { hidden?: boolean })?.hidden
  );
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<BriefField[]>([]);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [briefMutating, setBriefMutating] = useState(false);

  const handleCreate = async (useDefault = false) => {
    if (!createName.trim() || briefMutating) return;
    setBriefMutating(true);
    try {
      await apiFetch("/api/brief-templates", {
        method: "POST", body: { name: createName, description: createDesc || null, fields: useDefault ? DEFAULT_BRIEF_FIELDS : [] },
      });
      setShowCreate(false); setCreateName(""); setCreateDesc("");
      await mutateBriefs();
    } finally { setBriefMutating(false); }
  };

  const startEdit = (t: TemplateRow) => { setEditingId(t.id); setEditFields(t.schema || []); setEditName(t.name); };

  const saveEdit = useCallback(async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/brief-templates/${editingId}`, { method: "PUT", body: { name: editName, fields: editFields } });
      await mutateBriefs();
    } catch { alert("Erreur lors de la sauvegarde"); }
    finally { setSaving(false); }
  }, [editingId, editName, editFields, mutateBriefs]);

  const handleDuplicate = async (t: TemplateRow) => {
    if (briefMutating) return;
    setBriefMutating(true);
    try {
      await apiFetch("/api/brief-templates", { method: "POST", body: { name: `${t.name} (copie)`, description: t.description, fields: t.schema } });
      await mutateBriefs();
    } finally { setBriefMutating(false); }
  };

  const handleDelete = async (id: string) => {
    if (briefMutating) return;
    if (!confirm("Supprimer ce template ?")) return;
    setBriefMutating(true);
    try {
      await apiFetch(`/api/brief-templates/${id}`, { method: "DELETE" });
      if (editingId === id) setEditingId(null);
      await mutateBriefs();
    } finally { setBriefMutating(false); }
  };

  const briefCount = templates?.length ?? 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1A1A]">Briefs</h3>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">{briefCount > 0 ? `${briefCount} questionnaire${briefCount !== 1 ? "s" : ""} — envoyés après achat` : "Questionnaires envoyés aux clients après achat"}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors whitespace-nowrap">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Créer un brief
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)} className="fixed inset-0 bg-black/10 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl border border-[#E6E6E4] shadow-lg z-50 p-6 space-y-4">
              <h2 className="text-[16px] font-semibold text-[#191919]">Nouveau brief</h2>
              <div>
                <label className="block text-[12px] text-[#8A8A88] mb-1">Nom</label>
                <input value={createName} onChange={(e) => setCreateName(e.target.value)} className={INPUT_CLASS} placeholder="Ex : Brief logo" autoFocus />
              </div>
              <div>
                <label className="block text-[12px] text-[#8A8A88] mb-1">Description</label>
                <textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} className={INPUT_CLASS + " resize-none"} rows={2} placeholder="Optionnel" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleCreate(false)} disabled={!createName.trim() || briefMutating} className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg border border-[#E6E6E4] text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors disabled:opacity-40">Vide</button>
                <button onClick={() => handleCreate(true)} disabled={!createName.trim() || briefMutating} className="flex-1 py-2.5 text-[13px] font-semibold rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors disabled:opacity-40">Template par défaut</button>
              </div>
              <button onClick={() => setShowCreate(false)} className="w-full text-[12px] text-[#8A8A88] hover:text-[#5A5A58] cursor-pointer">Annuler</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {briefsLoading && <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-[#F7F7F5] rounded-xl animate-pulse" />)}</div>}

      {!briefsLoading && (!templates || templates.length === 0) && (
        <div className="bg-white rounded-xl border border-[#E6E6E4] py-8 px-6 text-center">
          <p className="text-[13px] text-[#8A8A88]">Aucun brief pour l'instant</p>
          <button onClick={() => setShowCreate(true)} className="text-[12px] font-medium text-[#4F46E5] hover:underline mt-2">Créer un brief</button>
        </div>
      )}

      {!briefsLoading && templates && templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((t) => (
            <motion.div key={t.id} layout className={`bg-white border rounded-xl transition-all ${editingId === t.id ? "border-[#4F46E5]/40 shadow-sm ring-1 ring-[#4F46E5]/10" : "border-[#E6E6E4] hover:border-[#D0D0CE]"}`}>
              <div className="p-4 flex items-start justify-between gap-3">
                <button onClick={() => editingId === t.id ? setEditingId(null) : startEdit(t)} className="flex-1 text-left cursor-pointer min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-[#191919] truncate">{t.name}</h3>
                    <span className="text-[10px] text-[#8A8A88] bg-[#F7F7F5] px-2 py-0.5 rounded-md flex-shrink-0 font-medium">v{t.version}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-[#8A8A88]">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                      {(t.schema || []).length} champs
                    </span>
                    {t.description && <span className="truncate">{t.description}</span>}
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {editingId === t.id && <span className="text-[10px] font-medium text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md mr-1">Édition</span>}
                  <button onClick={() => handleDuplicate(t)} title="Dupliquer" disabled={briefMutating} className="p-1.5 rounded-md text-[#8A8A88] hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer disabled:opacity-40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  </button>
                  <button onClick={() => handleDelete(t.id)} title="Supprimer" disabled={briefMutating} className="p-1.5 rounded-md text-[#8A8A88] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {editingId === t.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[#E6E6E4]">
                      <div className="pt-4">
                        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Nom du template</label>
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className={INPUT_CLASS} />
                      </div>
                      <BriefSchemaBuilder fields={editFields} onChange={setEditFields} orderFields={orderColumns} />
                      <div className="flex items-center justify-between pt-2 border-t border-[#E6E6E4]">
                        <button onClick={() => setEditingId(null)} className="text-[12px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors">Fermer</button>
                        <button onClick={saveEdit} disabled={saving} className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors disabled:opacity-60">{saving ? "Enregistrement..." : "Enregistrer"}</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN PAGE — Offres (inside Site web)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function OffresPage() {
  const { data: rawProducts, loading: productsLoading, error: productsError, mutate: mutateProducts } = useApi<ProductRow[]>("/api/products");
  const { data: briefTemplates, loading: briefsLoading, mutate: mutateBriefs } = useApi<TemplateRow[]>("/api/brief-templates");
  const products: Product[] = rawProducts ? rawProducts.map(dbToProduct) : [];
  const [showModal, setShowModal] = useState(false);

  const handleDuplicate = async (id: string) => { await apiFetch(`/api/products/${id}/duplicate`, { method: "POST" }); mutateProducts(); };
  const handleArchive = async (id: string) => { await apiFetch(`/api/products/${id}/archive`, { method: "POST" }); mutateProducts(); };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-6 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Offres</h1>
          <p className="text-[12px] text-[#8A8A88] mt-1">
            {products.length > 0 ? `${products.length} offre${products.length !== 1 ? "s" : ""} — services, packs et produits digitaux` : "Gérez les offres et services que vous proposez sur votre site"}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Nouvelle offre
        </button>
      </motion.div>

      {/* Creation modal */}
      <AnimatePresence>
        {showModal && <CreationModal onClose={() => setShowModal(false)} onCreated={mutateProducts} briefTemplates={briefTemplates || []} />}
      </AnimatePresence>

      {/* Loading */}
      {productsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden animate-pulse flex">
              <div className="w-28 h-24 bg-[#F7F7F5]" />
              <div className="flex-1 p-4"><div className="h-3 w-24 bg-[#F7F7F5] rounded mb-2" /><div className="h-4 w-40 bg-[#F7F7F5] rounded mb-3" /><div className="h-3 w-16 bg-[#F7F7F5] rounded" /></div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {productsError && (
        <div className="py-8 text-center">
          <p className="text-[13px] text-red-500 mb-2">Erreur : {productsError}</p>
          <button onClick={mutateProducts} className="text-[13px] text-[#4F46E5] hover:underline">Réessayer</button>
        </div>
      )}

      {/* Empty state */}
      {!productsLoading && !productsError && products.length === 0 && (
        <motion.div className="bg-white rounded-xl border border-[#E6E6E4] py-14 px-6 text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="text-[16px] font-semibold text-[#1A1A1A] mb-1.5">Aucune offre</h3>
          <p className="text-[13px] text-[#8A8A88] mb-6 max-w-sm mx-auto">Créez votre première offre pour commencer à vendre vos services directement depuis votre site Jestly.</p>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Créer ma première offre
          </button>
        </motion.div>
      )}

      {/* Offers grid */}
      {!productsLoading && !productsError && products.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {products.map((p, i) => (
            <OfferCard key={p.id} product={p} index={i} onDuplicate={handleDuplicate} onArchive={handleArchive} />
          ))}
        </div>
      )}

      {/* Briefs section */}
      <div className="border-t border-[#E6E6E4] pt-8 mt-4">
        <BriefsSection templates={briefTemplates} loading={briefsLoading} mutate={mutateBriefs} />
      </div>
    </div>
  );
}
