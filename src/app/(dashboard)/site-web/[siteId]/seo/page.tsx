"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { useParams } from "next/navigation";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function SiteSeoPage() {
  const { site, mutate } = useSite();
  const { siteId } = useParams<{ siteId: string }>();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [globalTitle, setGlobalTitle] = useState(site.seo.globalTitle);
  const [globalDesc, setGlobalDesc] = useState(site.seo.globalDescription);
  const [ogImage, setOgImage] = useState(site.seo.ogImageUrl || "");
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null);

  // Local state for per-page SEO fields
  const [pageSeo, setPageSeo] = useState<Record<string, { seoTitle: string; seoDescription: string; ogImageUrl: string }>>(
    Object.fromEntries(
      site.pages.map((p) => [p.id, {
        seoTitle: p.seoTitle ?? "",
        seoDescription: p.seoDescription ?? "",
        ogImageUrl: p.ogImageUrl ?? "",
      }])
    )
  );

  // Sync form state when API data arrives
  useEffect(() => {
    setGlobalTitle(site.seo.globalTitle);
    setGlobalDesc(site.seo.globalDescription);
    setOgImage(site.seo.ogImageUrl || "");
    setPageSeo(
      Object.fromEntries(
        site.pages.map((p) => [p.id, {
          seoTitle: p.seoTitle ?? "",
          seoDescription: p.seoDescription ?? "",
          ogImageUrl: p.ogImageUrl ?? "",
        }])
      )
    );
  }, [site]);

  const updatePageSeo = (pageId: string, field: string, value: string) => {
    setPageSeo((prev) => ({ ...prev, [pageId]: { ...prev[pageId], [field]: value } }));
  };

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seo: {
            ...site.seo,
            globalTitle,
            globalDescription: globalDesc,
            ogImageUrl: ogImage || null,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }
      await mutate();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }, [siteId, globalTitle, globalDesc, ogImage, site.seo, mutate]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Meta globales */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Méta globales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Titre global (meta title)</label>
              <input type="text" value={globalTitle} onChange={(e) => setGlobalTitle(e.target.value)} className={inputClass} />
              <div className="text-[11px] text-[#BBB] mt-1">{globalTitle.length}/60 caractères recommandés</div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Description globale (meta description)</label>
              <textarea value={globalDesc} onChange={(e) => setGlobalDesc(e.target.value)} rows={3} className={inputClass} />
              <div className="text-[11px] text-[#BBB] mt-1">{globalDesc.length}/160 caractères recommandés</div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Image Open Graph (URL)</label>
              <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          {/* Google preview */}
          <div className="mt-5 p-4 bg-[#F7F7F5] rounded-lg">
            <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Aperçu Google</div>
            <div className="text-[14px] text-[#1a0dab] font-medium truncate">{globalTitle || "Titre de la page"}</div>
            <div className="text-[11px] text-[#006621] mb-0.5">jestly.fr/s/studionova</div>
            <div className="text-[12px] text-[#545454] line-clamp-2">{globalDesc || "Description de la page..."}</div>
          </div>
        </motion.section>

        {/* SEO par page */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">SEO par page</h2>
          <div className="space-y-3">
            {site.pages.map((page) => {
              const isExpanded = expandedPageId === page.id;
              const seo = pageSeo[page.id];
              return (
                <div key={page.id} className="rounded-lg border border-[#E6E6E4] overflow-hidden">
                  <button
                    onClick={() => setExpandedPageId(isExpanded ? null : page.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-[#FBFBFA] transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-[13px] font-medium text-[#1A1A1A]">{page.name}</div>
                      <div className="text-[11px] text-[#999]">{seo?.seoTitle || "Titre non défini"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {seo?.seoTitle ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform text-[#999] ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && seo && (
                    <div className="border-t border-[#E6E6E4] p-4 space-y-3 bg-[#FBFBFA]">
                      <div>
                        <label className="block text-[11px] font-medium text-[#999] mb-1">Meta title</label>
                        <input
                          type="text"
                          value={seo.seoTitle}
                          onChange={(e) => updatePageSeo(page.id, "seoTitle", e.target.value)}
                          placeholder="Titre SEO de la page"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#999] mb-1">Meta description</label>
                        <textarea
                          value={seo.seoDescription}
                          onChange={(e) => updatePageSeo(page.id, "seoDescription", e.target.value)}
                          rows={2}
                          placeholder="Description SEO de la page"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#999] mb-1">Image OG (URL)</label>
                        <input
                          type="text"
                          value={seo.ogImageUrl}
                          onChange={(e) => updatePageSeo(page.id, "ogImageUrl", e.target.value)}
                          placeholder="https://..."
                          className={inputClass}
                        />
                        {seo.ogImageUrl && (
                          <div className="mt-2 rounded-lg border border-[#E6E6E4] overflow-hidden bg-white">
                            <div className="h-24 bg-gradient-to-br from-[#EEF2FF] to-[#E6E6E4] flex items-center justify-center text-[11px] text-[#4F46E5]">
                              Aperçu OG Image
                            </div>
                            <div className="px-3 py-1.5 text-[10px] text-[#999] truncate">{seo.ogImageUrl}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Sitemap */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">Sitemap</h2>
          <div className="p-3 bg-[#F7F7F5] rounded-lg">
            <div className="text-[12px] font-mono text-[#999]">
              https://jestly.fr/s/studionova/sitemap.xml
            </div>
          </div>
          <p className="text-[11px] text-[#BBB] mt-2">
            Le sitemap est généré automatiquement à partir des pages publiées.
          </p>
        </motion.section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saveState === "saved" && <span className="text-[12px] font-medium text-emerald-600">SEO sauvegardé</span>}
          {saveState === "error" && <span className="text-[12px] font-medium text-red-500">{errorMsg || "Erreur"}</span>}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saveState === "saving" && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder le SEO"}
          </button>
        </div>
      </div>
    </div>
  );
}
