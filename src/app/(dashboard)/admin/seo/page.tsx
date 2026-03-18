"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminKpiCard from "@/components/admin/AdminKpiCard";
import {
  Globe,
  FileText,
  BarChart3,
  Lock,
  Search,
  Bug,
  Gauge,
  Target,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────
interface SeoData {
  published_sites: number;
  total_sites: number;
  published_pages: number;
  total_analytics_events: number;
}

// ── Locked integrations ─────────────────────────────────────────
const LOCKED_INTEGRATIONS = [
  {
    name: "Google Search Console",
    icon: <Search size={16} strokeWidth={1.7} />,
    metrics: "Impressions, clics, CTR, positions moyennes",
    description:
      "Connecter l'API Google Search Console pour voir les performances de recherche organique. Nécessite une vérification de propriété du domaine jestly.fr dans GSC.",
  },
  {
    name: "Données de crawl",
    icon: <Bug size={16} strokeWidth={1.7} />,
    metrics: "Pages indexées, erreurs 404, coverage",
    description:
      "Pas de système de crawl interne. Nécessite soit Google Search Console (rapport Coverage), soit un outil tiers (Screaming Frog, Sitebulb) pour auditer l'indexation.",
  },
  {
    name: "Lighthouse / Core Web Vitals",
    icon: <Gauge size={16} strokeWidth={1.7} />,
    metrics: "LCP, FID, CLS, Performance score",
    description:
      "Pas de collecte automatique des Core Web Vitals. Nécessite l'API PageSpeed Insights ou le CrUX API pour monitorer les performances en continu.",
  },
  {
    name: "Suivi de positionnement",
    icon: <Target size={16} strokeWidth={1.7} />,
    metrics: "Positions par mot-clé dans le temps",
    description:
      "Pas de rank tracker intégré. Nécessite un outil tiers (SEMrush, Ahrefs, SERPapi) pour suivre les positions de mots-clés sur la durée.",
  },
];

// ── Component ───────────────────────────────────────────────────
export default function AdminSeoPage() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo")
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
        <AdminHeader title="SEO & Acquisition" section="SEO" />
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
        <AdminHeader title="SEO & Acquisition" section="SEO" />
        <p className="text-sm text-[#8A8A88] p-8">
          Erreur de chargement des données SEO.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="SEO & Acquisition"
        section="SEO"
        description="Données disponibles et intégrations manquantes"
      />

      {/* ── Available data ────────────────────────────────────── */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#191919] mb-3">
          Données disponibles
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKpiCard
            label="Sites publiés"
            value={data.published_sites}
            icon={<Globe size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="Pages publiées"
            value={data.published_pages}
            icon={<FileText size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="Événements analytics"
            value={data.total_analytics_events}
            icon={<BarChart3 size={16} strokeWidth={1.7} />}
          />
          <AdminKpiCard
            label="Sites total"
            value={data.total_sites}
            icon={<Globe size={16} strokeWidth={1.7} />}
          />
        </div>
      </div>

      {/* ── Locked integrations ───────────────────────────────── */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#191919] mb-3">
          Intégrations non connectées
        </h3>
        <p className="text-[12px] text-[#8A8A88] mb-4">
          Ces métriques SEO nécessitent des intégrations externes qui ne sont pas
          encore configurées.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {LOCKED_INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-lg border border-[#E6E6E4] p-5 opacity-70"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#F7F7F5] flex items-center justify-center text-[#ACACAA]">
                  {item.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#191919]">
                    {item.name}
                  </span>
                  <Lock size={12} strokeWidth={1.7} className="text-[#ACACAA]" />
                </div>
              </div>
              <p className="text-[12px] font-medium text-[#4F46E5] mb-1">
                {item.metrics}
              </p>
              <p className="text-[12px] text-[#8A8A88] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
