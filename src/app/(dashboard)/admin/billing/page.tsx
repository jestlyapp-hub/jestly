"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminKpiCard from "@/components/admin/AdminKpiCard";
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Users,
  Lock,
  CheckCircle,
  Activity,
  CreditCard,
  AlertCircle,
  Zap,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface StripeMetrics {
  mrr: number;
  arr: number;
  active_subscriptions: number;
  trialing_subscriptions: number;
  past_due_subscriptions: number;
  canceled_subscriptions: number;
  arpu: number;
  trial_to_paid_rate: number | null;
}

interface StripeFailedPayment {
  id: string;
  customer: string;
  amount: number;
  created: number;
  attempt_count: number;
  customer_email: string | null;
}

interface BillingData {
  revenue: { total: number; this_week: number; this_month: number };
  orders_by_status: Record<string, number>;
  plan_distribution: Record<string, number>;
  billing_items_count: number;
  billing_items_total_ht: number;
  recent_paid_orders: {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    user_email: string;
  }[];
  stripe_connected: boolean;
  stripe_metrics: StripeMetrics | null;
  stripe_subscriptions_count: number;
  stripe_failed_payments: StripeFailedPayment[];
}

// ── Formatters ──────────────────────────────────────────────────
const fmtEur = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);

// Formate des centimes en EUR
const fmtCents = (cents: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtTimestamp = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ── Status colors ───────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  paid: "#16a34a",
  delivered: "#4F46E5",
  invoiced: "#ca8a04",
  new: "#8A8A88",
  in_progress: "#2563eb",
  cancelled: "#dc2626",
  refunded: "#9333ea",
};

// ── Stripe-locked metrics (affichées quand Stripe non connecté) ─
const STRIPE_LOCKED = [
  {
    name: "MRR / ARR",
    description:
      "Revenu mensuel et annuel récurrent. Nécessite des abonnements Stripe actifs pour calculer.",
  },
  {
    name: "Taux de churn",
    description:
      "Pourcentage de clients qui annulent leur abonnement chaque mois. Requiert les webhooks Stripe (customer.subscription.deleted).",
  },
  {
    name: "LTV (Lifetime Value)",
    description:
      "Valeur totale moyenne d'un client sur sa durée de vie. Nécessite l'historique de paiements Stripe.",
  },
  {
    name: "ARPU",
    description:
      "Revenu moyen par utilisateur. Requiert le lien entre profils Jestly et customers Stripe.",
  },
  {
    name: "Paiements échoués",
    description:
      "Taux d'échec de paiement et relances automatiques. Nécessite les webhooks invoice.payment_failed.",
  },
  {
    name: "Cycle de vie abonnements",
    description:
      "Trials, conversions, upgrades, downgrades. Nécessite Stripe Billing avec plans Pro/Free configurés.",
  },
];

// ── Component ───────────────────────────────────────────────────
export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Billing & Revenu" section="Billing" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <AdminKpiCard key={i} label="" value="" loading />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Billing & Revenu" section="Billing" />
        <p className="text-sm text-[#8A8A88] p-8">
          Erreur de chargement des données billing.
        </p>
      </div>
    );
  }

  const totalOrders = Object.values(data.orders_by_status).reduce((a, b) => a + b, 0);
  const sm = data.stripe_metrics;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Billing & Revenu"
        section="Billing"
        description="Métriques financières et suivi des revenus"
      />

      {/* ── Stripe status banner ──────────────────────────────── */}
      {data.stripe_connected ? (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle
            size={18}
            strokeWidth={1.7}
            className="text-green-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[13px] font-semibold text-green-800">
              Stripe connecté
            </p>
            <p className="text-[12px] text-green-700 mt-0.5 leading-relaxed">
              Billing intelligence actif — MRR, ARR, ARPU et suivi des
              abonnements en temps réel.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle
            size={18}
            strokeWidth={1.7}
            className="text-amber-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[13px] font-semibold text-amber-800">
              Stripe n&apos;est pas encore connecté
            </p>
            <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
              Ajoutez <code className="font-mono bg-amber-100 px-1 rounded">STRIPE_SECRET_KEY</code> et{" "}
              <code className="font-mono bg-amber-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> dans
              vos variables d&apos;environnement pour activer le billing intelligence.
            </p>
          </div>
        </div>
      )}

      {/* ── Stripe KPI Row (si connecté) ──────────────────────── */}
      {data.stripe_connected && sm && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            label="MRR"
            value={fmtCents(sm.mrr)}
            icon={<Zap size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="ARR"
            value={fmtCents(sm.arr)}
            icon={<TrendingUp size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="ARPU"
            value={fmtCents(sm.arpu)}
            icon={<DollarSign size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="Abonnements actifs"
            value={String(sm.active_subscriptions)}
            icon={<Activity size={16} strokeWidth={1.7} />}
          />
        </div>
      )}

      {/* ── Stripe subscriptions breakdown (si connecté) ──────── */}
      {data.stripe_connected && sm && (
        <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
          <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
            Abonnements Stripe
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#191919]">Actifs</span>
              <span className="text-[13px] font-bold text-[#191919]">{sm.active_subscriptions}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]">
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#191919]">En trial</span>
              <span className="text-[13px] font-bold text-[#191919]">{sm.trialing_subscriptions}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#191919]">Past due</span>
              <span className="text-[13px] font-bold text-[#191919]">{sm.past_due_subscriptions}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#191919]">Annulés</span>
              <span className="text-[13px] font-bold text-[#191919]">{sm.canceled_subscriptions}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#EFEFEF] text-[13px] text-[#8A8A88]">
            Total abonnements Stripe : <span className="font-semibold text-[#191919]">{data.stripe_subscriptions_count}</span>
          </div>
        </div>
      )}

      {/* ── Failed payments table (si connecté + données) ─────── */}
      {data.stripe_connected && data.stripe_failed_payments.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} strokeWidth={1.7} className="text-red-500" />
            <h3 className="text-[14px] font-semibold text-[#191919]">
              Paiements échoués (30 derniers jours)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Email</th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Montant</th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">Tentatives</th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.stripe_failed_payments.map((fp) => (
                  <tr key={fp.id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="py-2 pr-3 text-[#191919] max-w-[200px] truncate">
                      {fp.customer_email || "—"}
                    </td>
                    <td className="py-2 pr-3 font-medium text-red-600 whitespace-nowrap">
                      {fmtCents(fp.amount)}
                    </td>
                    <td className="py-2 pr-3 text-[#5A5A58]">{fp.attempt_count}</td>
                    <td className="py-2 text-[#8A8A88] whitespace-nowrap">
                      {fmtTimestamp(fp.created)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KPI Row (données commandes) ───────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminKpiCard
          label="Revenu total"
          value={fmtEur(data.revenue.total)}
          icon={<DollarSign size={16} strokeWidth={1.7} />}
        />
        <AdminKpiCard
          label="Revenu cette semaine"
          value={fmtEur(data.revenue.this_week)}
          icon={<TrendingUp size={16} strokeWidth={1.7} />}
        />
        <AdminKpiCard
          label="Revenu ce mois"
          value={fmtEur(data.revenue.this_month)}
          icon={<CalendarDays size={16} strokeWidth={1.7} />}
        />
        <AdminKpiCard
          label="Répartition plans"
          value={`${data.plan_distribution.free || 0} Free / ${data.plan_distribution.pro || 0} Pro`}
          icon={<Users size={16} strokeWidth={1.7} />}
        />
      </div>

      {/* ── Orders by status ──────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
          Commandes par statut
        </h3>
        {totalOrders === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucune commande</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.orders_by_status).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-[#EFEFEF] bg-[#FBFBFA]"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: STATUS_COLORS[status] || "#8A8A88",
                  }}
                />
                <span className="text-[13px] font-medium text-[#191919]">
                  {status}
                </span>
                <span className="text-[13px] font-bold text-[#191919]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Billing items summary */}
        <div className="mt-4 pt-4 border-t border-[#EFEFEF] flex items-center gap-6 text-[13px]">
          <span className="text-[#8A8A88]">
            Lignes facturables :{" "}
            <span className="font-semibold text-[#191919]">
              {data.billing_items_count}
            </span>
          </span>
          <span className="text-[#8A8A88]">
            Total HT :{" "}
            <span className="font-semibold text-[#191919]">
              {fmtEur(data.billing_items_total_ht)}
            </span>
          </span>
        </div>
      </div>

      {/* ── Recent paid orders ────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
          Dernières commandes payées
        </h3>
        {data.recent_paid_orders.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">
            Aucune commande payée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#E6E6E4]">
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Montant
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Statut
                  </th>
                  <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                    Utilisateur
                  </th>
                  <th className="text-left py-2 text-[#8A8A88] font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recent_paid_orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]"
                  >
                    <td className="py-2 pr-3 font-medium text-[#191919] whitespace-nowrap">
                      {fmtEur(o.amount)}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className="inline-block px-2 py-0.5 text-[11px] rounded-md font-medium"
                        style={{
                          color: STATUS_COLORS[o.status] || "#8A8A88",
                          backgroundColor:
                            (STATUS_COLORS[o.status] || "#8A8A88") + "12",
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-[#5A5A58] max-w-[200px] truncate">
                      {o.user_email}
                    </td>
                    <td className="py-2 text-[#8A8A88] whitespace-nowrap">
                      {fmtDate(o.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Stripe-locked section (seulement si non connecté) ── */}
      {!data.stripe_connected && (
        <div>
          <h3 className="text-[14px] font-semibold text-[#191919] mb-3">
            Non disponible
          </h3>
          <p className="text-[12px] text-[#8A8A88] mb-4">
            Ces métriques nécessitent une intégration Stripe active.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STRIPE_LOCKED.map((m) => (
              <div
                key={m.name}
                className="bg-white rounded-lg border border-[#E6E6E4] p-5 opacity-70"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={14} strokeWidth={1.7} className="text-[#ACACAA]" />
                  <span className="text-[13px] font-semibold text-[#191919]">
                    {m.name}
                  </span>
                </div>
                <p className="text-[11px] text-[#4F46E5] font-medium mb-1.5">
                  Requiert intégration Stripe
                </p>
                <p className="text-[12px] text-[#8A8A88] leading-relaxed">
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
