"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminKpiCard from "@/components/admin/AdminKpiCard";
import { Package, Users, Zap, Lock } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface FeatureItem {
  key: string;
  label: string;
  count: number;
}

interface AdoptionItem {
  key: string;
  label: string;
  users: number;
  pct: number;
}

interface ProductData {
  total_users: number;
  feature_usage: FeatureItem[];
  feature_adoption: AdoptionItem[];
  activation: {
    activated: number;
    total: number;
    pct: number;
  };
}

// ── Not-tracked metrics ─────────────────────────────────────────
const NOT_TRACKED = [
  {
    name: "DAU / WAU / MAU",
    description:
      "Pas de tracking de sessions utilisateur. Nécessite un système d'analytics de sessions (Mixpanel, PostHog, ou custom events avec timestamps de connexion).",
  },
  {
    name: "Feature usage events",
    description:
      "Pas de tracking d'actions dans le dashboard. Nécessite l'instrumentation d'événements (clics, navigation, temps passé) avec un outil d'analytics produit.",
  },
  {
    name: "Retention cohorts",
    description:
      "Pas de données de rétention par cohorte. Nécessite un tracking de sessions par semaine/mois pour calculer les courbes de rétention.",
  },
  {
    name: "Time to value",
    description:
      "Pas de mesure du temps entre l'inscription et la première action significative. Nécessite le tracking des événements d'activation.",
  },
];

// ── Component ───────────────────────────────────────────────────
export default function AdminProductPage() {
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/product")
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
        <AdminHeader title="Produit & Usage" section="Produit" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminKpiCard key={i} label="" value="" loading />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Produit & Usage" section="Produit" />
        <p className="text-sm text-[#8A8A88] p-8">
          Erreur de chargement des données produit.
        </p>
      </div>
    );
  }

  // Sort adoption by % desc for top features
  const sortedAdoption = [...data.feature_adoption].sort(
    (a, b) => b.pct - a.pct,
  );

  // Sort usage by count desc
  const sortedUsage = [...data.feature_usage].sort(
    (a, b) => b.count - a.count,
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Produit & Usage"
        section="Produit"
        description="Adoption des fonctionnalités et activation utilisateurs"
      />

      {/* ── Hero KPIs ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminKpiCard
          label="Utilisateurs total"
          value={data.total_users}
          icon={<Users size={16} strokeWidth={1.7} />}
        />
        <AdminKpiCard
          label="Utilisateurs activés"
          value={`${data.activation.activated} (${data.activation.pct}%)`}
          icon={<Zap size={16} strokeWidth={1.7} />}
        />
        <AdminKpiCard
          label="Features trackées"
          value={data.feature_usage.length}
          icon={<Package size={16} strokeWidth={1.7} />}
        />
      </div>

      {/* ── Activation funnel ─────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-1">
          Funnel d&apos;activation
        </h3>
        <p className="text-[12px] text-[#8A8A88] mb-4">
          Activé = au moins (1 client + 1 produit + 1 commande) ou 1 site
        </p>
        <div className="max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-[#5A5A58]">
              Inscrits
            </span>
            <span className="text-[13px] font-semibold text-[#191919]">
              {data.activation.total}
            </span>
          </div>
          <div className="h-3 bg-[#F7F7F5] rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-[#4F46E5]"
              style={{ width: "100%" }}
            />
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-[#5A5A58]">
              Activés
            </span>
            <span className="text-[13px] font-semibold text-[#191919]">
              {data.activation.activated}{" "}
              <span className="text-[11px] text-[#8A8A88] font-normal">
                ({data.activation.pct}%)
              </span>
            </span>
          </div>
          <div className="h-3 bg-[#F7F7F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#16a34a] transition-all duration-500"
              style={{
                width: `${data.activation.pct}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Feature adoption grid ─────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
          Adoption par fonctionnalité
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E6E6E4]">
                <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                  Fonctionnalité
                </th>
                <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                  Utilisateurs
                </th>
                <th className="text-left py-2 pr-3 text-[#8A8A88] font-medium">
                  % du total
                </th>
                <th className="text-left py-2 text-[#8A8A88] font-medium w-1/3">
                  Adoption
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAdoption.map((item) => (
                <tr
                  key={item.key}
                  className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]"
                >
                  <td className="py-2.5 pr-3 text-[#191919] font-medium">
                    {item.label}
                  </td>
                  <td className="py-2.5 pr-3 text-[#5A5A58]">
                    {item.users}
                  </td>
                  <td className="py-2.5 pr-3 text-[#5A5A58]">
                    {item.pct}%
                  </td>
                  <td className="py-2.5">
                    <div className="h-2 bg-[#F7F7F5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                        style={{ width: `${Math.max(item.pct, 2)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top features by usage ─────────────────────────────── */}
      <div className="bg-white rounded-lg border border-[#E6E6E4] p-5">
        <h3 className="text-[14px] font-semibold text-[#191919] mb-4">
          Top fonctionnalités par usage (total d&apos;entités)
        </h3>
        {sortedUsage.length === 0 ? (
          <p className="text-[13px] text-[#8A8A88]">Aucune donnée</p>
        ) : (
          <div className="space-y-3">
            {sortedUsage.map((item, i) => {
              const maxCount = sortedUsage[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-[#191919] font-medium">
                        {item.label}
                      </span>
                      <span className="text-[13px] font-semibold text-[#4F46E5]">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F7F7F5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Not tracked section ───────────────────────────────── */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#191919] mb-3">
          Non instrumenté
        </h3>
        <p className="text-[12px] text-[#8A8A88] mb-4">
          Ces métriques produit ne sont pas encore collectées.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NOT_TRACKED.map((m) => (
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
              <p className="text-[12px] text-[#8A8A88] leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
