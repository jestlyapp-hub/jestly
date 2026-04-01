"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

const tabDefs = [
  { label: "Aperçu", suffix: "" },
  { label: "Créateur", suffix: "/createur" },
  { label: "Pages", suffix: "/pages" },
  { label: "Produits / Briefs", suffix: "/offres" },
  { label: "Commandes", suffix: "/commandes" },
  { label: "Leads", suffix: "/leads" },
  { label: "Analytics", suffix: "/analytics" },
  { label: "Design", suffix: "/design" },
  { label: "SEO", suffix: "/seo" },
  { label: "Domaine", suffix: "/domaine" },
  { label: "Paramètres", suffix: "/parametres" },
];

/* ═══════════════════════════════════════════════════════════
   SITE SWITCHER — dropdown porté hors du parent overflow
   ═══════════════════════════════════════════════════════════ */

interface SiteMini {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme?: { primaryColor?: string; backgroundColor?: string } | null;
  settings?: { maintenanceMode?: boolean } | null;
}

function SiteSwitcher({ currentSiteId }: { currentSiteId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState<SiteMini[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Fetch sites
  useEffect(() => {
    fetch("/api/sites")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Bad format");
        setSites(data);
      })
      .catch((err) => {
        console.error("[SiteSwitcher] fetch failed:", err.message);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  // Position dropdown relative to trigger
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
  }, []);

  // Open handler
  const toggleOpen = useCallback(() => {
    setOpen((v) => {
      if (!v) updatePos();
      return !v;
    });
  }, [updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePos();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updatePos]);

  const handleSwitch = useCallback(
    (siteId: string) => {
      setOpen(false);
      const basePath = `/site-web/${currentSiteId}`;
      const suffix = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : "";
      router.push(`/site-web/${siteId}${suffix}`);
    },
    [currentSiteId, pathname, router],
  );

  const current = sites.find((s) => s.id === currentSiteId);
  const triggerName = current?.name || "Site";
  const triggerColor = current?.theme?.primaryColor || "#4F46E5";

  // Dropdown content rendered via portal to escape overflow clipping
  const dropdown = open && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Changer de site"
          className="fixed w-64 bg-white border border-[#E6E6E4] rounded-xl shadow-xl py-1"
          style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#B0B0AE]">
            Mes sites
          </div>

          {loading && (
            <div className="px-3 py-4 text-center text-[12px] text-[#8A8A88]">Chargement…</div>
          )}

          {!loading && error && (
            <div className="px-3 py-4 text-center">
              <p className="text-[12px] text-red-500 mb-1">Erreur de chargement</p>
              <button onClick={() => window.location.reload()} className="text-[11px] text-[#4F46E5] hover:underline cursor-pointer">Réessayer</button>
            </div>
          )}

          {!loading && !error && sites.length === 0 && (
            <div className="px-3 py-4 text-center text-[12px] text-[#8A8A88]">Aucun site trouvé</div>
          )}

          {!loading && !error && sites.map((site) => {
            const isActive = site.id === currentSiteId;
            const primary = site.theme?.primaryColor || "#4F46E5";
            const statusLabel = site.settings?.maintenanceMode ? "Maintenance" : site.status === "published" ? "En ligne" : "Brouillon";
            const statusColor = site.settings?.maintenanceMode ? "#F59E0B" : site.status === "published" ? "#10B981" : "#C0C0BE";

            return (
              <button
                key={site.id}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSwitch(site.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors cursor-pointer ${
                  isActive ? "bg-[#EEF2FF]" : "hover:bg-[#F7F7F5]"
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: site.theme?.backgroundColor || "#0F0F10" }}>
                  <span className="text-[8px] font-bold" style={{ color: primary }}>
                    {site.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] truncate ${isActive ? "font-semibold text-[#4F46E5]" : "text-[#191919]"}`}>
                    {site.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                    <span className="text-[10px] text-[#8A8A88]">{statusLabel}</span>
                  </div>
                </div>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}

          <div className="border-t border-[#F0F0EE] mt-1 pt-1">
            <Link href="/site-web" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-[#8A8A88] hover:text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Tous mes sites
            </Link>
            <Link href="/site-web/nouveau" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nouveau site
            </Link>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#191919] bg-[#F7F7F5] hover:bg-[#F0F0EE] border border-[#E6E6E4] transition-colors cursor-pointer flex-shrink-0 mr-3"
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: triggerColor }} />
        <span className="max-w-[140px] truncate">{triggerName}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {dropdown}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION TABS
   ═══════════════════════════════════════════════════════════ */

export default function SiteWebNav() {
  const pathname = usePathname();
  const { siteId } = useParams<{ siteId: string }>();
  const base = `/site-web/${siteId}`;

  const isActive = (suffix: string) => {
    const href = base + suffix;
    return suffix === "" ? pathname === href : pathname.startsWith(href);
  };

  return (
    <div className="mb-6">
      {/* Switcher + tabs row */}
      <div className="flex items-center border-b border-[#E6E6E4]">
        <SiteSwitcher currentSiteId={siteId} />
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabDefs.map((tab) => {
            const href = base + tab.suffix;
            return (
              <Link
                key={tab.suffix}
                href={href}
                className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                  isActive(tab.suffix)
                    ? "border-[#4F46E5] text-[#4F46E5]"
                    : "border-transparent text-[#999] hover:text-[#666]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
