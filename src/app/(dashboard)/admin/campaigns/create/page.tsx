"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────────
const CHANNELS = [
  { value: "meta", label: "Meta (Facebook/Instagram)" },
  { value: "tiktok", label: "TikTok" },
  { value: "google", label: "Google Ads" },
  { value: "email", label: "Email" },
  { value: "seo", label: "SEO" },
  { value: "organic_social", label: "Social organique" },
  { value: "affiliate", label: "Affiliation" },
  { value: "partner", label: "Partenaire" },
  { value: "direct", label: "Direct" },
  { value: "outbound", label: "Outbound" },
  { value: "other", label: "Autre" },
];

const OBJECTIVES = [
  { value: "awareness", label: "Notoriété" },
  { value: "leads", label: "Génération de leads" },
  { value: "signups", label: "Inscriptions" },
  { value: "sales", label: "Ventes" },
  { value: "retention", label: "Rétention" },
  { value: "other", label: "Autre" },
];

const STATUSES = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Active" },
  { value: "paused", label: "En pause" },
];

const CURRENCIES = [
  { value: "EUR", label: "EUR (€)" },
  { value: "USD", label: "USD ($)" },
];

// ── Slug helper ────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Component ──────────────────────────────────────────────────────
export default function CreateCampaignPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("meta");
  const [objective, setObjective] = useState("leads");
  const [status, setStatus] = useState("draft");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetPlanned, setBudgetPlanned] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [targetAudience, setTargetAudience] = useState("");
  const [offerName, setOfferName] = useState("");
  const [hook, setHook] = useState("");
  const [mainCta, setMainCta] = useState("");
  const [notes, setNotes] = useState("");
  const [owner, setOwner] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugManual) {
      setSlug(slugify(v));
    }
  };

  const handleSlugChange = (v: string) => {
    setSlugManual(true);
    setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body = {
        name: name.trim(),
        slug: slug || slugify(name),
        description: description.trim() || null,
        channel,
        objective,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_planned: budgetPlanned ? parseFloat(budgetPlanned) : null,
        currency,
        target_audience: targetAudience.trim() || null,
        offer_name: offerName.trim() || null,
        hook: hook.trim() || null,
        main_cta: mainCta.trim() || null,
        notes: notes.trim() || null,
        owner: owner.trim() || null,
      };

      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création.");
        return;
      }

      const data = await res.json();
      router.push(`/admin/campaigns/${data.id}`);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSaving(false);
    }
  };

  // ── Shared input classes ──
  const inputCls =
    "w-full px-3 py-2 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[14px] text-[#191919] placeholder:text-[#999] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10 transition-colors";
  const labelCls = "block text-[13px] font-medium text-[#5A5A58] mb-1.5";
  const selectCls =
    "w-full px-3 py-2 rounded-md bg-[#F7F7F5] border border-[#E6E6E4] text-[14px] text-[#191919] outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10 cursor-pointer transition-colors";

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Nouvelle campagne"
        description="Créer une campagne marketing"
        section="Campagnes"
        actions={
          <Link
            href="/admin/campaigns"
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#666] bg-white border border-[#E6E6E4] rounded-md hover:bg-[#F7F7F5] transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Retour
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-600">
            {error}
          </div>
        )}

        {/* ── Section: Informations ── */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#191919]">Informations</h2>

          <div>
            <label className={labelCls}>
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="ex: Lancement Jestly Q1 2026"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="lancement-jestly-q1-2026"
              className={inputCls}
            />
            <p className="text-[11px] text-[#8A8A88] mt-1">
              Identifiant unique pour les UTM. Auto-généré depuis le nom.
            </p>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Objectif, contexte, notes de brief..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* ── Section: Configuration ── */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#191919]">Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Canal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className={selectCls}
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Objectif</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className={selectCls}
              >
                {OBJECTIVES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* ── Section: Budget ── */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#191919]">Budget</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Budget prévu</label>
              <div className="relative">
                <input
                  type="number"
                  value={budgetPlanned}
                  onChange={(e) => setBudgetPlanned(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`${inputCls} pr-10`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8A8A88]">
                  {currency === "EUR" ? "\u20AC" : "$"}
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={selectCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Section: Targeting ── */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#191919]">Targeting</h2>

          <div>
            <label className={labelCls}>Audience cible</label>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Freelances créatifs, 25-45 ans, France..."
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nom de l'offre</label>
              <input
                type="text"
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                placeholder="ex: Essai Pro gratuit 14j"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>CTA principal</label>
              <input
                type="text"
                value={mainCta}
                onChange={(e) => setMainCta(e.target.value)}
                placeholder="ex: Essayer gratuitement"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Hook / Accroche</label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="ex: Remplacez vos 10 outils par 1 seul"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Section: Notes ── */}
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5 space-y-4">
          <h2 className="text-[15px] font-semibold text-[#191919]">Notes</h2>

          <div>
            <label className={labelCls}>Notes internes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes libres, liens vers assets, briefs..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Responsable</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="Nom du responsable de la campagne"
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />}
            {saving ? "Création..." : "Créer la campagne"}
          </button>
          <Link
            href="/admin/campaigns"
            className="px-4 py-2.5 text-[13px] font-medium text-[#666] hover:text-[#191919] transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
