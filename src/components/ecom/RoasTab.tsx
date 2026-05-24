"use client";

import { useState, useEffect } from "react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { Save, Info, Loader2 } from "lucide-react";
import type { EcomSettings } from "@/lib/ads/types";

interface SettingsResponse { settings: EcomSettings }

const ATTRIBUTION_LABELS: Record<string, string> = {
  first_touch: "Premier touch",
  last_touch: "Dernier touch",
  linear: "Linéaire",
  u_shaped: "En U",
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
};

export default function RoasTab() {
  const { data, loading, mutate } = useApi<SettingsResponse>("/api/ecom/settings");
  const [form, setForm] = useState<EcomSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  if (loading || !form) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="mx-auto animate-spin text-[#7C3AED]" size={20} />
      </div>
    );
  }

  const breakEvenRoas = form.net_margin_percent > 0
    ? (100 / form.net_margin_percent).toFixed(2)
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/ecom/settings", {
        method: "PATCH",
        body: {
          roas_profitability_threshold: Number(form.roas_profitability_threshold),
          roas_warning_threshold: Number(form.roas_warning_threshold),
          net_margin_percent: Number(form.net_margin_percent),
          attribution_window_days: Number(form.attribution_window_days),
          attribution_model: form.attribution_model,
          default_currency: form.default_currency,
          alerts_enabled: form.alerts_enabled,
          alert_drop_threshold_percent: Number(form.alert_drop_threshold_percent),
          alert_min_spend_cents: Number(form.alert_min_spend_cents),
          email_digest_enabled: form.email_digest_enabled,
          email_digest_frequency: form.email_digest_frequency,
        },
      });
      toast.success("Réglages enregistrés — recompute en cours");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof EcomSettings>(key: K, value: EcomSettings[K]) =>
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[16px] font-bold text-[#191919]">ROAS et attribution</h2>
        <p className="text-[12px] text-[#8A8A88]">Seuils de rentabilité, fenêtre d&apos;attribution, alertes et notifications.</p>
      </div>

      <Card title="Seuils de rentabilité">
        <Field label="ROAS minimum rentable" hint="ROAS au-dessus duquel une campagne est marquée 🟢">
          <input type="number" step="0.1" min="0" max="20"
            value={form.roas_profitability_threshold}
            onChange={(e) => set("roas_profitability_threshold", Number(e.target.value))}
            className="input" />
        </Field>
        <Field label="ROAS seuil d'alerte" hint="En dessous, campagne marquée 🔴 et alerte générée">
          <input type="number" step="0.1" min="0" max="20"
            value={form.roas_warning_threshold}
            onChange={(e) => set("roas_warning_threshold", Number(e.target.value))}
            className="input" />
        </Field>
        <Field label="Marge nette moyenne (%)" hint="Utilisée pour le ROAS marginal (revenue × marge / spend)">
          <input type="number" step="1" min="0" max="100"
            value={form.net_margin_percent}
            onChange={(e) => set("net_margin_percent", Number(e.target.value))}
            className="input" />
        </Field>
        <Insight icon={<Info size={12} />}>
          Avec une marge de {form.net_margin_percent}%, votre ROAS d&apos;équilibre est <strong>{breakEvenRoas}×</strong>.
        </Insight>
      </Card>

      <Card title="Attribution">
        <Field label="Fenêtre d'attribution (jours)" hint="Une commande passée X jours après le clic est attribuée si X ≤ fenêtre">
          <input type="number" step="1" min="1" max="90"
            value={form.attribution_window_days}
            onChange={(e) => set("attribution_window_days", Number(e.target.value))}
            className="input" />
        </Field>
        <Field label="Modèle d'attribution" hint="Répartition du crédit entre plusieurs touchpoints">
          <select value={form.attribution_model}
            onChange={(e) => set("attribution_model", e.target.value as EcomSettings["attribution_model"])}
            className="input">
            {Object.entries(ATTRIBUTION_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </Field>
      </Card>

      <Card title="Alertes">
        <Field label="Alertes activées" hint="Détection auto des campagnes problématiques">
          <select value={String(form.alerts_enabled)}
            onChange={(e) => set("alerts_enabled", e.target.value === "true")}
            className="input">
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </Field>
        <Field label="Seuil baisse (%)" hint="Variation ROAS 7j vs 7j précédents au-delà de laquelle une alerte est créée">
          <input type="number" step="1" min="0" max="100"
            value={form.alert_drop_threshold_percent}
            onChange={(e) => set("alert_drop_threshold_percent", Number(e.target.value))}
            className="input" disabled={!form.alerts_enabled} />
        </Field>
        <Field label="Dépense minimum pour alerte" hint="Les campagnes avec moins de spend sont ignorées (€)">
          <input type="number" step="5" min="0"
            value={(form.alert_min_spend_cents / 100).toFixed(2)}
            onChange={(e) => set("alert_min_spend_cents", Math.round(Number(e.target.value) * 100))}
            className="input" disabled={!form.alerts_enabled} />
        </Field>
      </Card>

      <Card title="Notifications email">
        <Field label="Digest activé" hint="Reçoit un résumé des performances par email">
          <select value={String(form.email_digest_enabled)}
            onChange={(e) => set("email_digest_enabled", e.target.value === "true")}
            className="input">
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </Field>
        <Field label="Fréquence">
          <select value={form.email_digest_frequency}
            onChange={(e) => set("email_digest_frequency", e.target.value as EcomSettings["email_digest_frequency"])}
            className="input" disabled={!form.email_digest_enabled}>
            {Object.entries(FREQUENCY_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </Field>
      </Card>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold rounded-md transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Enregistrer
        </button>
      </div>

      <style jsx>{`
        .input { width: 100%; padding: 0.5rem 0.625rem; border: 1px solid #E6E6E4; border-radius: 6px; font-size: 13px; color: #191919; background: #FFFFFF; transition: border-color 0.15s; }
        .input:focus { outline: none; border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1); }
        .input:disabled { background: #FBFBFA; cursor: not-allowed; color: #8A8A88; }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5 space-y-3">
      <h3 className="text-[13px] font-bold text-[#191919] border-b border-[#EFEFEF] pb-2 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_180px] gap-3 items-start py-1.5">
      <div>
        <label className="text-[12px] font-medium text-[#191919]">{label}</label>
        {hint && <p className="text-[11px] text-[#8A8A88] mt-0.5 leading-tight">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Insight({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5 px-2.5 py-2 bg-[#F0EEFF] border border-[#DDD6FE] rounded text-[11px] text-[#5B21B6]">
      <span className="mt-0.5">{icon}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
