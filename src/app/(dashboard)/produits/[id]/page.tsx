"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { dbToProduct } from "@/lib/adapters";
import { PRODUCT_TYPES, PRODUCT_STATUSES, formatPrice, eurosToCents, centsToEuros } from "@/lib/productTypes";
import type { Product, ProductType, ProductMode, ProductStatus, DeliveryType, BriefField } from "@/types";
import type { ProductRow } from "@/types/database";
import BriefFormRenderer from "@/components/briefs/BriefFormRenderer";

/* ─── Shared style tokens ─── */
const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const labelClass = "block text-[13px] font-medium text-[#5A5A58] mb-1.5";
const cardClass = "bg-white rounded-xl border border-[#E6E6E4] p-6";

/* ─── Types ─── */
type Tab = "infos" | "vente" | "livraison" | "distribution" | "brief" | "stats";

const TABS: { key: Tab; label: string }[] = [
  { key: "infos", label: "Infos" },
  { key: "vente", label: "Vente" },
  { key: "livraison", label: "Livraison" },
  { key: "distribution", label: "Distribution" },
  { key: "brief", label: "Brief" },
  { key: "stats", label: "Stats" },
];

const DELIVERY_TYPES: { value: DeliveryType; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "file", label: "Fichier" },
  { value: "url", label: "URL" },
  { value: "message", label: "Message" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-emerald-50 text-emerald-600" },
  draft: { label: "Brouillon", className: "bg-[#F7F7F5] text-[#8A8A88]" },
  archived: { label: "Archivé", className: "bg-orange-50 text-orange-600" },
};

/* ─── Page component ─── */
export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const {
    data: raw,
    loading,
    error,
    mutate,
  } = useApi<ProductRow>(`/api/products/${id}`);
  const product = raw ? dbToProduct(raw) : null;

  /* ─── Local form state ─── */
  const [tab, setTab] = useState<Tab>("infos");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Infos
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  // Vente
  const [type, setType] = useState<ProductType>("service");
  const [priceEuros, setPriceEuros] = useState(0);
  const [mode, setMode] = useState<ProductMode>("checkout");
  const [ctaLabel, setCtaLabel] = useState("Acheter");
  const [status, setStatus] = useState<ProductStatus>("draft");

  // Livraison
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("none");
  const [deliveryFilePath, setDeliveryFilePath] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryTimeDays, setDeliveryTimeDays] = useState(0);

  // Distribution
  const [isFeatured, setIsFeatured] = useState(false);

  // Stats
  const [salesCount, setSalesCount] = useState(0);

  // Brief (M:N product_briefs)
  const [briefTemplates, setBriefTemplates] = useState<{ id: string; name: string; version: number; schema: BriefField[] }[]>([]);
  const [linkedBriefs, setLinkedBriefs] = useState<{ brief_template_id: string; is_default: boolean }[]>([]);
  const [briefLoaded, setBriefLoaded] = useState(false);

  /* ─── Init local state from API data ─── */
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setSlug(product.slug);
    setShortDescription(product.shortDescription);
    setLongDescription(product.longDescription ?? "");
    setCoverImageUrl(product.coverImageUrl ?? "");
    setCategory(product.category);
    setFeatures(product.features ?? []);
    setType(product.type);
    setPriceEuros(centsToEuros(product.priceCents));
    setMode(product.mode);
    setCtaLabel(product.ctaLabel);
    setStatus(product.status);
    setDeliveryType(product.deliveryType);
    setDeliveryFilePath(product.deliveryFileUrl ?? "");
    setDeliveryUrl(product.deliveryUrl ?? "");
    setDeliveryTimeDays(product.deliveryTimeDays ?? 0);
    setIsFeatured(product.featured ?? false);
    setSalesCount(product.sales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  // Load brief links + templates list
  useEffect(() => {
    if (!id || briefLoaded) return;
    const loadBrief = async () => {
      try {
        const [linksRes, templatesRes] = await Promise.all([
          fetch(`/api/products/${id}/brief`),
          fetch("/api/brief-templates"),
        ]);
        const links = await linksRes.json();
        const tpls = await templatesRes.json();
        setBriefTemplates(Array.isArray(tpls) ? tpls : []);
        if (Array.isArray(links)) {
          setLinkedBriefs(links.map((l: { brief_template_id: string; is_default: boolean }) => ({
            brief_template_id: l.brief_template_id,
            is_default: l.is_default,
          })));
        }
        setBriefLoaded(true);
      } catch {
        // silently fail
      }
    };
    loadBrief();
  }, [id, briefLoaded]);

  /* ─── Save handler ─── */
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch(`/api/products/${id}`, {
        method: "PATCH",
        body: {
          title: name,
          slug,
          short_description: shortDescription,
          long_description: longDescription || null,
          cover_image_url: coverImageUrl || null,
          category,
          features,
          type,
          price: priceEuros,
          checkout_mode: mode,
          cta_label: ctaLabel,
          is_active: status === "active",
          delivery_type: deliveryType,
          delivery_file_path: deliveryFilePath || null,
          delivery_url: deliveryUrl || null,
          delivery_time_days: deliveryTimeDays || null,
          is_featured: isFeatured,
        },
      });
      await mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Features list helpers ─── */
  const updateFeature = (index: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  };
  const removeFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };
  const addFeature = () => {
    setFeatures((prev) => [...prev, ""]);
  };

  /* ─── Save brief settings (M:N) ─── */
  const saveBriefSettings = async () => {
    try {
      await apiFetch(`/api/products/${id}/brief`, {
        method: "PUT",
        body: { briefs: linkedBriefs },
      });
    } catch {
      alert("Erreur lors de la sauvegarde du brief");
    }
  };

  const addBriefLink = (templateId: string) => {
    if (linkedBriefs.some((b) => b.brief_template_id === templateId)) return;
    const isFirst = linkedBriefs.length === 0;
    setLinkedBriefs([...linkedBriefs, { brief_template_id: templateId, is_default: isFirst }]);
  };

  const removeBriefLink = (templateId: string) => {
    const next = linkedBriefs.filter((b) => b.brief_template_id !== templateId);
    // If removed the default, make first one default
    if (next.length > 0 && !next.some((b) => b.is_default)) {
      next[0].is_default = true;
    }
    setLinkedBriefs(next);
  };

  const setDefaultBrief = (templateId: string) => {
    setLinkedBriefs(linkedBriefs.map((b) => ({ ...b, is_default: b.brief_template_id === templateId })));
  };

  /* ─── Copy to clipboard ─── */
  const [copied, setCopied] = useState(false);
  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 bg-[#F7F7F5] rounded-lg animate-pulse" />
          <div className="h-7 w-48 bg-[#F7F7F5] rounded animate-pulse" />
        </div>
        <div className="h-10 w-full bg-[#F7F7F5] rounded-lg animate-pulse mb-6" />
        <div className={`${cardClass} space-y-4`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-[#F7F7F5] rounded mb-2 animate-pulse" />
              <div className="h-10 w-full bg-[#F7F7F5] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={mutate} className="text-[13px] text-[#4F46E5] hover:underline">
          Réessayer
        </button>
      </div>
    );
  }

  if (!product) return null;

  const badge = STATUS_BADGE[status] || STATUS_BADGE.draft;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ─── Header ─── */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/produits")}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E6E6E4] bg-white hover:bg-[#F7F7F5] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A5A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A] truncate max-w-[280px]">{name || "Sans titre"}</h1>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all ${
            saved ? "bg-emerald-500 text-white" : "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
          } disabled:opacity-60`}
        >
          {saving ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : saved ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : null}
          {saving ? "Enregistrement..." : saved ? "Enregistré" : "Enregistrer"}
        </button>
      </motion.div>

      {/* ─── Tabs ─── */}
      <motion.div
        className="flex gap-1 border-b border-[#E6E6E4] mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              tab === t.key ? "text-[#4F46E5] border-b-2 border-[#4F46E5]" : "text-[#8A8A88] hover:text-[#5A5A58]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* ─── Tab content ─── */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === "infos" && (
          <div className={`${cardClass} space-y-5`}>
            <div>
              <label className={labelClass}>Nom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Nom du produit" />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="mon-produit" />
              <p className="text-[11px] text-[#8A8A88] mt-1">URL : /p/{slug || "..."}</p>
            </div>
            <div>
              <label className={labelClass}>Description courte</label>
              <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} rows={2} placeholder="Résumé en une ou deux phrases..." />
            </div>
            <div>
              <label className={labelClass}>Description longue</label>
              <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className={inputClass} rows={4} placeholder="Description détaillée du produit..." />
            </div>
            <div>
              <label className={labelClass}>Image de couverture</label>
              <input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className={labelClass}>Catégorie</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} placeholder="Ex : Design, Dev, Formation..." />
            </div>
            <div>
              <label className={labelClass}>Caractéristiques</label>
              <div className="space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={f} onChange={(e) => updateFeature(i, e.target.value)} className={inputClass} placeholder={`Caractéristique ${i + 1}`} />
                    <button onClick={() => removeFeature(i)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E6E4] text-[#8A8A88] hover:text-red-500 hover:border-red-200 transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addFeature} className="mt-2 text-[12px] font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors">+ Ajouter</button>
            </div>
          </div>
        )}

        {tab === "vente" && (
          <div className={`${cardClass} space-y-5`}>
            <div>
              <label className={labelClass}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as ProductType)} className={inputClass}>
                {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ProductStatus)} className={inputClass}>
                {PRODUCT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prix en EUR</label>
              <input
                type="number"
                value={priceEuros}
                onChange={(e) => setPriceEuros(Number(e.target.value))}
                className={inputClass}
                disabled={type === "lead_magnet"}
                min={0}
                step={0.01}
                placeholder="0.00"
              />
              {type === "lead_magnet" && <p className="text-[11px] text-[#8A8A88] mt-1">Gratuit — Lead magnet</p>}
            </div>
            <div>
              <label className={labelClass}>Mode de commande</label>
              <div className="flex gap-2">
                {([{ value: "checkout" as const, label: "Paiement" }, { value: "contact" as const, label: "Contact" }]).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all ${
                      mode === m.value ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Texte du CTA</label>
              <input type="text" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputClass} placeholder="Acheter" />
            </div>
          </div>
        )}

        {tab === "livraison" && (
          <div className={`${cardClass} space-y-5`}>
            <div>
              <label className={labelClass}>Type de livraison</label>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as DeliveryType)} className={inputClass}>
                {DELIVERY_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            {deliveryType === "file" && (
              <div>
                <label className={labelClass}>Fichier</label>
                <input type="text" value={deliveryFilePath} onChange={(e) => setDeliveryFilePath(e.target.value)} className={inputClass} placeholder="Chemin ou URL du fichier" />
              </div>
            )}
            {deliveryType === "url" && (
              <div>
                <label className={labelClass}>URL de livraison</label>
                <input type="text" value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
            )}
            <div>
              <label className={labelClass}>Délai de livraison (jours)</label>
              <input type="number" value={deliveryTimeDays} onChange={(e) => setDeliveryTimeDays(Number(e.target.value))} className={inputClass} min={0} placeholder="0" />
            </div>
          </div>
        )}

        {tab === "distribution" && (
          <div className={`${cardClass} space-y-6`}>
            <div className="flex items-start gap-3 p-4 bg-[#F7F7F5] rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <p className="text-[13px] text-[#5A5A58]">Ce produit est disponible dans votre boutique.</p>
            </div>
            <div>
              <label className={labelClass}>Lien public</label>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={`/p/${slug}`} className={`${inputClass} bg-[#FBFBFA] text-[#8A8A88]`} />
                <button
                  onClick={() => copyLink(`/p/${slug}`)}
                  className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                    copied ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-[#E6E6E4] bg-white text-[#5A5A58] hover:border-[#4F46E5]/30"
                  }`}
                >
                  {copied ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A1A]">Mis en avant</p>
                <p className="text-[11px] text-[#8A8A88]">Affiche ce produit en priorité sur votre site</p>
              </div>
              <button
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${isFeatured ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-[22px]" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        )}

        {tab === "brief" && (
          <div className={`${cardClass} space-y-5`}>
            <div>
              <p className="text-[13px] font-medium text-[#1A1A1A]">Briefs liés à ce produit</p>
              <p className="text-[11px] text-[#8A8A88]">Le client remplira le brief par défaut au checkout</p>
            </div>

            {/* Linked briefs list */}
            {linkedBriefs.length > 0 && (
              <div className="space-y-2">
                {linkedBriefs.map((link) => {
                  const tpl = briefTemplates.find((t) => t.id === link.brief_template_id);
                  return (
                    <div key={link.brief_template_id} className={`flex items-center justify-between p-3 rounded-lg border ${link.is_default ? "border-[#4F46E5]/30 bg-[#EEF2FF]" : "border-[#E6E6E4] bg-white"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#191919]">{tpl?.name || "..."}</span>
                        {tpl && <span className="text-[10px] text-[#8A8A88]">v{tpl.version} · {(tpl.schema || []).length} champs</span>}
                        {link.is_default && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4F46E5] text-white font-medium">Par défaut</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {!link.is_default && (
                          <button onClick={() => setDefaultBrief(link.brief_template_id)} className="text-[11px] text-[#4F46E5] hover:underline cursor-pointer">
                            Définir par défaut
                          </button>
                        )}
                        <button onClick={() => removeBriefLink(link.brief_template_id)} className="p-1 text-[#8A8A88] hover:text-red-500 cursor-pointer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add brief select */}
            <div>
              <label className={labelClass}>Ajouter un brief</label>
              <select
                value=""
                onChange={(e) => { if (e.target.value) addBriefLink(e.target.value); }}
                className={inputClass}
              >
                <option value="">Sélectionner un template...</option>
                {briefTemplates
                  .filter((t) => !linkedBriefs.some((b) => b.brief_template_id === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
                  ))}
              </select>
              {briefTemplates.length === 0 && (
                <p className="text-[11px] text-[#8A8A88] mt-1">
                  Aucun template. <a href="/briefs" className="text-[#4F46E5] hover:underline">Créer un brief</a>
                </p>
              )}
            </div>

            {/* Preview of default brief */}
            {(() => {
              const defaultLink = linkedBriefs.find((b) => b.is_default);
              if (!defaultLink) return null;
              const tpl = briefTemplates.find((t) => t.id === defaultLink.brief_template_id);
              if (!tpl?.schema?.length) return null;
              return (
                <div>
                  <label className={labelClass}>Aperçu du brief par défaut</label>
                  <div className="border border-[#E6E6E4] rounded-lg p-4 bg-[#FBFBFA]">
                    <BriefFormRenderer
                      fields={tpl.schema}
                      answers={{}}
                      onChange={() => {}}
                      readOnly
                    />
                  </div>
                </div>
              );
            })()}

            {/* Save */}
            <button
              onClick={saveBriefSettings}
              className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
            >
              Enregistrer
            </button>
          </div>
        )}

        {tab === "stats" && (
          <div className={`${cardClass} space-y-6`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4F46E5]/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A1A1A]">{salesCount}</p>
                <p className="text-[12px] text-[#8A8A88]">Ventes totales</p>
              </div>
            </div>
            {salesCount === 0 && (
              <div className="py-8 text-center border-t border-[#E6E6E4]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E6E6E4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                <p className="text-[13px] text-[#8A8A88]">Pas encore de donnees de vente pour ce produit.</p>
              </div>
            )}
            {salesCount > 0 && (
              <div className="border-t border-[#E6E6E4] pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#F7F7F5]">
                    <p className="text-[12px] text-[#8A8A88] mb-1">Chiffre d&apos;affaires</p>
                    <p className="text-lg font-bold text-[#1A1A1A]">{(salesCount * centsToEuros(product.priceCents)).toFixed(2)} &euro;</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F7F7F5]">
                    <p className="text-[12px] text-[#8A8A88] mb-1">Panier moyen</p>
                    <p className="text-lg font-bold text-[#1A1A1A]">{centsToEuros(product.priceCents).toFixed(2)} &euro;</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
