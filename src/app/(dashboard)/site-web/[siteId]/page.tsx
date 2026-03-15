"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { useSite } from "@/lib/hooks/use-site";
import { useApi } from "@/lib/hooks/use-api";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───
interface DashboardMetric {
  value: number;
  previousValue: number;
}

interface DashboardData {
  visits: DashboardMetric;
  conversion: DashboardMetric;
  avgBasket: DashboardMetric;
  ctaClickRate: DashboardMetric;
  recentOrders: any[];
  totalRevenue: number;
  totalOrders: number;
  totalLeads: number;
  lastPublishedAt: string | null;
}

// ─── Helpers ───
function formatDelta(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) return { text: current > 0 ? "+100%" : "", positive: true };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { text: "", positive: true };
  return { text: `${pct > 0 ? "+" : ""}${pct.toFixed(0)}%`, positive: pct >= 0 };
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

// ─── Stat Card ───
function DashStat({ label, value, unit, delta }: {
  label: string;
  value: string;
  unit?: string;
  delta?: { text: string; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4] p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all">
      <div className="text-[12px] font-medium text-[#8A8A88] uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
        {unit && <span className="text-[13px] text-[#8A8A88]">{unit}</span>}
      </div>
      {delta?.text && (
        <div className={`text-[12px] font-medium mt-1.5 ${delta.positive ? "text-emerald-500" : "text-red-500"}`}>
          {delta.text} vs période précédente
        </div>
      )}
    </div>
  );
}

// ─── Component ───
export default function SiteWebDashboard() {
  const { siteId } = useParams<{ siteId: string }>();
  const { site, loading: siteLoading } = useSite();
  const { data: dashboard, loading: statsLoading } = useApi<DashboardData>(`/api/sites/${siteId}/dashboard?range=30d`);

  const [maintenance, setMaintenance] = useState(site.settings.maintenanceMode);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const subdomain = site.domain.subdomain;
  const hasSubdomain = !!subdomain;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";
  const siteUrl = hasSubdomain ? `${baseDomain}/s/${subdomain}` : "";
  const fullUrl = hasSubdomain ? `https://${siteUrl}` : "";

  const siteStatus = maintenance ? "maintenance" : "published";

  const recentOrders = dashboard?.recentOrders || [];

  const toggleMaintenance = useCallback(async () => {
    const newValue = !maintenance;
    setMaintenance(newValue);
    setSavingMaintenance(true);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: { ...site.settings, maintenanceMode: newValue } }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setMaintenance(!newValue);
    } finally {
      setSavingMaintenance(false);
    }
  }, [maintenance, siteId, site.settings]);

  const handleCopy = () => {
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visits = dashboard?.visits || { value: 0, previousValue: 0 };
  const conversion = dashboard?.conversion || { value: 0, previousValue: 0 };
  const avgBasket = dashboard?.avgBasket || { value: 0, previousValue: 0 };
  const ctaRate = dashboard?.ctaClickRate || { value: 0, previousValue: 0 };

  return (
    <div className="max-w-6xl mx-auto">

      {/* ─── TOP BAR ─── */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] p-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            {siteLoading && !hasSubdomain ? (
              <div className="h-4 bg-[#F7F7F5] rounded w-48 animate-pulse" />
            ) : hasSubdomain ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[14px] font-medium text-[#1A1A1A] truncate">{siteUrl}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  siteStatus === "maintenance"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}>
                  {siteStatus === "maintenance" ? "Maintenance" : "En ligne"}
                </span>
              </div>
            ) : (
              <Link href={`/site-web/${siteId}/domaine`} className="text-[14px] font-medium text-[#4F46E5] hover:underline">
                Configurer le domaine
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {dashboard?.lastPublishedAt && (
              <span className="text-[11px] text-[#8A8A88] hidden sm:block">
                Publié le {new Date(dashboard.lastPublishedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
            {hasSubdomain && (
              <>
                <button onClick={handleCopy} className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors">
                  {copied ? "Copié !" : "Copier"}
                </button>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-white bg-[#4F46E5] px-3 py-1.5 rounded-lg hover:bg-[#4338CA] transition-colors flex items-center gap-1">
                  Ouvrir
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          [0, 1, 2, 3].map((i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
                <div className="h-3 w-16 bg-[#F7F7F5] rounded animate-pulse mb-3" />
                <div className="h-7 w-20 bg-[#F7F7F5] rounded animate-pulse" />
              </div>
            </motion.div>
          ))
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <DashStat label="Visites" value={visits.value.toLocaleString("fr-FR")} delta={formatDelta(visits.value, visits.previousValue)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <DashStat label="Conversion" value={`${conversion.value.toFixed(1)}%`} delta={formatDelta(conversion.value, conversion.previousValue)} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <DashStat label="Panier moyen" value={avgBasket.value > 0 ? formatPrice(avgBasket.value) : "—"} delta={avgBasket.value > 0 ? formatDelta(avgBasket.value, avgBasket.previousValue) : undefined} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <DashStat label="Taux clic CTA" value={`${ctaRate.value.toFixed(1)}%`} delta={formatDelta(ctaRate.value, ctaRate.previousValue)} />
            </motion.div>
          </>
        )}
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* LEFT — Site Preview */}
        <motion.div className="lg:col-span-2 bg-white rounded-xl border border-[#E6E6E4] overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="px-5 py-3.5 border-b border-[#E6E6E4] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Aperçu du site</h2>
            {hasSubdomain && (
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-[#4F46E5] hover:underline flex items-center gap-1">
                Ouvrir en grand
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            )}
          </div>
          <div className="bg-[#F7F7F5] rounded-b-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-[#E6E6E4]">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                <div className="w-2 h-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-[#F7F7F5] rounded px-3 py-1 text-[10px] text-[#999] text-center truncate">
                {hasSubdomain ? siteUrl : "jestly.fr/s/votre-site"}
              </div>
            </div>
            {/* Real iframe or fallback */}
            {hasSubdomain ? (
              <div className="relative h-[300px] overflow-hidden bg-white">
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#F7F7F5] z-10">
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-[#E6E6E4] border-t-[#4F46E5] rounded-full animate-spin mx-auto mb-2" />
                      <div className="text-[11px] text-[#8A8A88]">Chargement de l&apos;aperçu...</div>
                    </div>
                  </div>
                )}
                <iframe
                  src={fullUrl}
                  title="Aperçu du site"
                  className="w-[1280px] h-[800px] border-0 origin-top-left pointer-events-none"
                  style={{ transform: "scale(0.234375)" }}
                  onLoad={() => setIframeLoaded(true)}
                  loading="lazy"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#4F46E5]/5 to-transparent">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                </div>
                <div className="text-[14px] font-semibold text-[#1A1A1A]">{site.settings.name}</div>
                <div className="text-[12px] text-[#8A8A88] max-w-xs text-center">{site.settings.description || "Configurez un domaine pour voir l'aperçu."}</div>
                <Link href={`/site-web/${siteId}/domaine`} className="text-[12px] font-medium text-[#4F46E5] hover:underline mt-1">Configurer le domaine</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* RIGHT — Actions + Maintenance */}
        <motion.div className="space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}>
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
            <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Actions rapides</h3>
            <div className="space-y-1.5">
              {[
                { href: `/site-web/${siteId}/editor`, label: "Modifier le site", sub: "Ouvrir l'éditeur", icon: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
                { href: `/site-web/${siteId}/pages`, label: "Pages", sub: "Gérer les pages", icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" },
                { href: `/site-web/${siteId}/leads`, label: "Leads", sub: `${dashboard?.totalLeads ?? 0} contacts`, icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                { href: `/site-web/${siteId}/analytics`, label: "Analytics", sub: "Voir le détail", icon: "M18 20V10M12 20V4M6 20v-6" },
                { href: `/site-web/${siteId}/parametres`, label: "Paramètres", sub: "SEO, domaine, design", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4F46E5]/10 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={a.icon} /></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-[#1A1A1A] group-hover:text-[#4F46E5] transition-colors">{a.label}</div>
                    <div className="text-[10px] text-[#8A8A88]">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Maintenance */}
          <div className={`rounded-xl border p-5 transition-colors ${maintenance ? "bg-amber-50/50 border-amber-200" : "bg-white border-[#E6E6E4]"}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                  Mode maintenance
                  {savingMaintenance && <span className="text-[10px] font-normal text-[#8A8A88]">Sauvegarde...</span>}
                </div>
                <div className="text-[11px] text-[#8A8A88] mt-0.5">{maintenance ? "Page de maintenance affichée" : "Site accessible au public"}</div>
              </div>
              <button
                onClick={toggleMaintenance}
                disabled={savingMaintenance}
                className={`relative w-10 h-5 rounded-full transition-colors ${maintenance ? "bg-amber-500" : "bg-[#D1D1D0]"} ${savingMaintenance ? "opacity-60" : ""}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${maintenance ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Revenue Summary */}
          {dashboard && (dashboard.totalRevenue > 0 || dashboard.totalOrders > 0) && (
            <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
              <div className="text-[11px] font-medium text-[#8A8A88] uppercase tracking-wider mb-2">Ce mois</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[18px] font-bold text-[#1A1A1A]">{formatPrice(dashboard.totalRevenue)}</div>
                  <div className="text-[10px] text-[#8A8A88]">Revenus</div>
                </div>
                <div>
                  <div className="text-[18px] font-bold text-[#1A1A1A]">{dashboard.totalOrders}</div>
                  <div className="text-[10px] text-[#8A8A88]">Commandes</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── RECENT ORDERS ─── */}
      <motion.div className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden mb-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
        <div className="px-5 py-3.5 border-b border-[#E6E6E4] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Commandes récentes</h2>
          <Link href="/commandes" className="text-[12px] font-medium text-[#4F46E5] hover:underline">Tout voir</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Client", "Produit", "Montant", "Statut", "Date"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-[#1A1A1A]">{o.client_name || "—"}</td>
                  <td className="px-5 py-3 text-[13px] text-[#5A5A58]">{o.product_name || "—"}</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-[#1A1A1A]">{o.amount ? `${o.amount} €` : "—"}</td>
                  <td className="px-5 py-3"><BadgeStatus status={o.status || "new"} /></td>
                  <td className="px-5 py-3 text-[12px] text-[#8A8A88]">{o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "—"}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <div className="text-[13px] text-[#BBB]">Aucune commande pour le moment</div>
                    <div className="text-[11px] text-[#D1D1D0] mt-1">Les commandes apparaîtront ici automatiquement</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
