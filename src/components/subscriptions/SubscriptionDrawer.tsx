"use client";

import { useState, useEffect } from "react";
import SlidePanel from "@/components/ui/SlidePanel";
import AnimatedButton from "@/components/ui/AnimatedButton";
import { toast } from "@/lib/hooks/use-toast";
import { apiFetch } from "@/lib/hooks/use-api";
import { useSubscriptionLogo } from "@/lib/hooks/use-subscription-logo";
import { normalizeDomain } from "@/lib/utils/domain";
import type { Subscription, SubscriptionCategory, BillingFrequency, SubscriptionStatus } from "@/types/subscription";
import { CATEGORY_CONFIG, FREQUENCY_LABELS, STATUS_CONFIG } from "@/types/subscription";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pass existing sub to edit, null to create */
  subscription?: Subscription | null;
}

// ── Domain field with live logo preview ──────────────────────────

function DomainField({ name, domain, onChange }: { name: string; domain: string; onChange: (v: string) => void }) {
  const { logoUrl, isFallback, isLoading, fallback } = useSubscriptionLogo(name, domain || undefined);

  return (
    <div>
      <label className="text-[12px] font-medium text-[#5A5A58] mb-1 block">Domaine (pour le logo)</label>
      <div className="flex items-center gap-3">
        {/* Live preview */}
        <div className="flex-shrink-0">
          {isLoading ? (
            <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
          ) : logoUrl && !isFallback ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#F0F0EE] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="" className="w-7 h-7 object-contain" />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[15px] font-bold shadow-sm"
              style={{ background: fallback.background }}
            >
              {fallback.letter}
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={domain}
            onChange={(e) => onChange(e.target.value.replace(/\s/g, ""))}
            placeholder="ex : figma.com, notion.so"
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
          />
          <p className="text-[10px] text-[#BBB] mt-1">
            {!domain && name ? `Laisse vide — on teste ${name.toLowerCase()}.com, .ai, .io...` : "Le logo est détecté automatiquement"}
          </p>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = Object.entries(CATEGORY_CONFIG) as [SubscriptionCategory, typeof CATEGORY_CONFIG[SubscriptionCategory]][];
const FREQUENCIES = Object.entries(FREQUENCY_LABELS) as [BillingFrequency, string][];

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3.5 py-2.5 text-[13px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20";
const labelClass = "text-[12px] font-medium text-[#5A5A58] mb-1 block";

export default function SubscriptionDrawer({ open, onClose, onSaved, subscription }: Props) {
  const isEdit = !!subscription;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    domain: "",
    amount: "",
    billing_frequency: "monthly" as BillingFrequency,
    billing_day: "1",
    category: "tools" as SubscriptionCategory,
    is_tax_deductible: false,
    status: "active" as SubscriptionStatus,
    notes: "",
  });

  // Populate form for editing
  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name,
        domain: subscription.domain || "",
        amount: String(subscription.amount_cents / 100),
        billing_frequency: subscription.billing_frequency,
        billing_day: String(subscription.billing_day),
        category: subscription.category,
        is_tax_deductible: subscription.is_tax_deductible,
        status: subscription.status,
        notes: subscription.notes || "",
      });
    } else {
      setForm({
        name: "", domain: "", amount: "", billing_frequency: "monthly",
        billing_day: "1", category: "tools", is_tax_deductible: false,
        status: "active", notes: "",
      });
    }
  }, [subscription, open]);

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.amount || saving) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        domain: form.domain.trim() || undefined,
        amount_cents: Math.round(Number(form.amount) * 100),
        billing_frequency: form.billing_frequency,
        billing_day: Number(form.billing_day),
        category: form.category,
        is_tax_deductible: form.is_tax_deductible,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };

      if (isEdit) {
        await apiFetch(`/api/subscriptions/${subscription!.id}`, { method: "PATCH", body });
        toast.success("Abonnement mis à jour");
      } else {
        await apiFetch("/api/subscriptions", { body });
        toast.success("Abonnement ajouté");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/subscriptions/${subscription!.id}`, { method: "DELETE" });
      toast.success("Abonnement supprimé");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlidePanel open={open} onClose={onClose} title={isEdit ? "Modifier l'abonnement" : "Nouvel abonnement"}>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Nom de l&apos;outil</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ex : Figma, Notion, Vercel..."
            className={inputClass}
          />
        </div>

        {/* Domain (for logo auto-detection) + live preview */}
        <DomainField
          name={form.name}
          domain={form.domain}
          onChange={(v) => update("domain", normalizeDomain(v))}
        />

        {/* Amount + Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Montant</label>
            <div className="relative">
              <input
                type="number"
                value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className={`${inputClass} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#BBB]">&euro;</span>
            </div>
          </div>
          <div>
            <label className={labelClass}>Fréquence</label>
            <select
              value={form.billing_frequency}
              onChange={(e) => update("billing_frequency", e.target.value)}
              className={inputClass}
            >
              {FREQUENCIES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Billing day + Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Jour de prélèvement</label>
            <input
              type="number"
              value={form.billing_day}
              onChange={(e) => update("billing_day", e.target.value)}
              min="1"
              max="31"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map(([key, config]) => (
                <option key={key} value={key}>{config.icon} {config.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        {isEdit && (
          <div>
            <label className={labelClass}>Statut</label>
            <div className="flex gap-2">
              {(Object.entries(STATUS_CONFIG) as [SubscriptionStatus, { label: string; color: string }][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update("status", key)}
                  className={`flex-1 text-[11px] font-medium py-2 rounded-lg border transition-all cursor-pointer ${
                    form.status === key
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#8A8A88] hover:bg-[#F7F7F5]"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tax deductible */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_tax_deductible}
            onChange={(e) => update("is_tax_deductible", e.target.checked)}
            className="w-4 h-4 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
          />
          <span className="text-[13px] text-[#5A5A58]">Déductible fiscalement</span>
        </label>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Notes, rappels..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          <AnimatedButton
            onClick={handleSubmit}
            disabled={!form.name.trim() || !form.amount}
            loading={saving}
            className="flex-1"
          >
            {isEdit ? "Enregistrer" : "Ajouter l'abonnement"}
          </AnimatedButton>
          {isEdit && (
            <AnimatedButton
              onClick={handleDelete}
              variant="danger"
              loading={saving}
              size="sm"
            >
              Supprimer
            </AnimatedButton>
          )}
        </div>
      </div>
    </SlidePanel>
  );
}
