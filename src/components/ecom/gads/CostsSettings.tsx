"use client";

/**
 * Réglages → Coûts (refonte ECOM : ex-page Réglages coûts, fusionnée ici).
 * COGS versionnés par produit (marge brute live pendant la saisie), frais par
 * commande, dépenses récurrentes, et objectifs mensuels (jauge du Dashboard).
 */
import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2, Check, Target } from "lucide-react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { useAnalyticsInvalidation } from "@/lib/hooks/use-analytics-invalidation";
import { formatCurrency } from "@/lib/ads/formatters";
import type { EcomSettings } from "@/lib/ads/types";

const INPUT_CLS = "px-2.5 py-1.5 text-[12px] bg-[#F7F7F5] border border-[#E5E3F0] rounded-md focus:outline-none focus:border-[#7C3AED] text-[#1a1535] tabular-nums";

interface ProductRow {
  shopify_product_id: string;
  title: string;
  image_url: string | null;
  status: string | null;
  price_cents: number | null;
  unit_cost_cents: number | null;
}

interface ExpenseRow {
  id: string;
  label: string;
  amount_cents: number;
  period: "monthly" | "yearly";
  starts_on: string;
  ends_on: string | null;
}

const parseEuros = (raw: string): number | null => {
  const v = parseFloat(raw.replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
};

export default function CostsSettings() {
  return (
    <div className="space-y-4">
      <ProductCostsSection />
      <OrderFeesSection />
      <ExpensesSection />
      <GoalsSection />
    </div>
  );
}

// ── COGS par produit (marge brute live) ──────────────────────────
function ProductCostsSection() {
  const api = useApi<{ products: ProductRow[] }>("/api/ecom/costs/products");
  const products = api.data?.products ?? [];

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#1a1535] mb-1">Coût d&apos;achat par produit (COGS)</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">
        Versionné : modifier un coût crée une nouvelle version à partir d&apos;aujourd&apos;hui — les commandes passées gardent la leur.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
              <th className="px-3 py-2 font-medium">Produit</th>
              <th className="px-3 py-2 font-medium text-right">Prix de vente</th>
              <th className="px-3 py-2 font-medium text-right">Coût d&apos;achat</th>
              <th className="px-3 py-2 font-medium text-right">Marge brute</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductCostRow key={p.shopify_product_id} product={p} onSaved={() => void api.mutate()} />
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-[#8A8A88]">
                {api.loading ? "Chargement…" : "Aucun produit Shopify synchronisé."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductCostRow({ product: p, onSaved }: { product: ProductRow; onSaved: () => void }) {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const [raw, setRaw] = useState(p.unit_cost_cents != null ? (p.unit_cost_cents / 100).toString().replace(".", ",") : "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const costCents = parseEuros(raw);
  // Marge brute calculée EN LIVE pendant la saisie.
  const margin = useMemo(() => {
    if (p.price_cents == null || costCents == null || raw === "") return null;
    const cents = p.price_cents - costCents;
    const pct = p.price_cents > 0 ? (cents / p.price_cents) * 100 : null;
    return { cents, pct };
  }, [p.price_cents, costCents, raw]);

  const dirty = costCents != null && costCents !== (p.unit_cost_cents ?? -1);

  const save = async () => {
    if (costCents == null) return;
    setBusy(true);
    try {
      await apiFetch(`/api/ecom/costs/products/${p.shopify_product_id}`, {
        method: "PUT",
        body: { unit_cost_cents: costCents },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
      await invalidateAnalytics();
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
      <td className="px-3 py-2">
        <div className="flex items-center gap-2.5 min-w-[220px]">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- CDN Shopify
            <img src={p.image_url} alt="" width={32} height={32} className="w-8 h-8 rounded-md object-cover border border-[#EFEFEF]" />
          ) : (
            <span className="w-8 h-8 rounded-md bg-[#F7F7F5] border border-[#EFEFEF]" />
          )}
          <span className="font-medium text-[#1a1535] line-clamp-2">{p.title}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-[#5A5A58]">
        {p.price_cents != null ? formatCurrency(p.price_cents) : "—"}
      </td>
      <td className="px-3 py-2 text-right">
        <div className="inline-flex items-center gap-1">
          <input type="text" inputMode="decimal" placeholder="0,00" value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && dirty) void save(); }}
            className={`${INPUT_CLS} w-24 text-right`} />
          <span className="text-[#8A8A88]">€</span>
        </div>
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {margin == null ? (
          <span className="text-[#B4B4B2]">—</span>
        ) : (
          <span className={margin.cents >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
            {formatCurrency(margin.cents)}
            {margin.pct != null && <span className="text-[10px] font-normal text-[#8A8A88]"> · {margin.pct.toFixed(0)} %</span>}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right w-20">
        {dirty && (
          <button onClick={() => void save()} disabled={busy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-60">
            {busy ? <Loader2 size={11} className="animate-spin" /> : null} OK
          </button>
        )}
        {!dirty && saved && <Check size={14} className="text-emerald-600 inline" />}
      </td>
    </tr>
  );
}

// ── Frais par commande ───────────────────────────────────────────
function OrderFeesSection() {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const api = useApi<{ settings: EcomSettings }>("/api/ecom/settings");
  const s = api.data?.settings;
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = values ?? {
    shipping: s ? (s.shipping_cost_cents / 100).toString().replace(".", ",") : "",
    fee_pct: s ? String(s.payment_fee_percent).replace(".", ",") : "",
    fee_fixed: s ? (s.payment_fee_fixed_cents / 100).toString().replace(".", ",") : "",
    packaging: s ? (s.packaging_cost_cents / 100).toString().replace(".", ",") : "",
  };
  const set = (k: string, v: string) => setValues({ ...current, [k]: v });

  const save = async () => {
    const shipping = parseEuros(current.shipping || "0");
    const feeFixed = parseEuros(current.fee_fixed || "0");
    const packaging = parseEuros(current.packaging || "0");
    const feePct = parseFloat((current.fee_pct || "0").replace(",", "."));
    if (shipping == null || feeFixed == null || packaging == null || !Number.isFinite(feePct) || feePct < 0) return;
    setBusy(true);
    try {
      await apiFetch("/api/ecom/settings", {
        method: "PATCH",
        body: {
          shipping_cost_cents: shipping,
          payment_fee_percent: Math.round(feePct * 100) / 100,
          payment_fee_fixed_cents: feeFixed,
          packaging_cost_cents: packaging,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await api.mutate();
      setValues(null);
      await invalidateAnalytics();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#1a1535] mb-1">Frais par commande</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">
        Coûts variables comptés dans le BE-ROAS et le Net Profit (expédition moyenne, frais de paiement, emballage).
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Expédition moyenne (€)" value={current.shipping} onChange={(v) => set("shipping", v)} placeholder="4,90" />
        <Field label="Frais de paiement (%)" value={current.fee_pct} onChange={(v) => set("fee_pct", v)} placeholder="2,9" />
        <Field label="Frais de paiement fixes (€)" value={current.fee_fixed} onChange={(v) => set("fee_fixed", v)} placeholder="0,30" />
        <Field label="Emballage (€)" value={current.packaging} onChange={(v) => set("packaging", v)} placeholder="0,80" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => void save()} disabled={busy || values == null}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50">
          {busy && <Loader2 size={12} className="animate-spin" />} Enregistrer les frais
        </button>
        {saved && <span className="text-[11px] text-emerald-700 inline-flex items-center gap-1"><Check size={12} /> Enregistré</span>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">{label}</span>
      <input type="text" inputMode="decimal" value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={`${INPUT_CLS} w-full`} />
    </label>
  );
}

// ── Dépenses récurrentes ─────────────────────────────────────────
function ExpensesSection() {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const api = useApi<{ expenses: ExpenseRow[] }>("/api/ecom/costs/expenses");
  const expenses = api.data?.expenses ?? [];
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const cents = parseEuros(amount);
    if (label.trim().length < 2 || cents == null) return;
    setBusy(true);
    try {
      await apiFetch("/api/ecom/costs/expenses", {
        method: "POST",
        body: { label: label.trim(), amount_cents: cents, period },
      });
      setLabel("");
      setAmount("");
      await api.mutate();
      await invalidateAnalytics();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/ecom/costs/expenses/${id}`, { method: "DELETE" });
    await api.mutate();
    await invalidateAnalytics();
  };

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#1a1535] mb-1">Dépenses récurrentes</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">
        Abonnements et outils — déduits du Net Profit au prorata de la période analysée. N&apos;entrent jamais dans le BE-ROAS.
      </p>
      <div className="flex flex-wrap items-end gap-2 mb-4">
        <label className="block flex-1 min-w-[160px]">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Libellé</span>
          <input type="text" value={label} placeholder="Ex. Shopify, Klaviyo…" onChange={(e) => setLabel(e.target.value)} className={`${INPUT_CLS} w-full`} />
        </label>
        <label className="block w-28">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Montant (€)</span>
          <input type="text" inputMode="decimal" value={amount} placeholder="29,00" onChange={(e) => setAmount(e.target.value)} className={`${INPUT_CLS} w-full text-right`} />
        </label>
        <label className="block">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Récurrence</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly")} className={INPUT_CLS}>
            <option value="monthly">Mensuelle</option>
            <option value="yearly">Annuelle</option>
          </select>
        </label>
        <button onClick={() => void add()} disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-60">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />} Ajouter
        </button>
      </div>
      {expenses.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88]">Aucune dépense récurrente enregistrée.</p>
      ) : (
        <ul className="divide-y divide-[#EFEFEF]">
          {expenses.map((e) => (
            <li key={e.id} className="py-2 flex items-center gap-3 text-[12px]">
              <span className="font-medium text-[#1a1535] flex-1">{e.label}</span>
              <span className="tabular-nums text-[#1a1535]">{formatCurrency(e.amount_cents)}</span>
              <span className="text-[#8A8A88]">{e.period === "monthly" ? "/ mois" : "/ an"}</span>
              {e.ends_on && <span className="text-[10px] text-[#8A8A88]">jusqu&apos;au {e.ends_on}</span>}
              <button onClick={() => void remove(e.id)} className="text-[#8A8A88] hover:text-rose-600" aria-label="Supprimer">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Objectifs mensuels (jauge du Dashboard) ──────────────────────
function GoalsSection() {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const api = useApi<{ settings: EcomSettings }>("/api/ecom/settings");
  const s = api.data?.settings;
  const [values, setValues] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = values ?? {
    revenue: s && s.monthly_revenue_goal_cents > 0 ? (s.monthly_revenue_goal_cents / 100).toString().replace(".", ",") : "",
    profit: s && s.monthly_net_profit_goal_cents > 0 ? (s.monthly_net_profit_goal_cents / 100).toString().replace(".", ",") : "",
  };
  const set = (k: string, v: string) => setValues({ ...current, [k]: v });

  const save = async () => {
    const revenue = current.revenue.trim() === "" ? 0 : parseEuros(current.revenue);
    const profit = current.profit.trim() === "" ? 0 : parseEuros(current.profit);
    if (revenue == null || profit == null) return;
    setBusy(true);
    try {
      await apiFetch("/api/ecom/settings", {
        method: "PATCH",
        body: { monthly_revenue_goal_cents: revenue, monthly_net_profit_goal_cents: profit },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await api.mutate();
      setValues(null);
      await invalidateAnalytics();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Target size={14} className="text-[#7C3AED]" />
        <h3 className="text-[14px] font-bold text-[#1a1535]">Objectif mensuel</h3>
      </div>
      <p className="text-[11px] text-[#8A8A88] mb-4">
        La jauge du Dashboard compare le réalisé au prorata du mois écoulé. Laisser vide = pas d&apos;objectif.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-md">
        <Field label="Objectif de CA (€ / mois)" value={current.revenue} onChange={(v) => set("revenue", v)} placeholder="5 000" />
        <Field label="Objectif de Net Profit (€ / mois)" value={current.profit} onChange={(v) => set("profit", v)} placeholder="1 500" />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => void save()} disabled={busy || values == null}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50">
          {busy && <Loader2 size={12} className="animate-spin" />} Enregistrer les objectifs
        </button>
        {saved && <span className="text-[11px] text-emerald-700 inline-flex items-center gap-1"><Check size={12} /> Enregistré</span>}
      </div>
    </div>
  );
}
