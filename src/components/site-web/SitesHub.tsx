"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  isSitePublished,
  canOpenPublicSite,
  getSitePublicUrl,
  getSiteDisplayUrl,
  getSitePreviewUrl,
  getSiteEditorUrl,
  type SiteUrlInput,
} from "@/lib/site-url-helpers";

/* ── Types ── */

interface SiteThemeData {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  surfaceColor?: string;
  mode?: "light" | "dark";
}

interface SiteNavData {
  links?: { label: string }[];
  ctaLabel?: string;
  showCta?: boolean;
}

interface SiteSummary {
  id: string;
  slug: string;
  name: string;
  status: "draft" | "published";
  theme: SiteThemeData | null;
  settings: { name?: string; maintenanceMode?: boolean; logoUrl?: string } | null;
  seo: { ogImageUrl?: string } | null;
  nav: SiteNavData | null;
  custom_domain: string | null;
  pages_count: number;
  created_at: string;
  updated_at: string;
}

/* ── Helpers ── */

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

/* ── Live Preview — vrai rendu iframe du site (publié uniquement) ── */

function SitePreview({ site }: { site: SiteSummary }) {
  const previewUrl = getSitePreviewUrl(site);
  const [loaded, setLoaded] = useState(false);
  const bg = site.theme?.backgroundColor || "#0F0F10";

  // Brouillon : pas de preview iframe, fallback visuel
  if (!previewUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: "#F7F7F5" }}>
        <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <span className="text-[10px] text-[#8A8A88] font-medium">Publiez pour voir l&apos;aperçu</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ background: bg }}>
      <iframe
        src={previewUrl}
        title={`Aperçu de ${site.name}`}
        loading="lazy"
        tabIndex={-1}
        onLoad={() => setLoaded(true)}
        className="absolute top-0 left-0 pointer-events-none border-none"
        style={{
          width: "1280px",
          height: "800px",
          transform: "scale(0.28)",
          transformOrigin: "top left",
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: bg }}>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/* ── Status Badge ── */

function StatusBadge({ status, maintenance }: { status: string; maintenance?: boolean }) {
  if (maintenance) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Maintenance
      </span>
    );
  }
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        En ligne
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#8A8A88] bg-[#F0F0EE] px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C0C0BE]" />
      Brouillon
    </span>
  );
}

/* ── Site Card ── */

function SiteCard({ site }: { site: SiteSummary }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const published = isSitePublished(site);
  const publicUrl = getSitePublicUrl(site);
  const displayUrl = getSiteDisplayUrl(site);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      className="group bg-white border border-[#E6E6E4] rounded-xl overflow-hidden hover:shadow-lg hover:border-[#D0D0CE] transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/site-web/${site.id}`)}
    >
      {/* Smart Preview */}
      <div className="h-36 relative overflow-hidden">
        {site.seo?.ogImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.seo.ogImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <SitePreview site={site} />
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={site.status} maintenance={site.settings?.maintenanceMode} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[15px] font-semibold text-[#191919] truncate">{site.name}</h3>
          {site.theme?.primaryColor && (
            <span className="w-3 h-3 rounded-full flex-shrink-0 mt-1 border border-[#E6E6E4]" style={{ background: site.theme.primaryColor }} />
          )}
        </div>
        <p className={`text-[12px] truncate mb-3 ${published ? "text-[#8A8A88]" : "text-[#B0B0AE] italic"}`}>{displayUrl}</p>

        <div className="flex items-center gap-4 text-[11px] text-[#B0B0AE] mb-4">
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></svg>
            {site.pages_count} page{site.pages_count !== 1 ? "s" : ""}
          </span>
          <span>Modifié le {formatDate(site.updated_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/site-web/${site.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-center text-[12px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] py-2 rounded-lg transition-colors"
          >
            Gérer
          </Link>
          <Link
            href={getSiteEditorUrl(site)}
            onClick={(e) => e.stopPropagation()}
            className="text-[12px] font-medium text-[#5A5A58] hover:text-[#191919] bg-[#F7F7F5] hover:bg-[#F0F0EE] px-3 py-2 rounded-lg transition-colors"
          >
            Éditer
          </Link>
          {published && publicUrl ? (
            <>
              <button
                onClick={handleCopy}
                title="Copier le lien"
                className="p-2 rounded-lg text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
              >
                {copied ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Ouvrir le site"
                className="p-2 rounded-lg text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </>
          ) : (
            <span className="p-2 text-[#C0C0BE]" title="Publiez le site pour obtenir un lien">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Create Site Card ── */

function CreateSiteCard() {
  return (
    <Link href="/site-web/nouveau">
      <motion.div
        className="h-full min-h-[300px] border-2 border-dashed border-[#E6E6E4] rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#4F46E5] hover:bg-[#FAFAFF] transition-all duration-300 cursor-pointer group"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center group-hover:bg-[#4F46E5] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-[#8A8A88] group-hover:text-[#4F46E5] transition-colors">
          Créer un site
        </span>
      </motion.div>
    </Link>
  );
}

/* ── Empty State ── */

function EmptyState() {
  return (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      </div>
      <h2 className="text-[18px] font-bold text-[#191919] mb-2">Créez votre premier site</h2>
      <p className="text-[13px] text-[#8A8A88] max-w-sm mx-auto mb-6">
        Votre site vitrine, portfolio ou boutique. Prêt en quelques minutes, personnalisable à 100 %.
      </p>
      <Link
        href="/site-web/nouveau"
        className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-[13px] font-semibold px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Créer un site
      </Link>
    </motion.div>
  );
}

/* ═══ Hub principal ═══ */

export default function SitesHub() {
  const [sites, setSites] = useState<SiteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sites")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setSites(data))
      .catch((err) => {
        console.error("[SitesHub] Erreur chargement sites:", err.message);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[300px] bg-[#F7F7F5] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-[14px] text-red-500 mb-2">Erreur : {error}</p>
        <button onClick={() => window.location.reload()} className="text-[13px] text-[#4F46E5] hover:underline cursor-pointer">
          Réessayer
        </button>
      </div>
    );
  }

  if (sites.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-[#8A8A88]">
          {sites.length} site{sites.length > 1 ? "s" : ""}
        </p>
        <Link
          href="/site-web/nouveau"
          className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau site
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sites.map((site, i) => (
          <motion.div key={site.id} transition={{ delay: i * 0.05 }}>
            <SiteCard site={site} />
          </motion.div>
        ))}
        <CreateSiteCard />
      </div>
    </div>
  );
}
