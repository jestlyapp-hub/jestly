"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import { PRODUCT_TYPES, formatPrice } from "@/lib/productTypes";
import { slugify } from "@/lib/slug";
import type { Product, ProductType, ProductMode } from "@/types";
import type { ProductRow } from "@/types/database";

/* ─── Helpers ─── */

const TYPE_LABELS: Record<string, string> = {
  service: "Service",
  pack: "Pack",
  digital: "Digital",
  lead_magnet: "Lead magnet",
};

const TYPE_COLORS: Record<string, string> = {
  service: "bg-blue-50 text-blue-600",
  pack: "bg-[#4F46E5]/10 text-[#4F46E5]",
  digital: "bg-emerald-50 text-emerald-600",
  lead_magnet: "bg-amber-50 text-amber-600",
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-emerald-50/90 text-emerald-600 border border-emerald-200/60" },
  draft: { label: "Brouillon", className: "bg-gray-100/90 text-[#8A8A88] border border-gray-200/60" },
  archived: { label: "Archivé", className: "bg-orange-50/90 text-orange-600 border border-orange-200/60" },
};

const INPUT_CLASS =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

/* ─── Empty State Illustration (SVG) ─── */

function EmptyIllustration() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-6"
    >
      <rect x="20" y="40" width="80" height="55" rx="6" fill="#F7F7F5" stroke="#E6E6E4" strokeWidth="1.5" />
      <path d="M16 40 L60 20 L104 40" stroke="#E6E6E4" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="16" y="38" width="88" height="10" rx="3" fill="#FFFFFF" stroke="#E6E6E4" strokeWidth="1.5" />
      <line x1="60" y1="58" x2="60" y2="82" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="70" x2="72" y2="70" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
      <circle cx="92" cy="26" r="2.5" fill="#4F46E5" opacity="0.3" />
      <circle cx="100" cy="34" r="1.5" fill="#4F46E5" opacity="0.2" />
      <circle cx="28" cy="28" r="2" fill="#4F46E5" opacity="0.2" />
    </svg>
  );
}

/* ─── Creation Modal (Type-driven) ─── */

function CreationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("service");
  const [priceEuros, setPriceEuros] = useState<number>(0);
  const [mode, setMode] = useState<ProductMode>("checkout");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Type-specific fields
  const [deliveryTimeDays, setDeliveryTimeDays] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<"file" | "url" | "none">("none");
  const [deliveryUrl, setDeliveryUrl] = useState("");

  const isLeadMagnet = type === "lead_magnet";
  const isDigital = type === "digital";

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/products", {
        method: "POST",
        body: {
          title: name.trim(),
          type,
          price: isLeadMagnet ? 0 : priceEuros,
          checkout_mode: mode,
          slug: slugify(name.trim()),
          delivery_time_days: type === "service" && deliveryTimeDays > 0 ? deliveryTimeDays : null,
          delivery_type: (isDigital || isLeadMagnet) ? deliveryType : "none",
          delivery_url: deliveryType === "url" ? deliveryUrl : null,
        },
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl border border-[#E6E6E4] p-6 mb-6 shadow-sm"
      initial={{ opacity: 0, y: -12, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -12, scaleY: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" as const }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Nouveau produit</h2>
        <button
          onClick={onClose}
          className="text-[#8A8A88] hover:text-[#5A5A58] transition-colors p-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">
            Nom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Logo Premium"
            className={INPUT_CLASS}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => {
              const t = e.target.value as ProductType;
              setType(t);
              if (t === "lead_magnet") setMode("contact");
            }}
            className={INPUT_CLASS}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Mode pills */}
        <div>
          <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Mode</label>
          <div className="flex gap-2">
            {([
              { value: "checkout" as const, label: "Paiement" },
              { value: "contact" as const, label: "Contact" },
            ]).map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                  mode === m.value
                    ? "bg-[#4F46E5] text-white"
                    : "bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prix */}
        <div>
          <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">
            Prix {mode === "contact" && !isLeadMagnet ? "(à partir de)" : ""}
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={isLeadMagnet ? 0 : priceEuros}
            onChange={(e) => setPriceEuros(Number(e.target.value))}
            disabled={isLeadMagnet}
            placeholder="0"
            className={`${INPUT_CLASS} ${isLeadMagnet ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {isLeadMagnet && (
            <p className="text-[11px] text-[#8A8A88] mt-1">Gratuit (lead magnet)</p>
          )}
        </div>
      </div>

      {/* Type-specific fields */}
      <AnimatePresence mode="wait">
        {type === "service" && (
          <motion.div
            key="service-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Délai livraison (jours)</label>
                <input
                  type="number"
                  min={0}
                  value={deliveryTimeDays}
                  onChange={(e) => setDeliveryTimeDays(Number(e.target.value))}
                  placeholder="0"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </motion.div>
        )}

        {(isDigital || isLeadMagnet) && (
          <motion.div
            key="digital-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">
                  Livraison {isLeadMagnet && <span className="text-red-400">*</span>}
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as "file" | "url" | "none")}
                  className={INPUT_CLASS}
                >
                  <option value="none">Aucune</option>
                  <option value="file">Fichier</option>
                  <option value="url">URL externe</option>
                </select>
              </div>
              {deliveryType === "url" && (
                <div>
                  <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">URL</label>
                  <input
                    type="url"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="https://..."
                    className={INPUT_CLASS}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-[12px] text-red-500 mt-3">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 mt-5">
        <button
          onClick={onClose}
          className="text-[13px] text-[#5A5A58] hover:text-[#1A1A1A] px-4 py-2 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || saving}
          className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          Créer
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Product Card ─── */

function ProductCard({
  product,
  index,
  onDuplicate,
  onArchive,
}: {
  product: Product;
  index: number;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDuplicate = async () => {
    setActionLoading("duplicate");
    try {
      await onDuplicate(product.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    setActionLoading("archive");
    try {
      await onArchive(product.id);
    } finally {
      setActionLoading(null);
    }
  };

  const badge = STATUS_BADGES[product.status] || STATUS_BADGES.draft;

  return (
    <motion.div
      className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all group flex flex-col"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" as const }}
    >
      <div className="relative h-36 bg-[#F7F7F5] flex items-center justify-center overflow-hidden">
        {product.coverImageUrl ? (
          <img src={product.coverImageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4D4D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${badge.className}`}>
            {badge.label}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border border-transparent ${TYPE_COLORS[product.type] || "bg-gray-100 text-gray-600"}`}>
            {TYPE_LABELS[product.type] || product.type}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-1 line-clamp-1">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-[12px] text-[#8A8A88] mb-3 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
        )}
        <div className="mt-auto">
          <span className="text-lg font-bold text-[#1A1A1A]">
            {product.type === "lead_magnet" ? (
              <span className="text-emerald-600 text-[14px] font-semibold">Gratuit</span>
            ) : (
              <>{formatPrice(product.priceCents)}</>
            )}
          </span>
          <span className="text-[11px] text-[#8A8A88] ml-2">
            {product.sales} vente{product.sales !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="border-t border-[#E6E6E4] px-4 py-2.5 flex items-center gap-1">
        <button
          onClick={() => router.push(`/produits/${product.id}`)}
          className="flex-1 flex items-center justify-center gap-1 text-[12px] font-medium text-[#5A5A58] hover:text-[#4F46E5] py-1.5 rounded-md hover:bg-[#F7F7F5] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Éditer
        </button>
        <div className="w-px h-4 bg-[#E6E6E4]" />
        <button
          onClick={handleDuplicate}
          disabled={actionLoading === "duplicate"}
          className="flex-1 flex items-center justify-center gap-1 text-[12px] font-medium text-[#5A5A58] hover:text-[#4F46E5] py-1.5 rounded-md hover:bg-[#F7F7F5] transition-all disabled:opacity-50"
        >
          {actionLoading === "duplicate" ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          Dupliquer
        </button>
        <div className="w-px h-4 bg-[#E6E6E4]" />
        <button
          onClick={handleArchive}
          disabled={actionLoading === "archive"}
          className="flex-1 flex items-center justify-center gap-1 text-[12px] font-medium text-[#5A5A58] hover:text-red-500 py-1.5 rounded-md hover:bg-red-50/50 transition-all disabled:opacity-50"
        >
          {actionLoading === "archive" ? (
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
          )}
          Archiver
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function ProduitsPage() {
  const router = useRouter();
  const { data: rawProducts, loading, error, mutate } = useApi<ProductRow[]>("/api/products");
  const products: Product[] = rawProducts ? rawProducts.map(dbToProduct) : [];
  const [showModal, setShowModal] = useState(false);

  const handleDuplicate = async (id: string) => {
    await apiFetch(`/api/products/${id}/duplicate`, { method: "POST" });
    mutate();
  };

  const handleArchive = async (id: string) => {
    await apiFetch(`/api/products/${id}/archive`, { method: "POST" });
    mutate();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-[#F7F7F5] rounded animate-pulse" />
          <div className="h-10 w-44 bg-[#F7F7F5] rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden animate-pulse">
              <div className="h-36 bg-[#F7F7F5]" />
              <div className="p-4">
                <div className="h-4 w-28 bg-[#F7F7F5] rounded mb-2" />
                <div className="h-3 w-full bg-[#F7F7F5] rounded mb-2" />
                <div className="h-5 w-16 bg-[#F7F7F5] rounded" />
              </div>
              <div className="border-t border-[#E6E6E4] px-4 py-3">
                <div className="h-3 w-full bg-[#F7F7F5] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Produits</h1>
          {products.length > 0 && (
            <p className="text-[13px] text-[#8A8A88] mt-0.5">
              {products.length} produit{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un produit
        </button>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <CreationModal onClose={() => setShowModal(false)} onCreated={() => mutate()} />
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <motion.div
          className="bg-white rounded-xl border border-[#E6E6E4] py-16 px-8 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
          <EmptyIllustration />
          <h2 className="text-[17px] font-semibold text-[#1A1A1A] mb-2">Aucun produit pour le moment</h2>
          <p className="text-[13px] text-[#8A8A88] mb-8 max-w-md mx-auto">
            Créez votre premier produit et commencez à vendre en 3 étapes simples.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-6 sm:gap-10 mb-10">
            {[
              { num: "1", label: "Crée un produit", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
              { num: "2", label: "Ajoute-le sur ton site", sub: "(bloc Vente produit)", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg> },
              { num: "3", label: "Publie et vends", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3 text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">{step.icon}</div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">{step.num}. {step.label}</p>
                  {step.sub && <p className="text-[11px] text-[#8A8A88]">{step.sub}</p>}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-[13px] font-semibold px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Créer mon premier produit
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} onDuplicate={handleDuplicate} onArchive={handleArchive} />
          ))}
        </div>
      )}
    </div>
  );
}
