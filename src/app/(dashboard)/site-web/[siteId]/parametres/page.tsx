"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { useParams } from "next/navigation";
import { toast } from "@/lib/hooks/use-toast";
import ImageUploader from "@/components/site-web/editors/ImageUploader";
import type { NavLink, FooterLink, SiteSettings, NavConfig, FooterConfig } from "@/types";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-11 h-6 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform";

// ── Helpers ──────────────────────────────────────────────────────

/** Construire l'objet settings complet pour le payload */
function buildSettingsPayload(
  name: string,
  description: string,
  logoUrl: string,
  faviconUrl: string,
  maintenance: boolean,
  socials: SiteSettings["socials"],
  locales: string[],
  defaultLocale: string,
): SiteSettings {
  return {
    name,
    description,
    logoUrl: logoUrl || undefined,
    faviconUrl: faviconUrl || undefined,
    maintenanceMode: maintenance,
    socials,
    i18n: { locales, defaultLocale },
  };
}

/** Construire l'objet nav complet */
function buildNavPayload(
  existingNav: NavConfig | undefined,
  links: NavLink[],
  showCta: boolean,
  ctaLabel: string,
): NavConfig {
  return {
    ...(existingNav ?? { variant: undefined, links: [], showCta: false, ctaLabel: "" }),
    links,
    showCta,
    ctaLabel,
  };
}

/** Construire l'objet footer complet */
function buildFooterPayload(
  links: FooterLink[],
  showSocials: boolean,
  copyright: string,
): FooterConfig {
  return { links, showSocials, copyright };
}

// ── Page ─────────────────────────────────────────────────────────

export default function SiteParametresPage() {
  const { site, mutate } = useSite();
  const { siteId } = useParams<{ siteId: string }>();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Form state ──
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [maintenance, setMaintenance] = useState(false);
  const [socials, setSocials] = useState<SiteSettings["socials"]>({});
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [navShowCta, setNavShowCta] = useState(false);
  const [navCtaLabel, setNavCtaLabel] = useState("");
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [footerShowSocials, setFooterShowSocials] = useState(true);
  const [footerCopyright, setFooterCopyright] = useState("");
  const [autoServices, setAutoServices] = useState(false);
  const [defaultLocale, setDefaultLocale] = useState("fr");
  const [locales, setLocales] = useState<string[]>(["fr"]);

  // ── Dirty state tracking ──
  const initializedRef = useRef(false);
  const [isDirty, setIsDirty] = useState(false);

  // Sync form state when site data arrives or changes
  useEffect(() => {
    if (!site.id) return; // empty site placeholder
    const s = site.settings;
    const i = s.i18n ?? { locales: ["fr"], defaultLocale: "fr" };
    setName(s.name);
    setDescription(s.description);
    setLogoUrl(s.logoUrl || "");
    setFaviconUrl(s.faviconUrl || "");
    setMaintenance(s.maintenanceMode === true);
    setSocials(s.socials ?? {});
    setNavLinks(site.nav?.links ?? []);
    setNavShowCta(site.nav?.showCta ?? false);
    setNavCtaLabel(site.nav?.ctaLabel ?? "");
    setFooterLinks(site.footer?.links ?? []);
    setFooterShowSocials(site.footer?.showSocials ?? true);
    setFooterCopyright(site.footer?.copyright ?? "");
    setDefaultLocale(i.defaultLocale);
    setLocales(i.locales);
    setIsDirty(false);
    initializedRef.current = true;
  }, [site]);

  // Mark dirty on any change
  const markDirty = useCallback(() => {
    if (initializedRef.current) setIsDirty(true);
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Field updaters (mark dirty) ──
  const setField = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (val: T | ((prev: T) => T)) => { setter(val); markDirty(); };

  const updateSocial = (key: string, value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
    markDirty();
  };

  const updateNavLink = (i: number, field: string, value: string) => {
    setNavLinks((prev) => prev.map((link, j) => (j === i ? { ...link, [field]: value } : link)));
    markDirty();
  };

  const addNavLink = () => { setNavLinks([...navLinks, { label: "Nouveau lien" }]); markDirty(); };
  const removeNavLink = (i: number) => { setNavLinks(navLinks.filter((_, j) => j !== i)); markDirty(); };

  const updateFooterLink = (i: number, field: string, value: string) => {
    setFooterLinks((prev) => prev.map((link, j) => (j === i ? { ...link, [field]: value } : link)));
    markDirty();
  };

  const addFooterLink = () => { setFooterLinks([...footerLinks, { label: "Nouveau lien" }]); markDirty(); };
  const removeFooterLink = (i: number) => { setFooterLinks(footerLinks.filter((_, j) => j !== i)); markDirty(); };

  const addLocale = () => {
    const next = prompt("Code langue (ex: en, es, de)");
    if (next && !locales.includes(next)) { setLocales([...locales, next]); markDirty(); }
  };

  const removeLocale = (loc: string) => {
    if (loc === defaultLocale) return;
    setLocales(locales.filter((l) => l !== loc));
    markDirty();
  };

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    if (saveState === "saving") return; // prevent double-click
    setSaveState("saving");

    const payload = {
      name,
      settings: buildSettingsPayload(name, description, logoUrl, faviconUrl, maintenance, socials, locales, defaultLocale),
      nav: buildNavPayload(site.nav, navLinks, navShowCta, navCtaLabel),
      footer: buildFooterPayload(footerLinks, footerShowSocials, footerCopyright),
    };

    try {
      console.log("[Settings] Sauvegarde en cours…", { siteId, keys: Object.keys(payload) });

      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error || `Erreur serveur (${res.status})`;
        console.error("[Settings] Échec sauvegarde:", msg);
        throw new Error(msg);
      }

      const saved = await res.json();
      console.log("[Settings] Sauvegarde réussie:", saved.id);

      // Refetch to sync context
      await mutate();
      setIsDirty(false);
      setSaveState("saved");
      toast.success("Paramètres enregistrés");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      setSaveState("error");
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      toast.error(msg, { title: "Erreur de sauvegarde" });
    }
  }, [
    saveState, siteId, name, description, logoUrl, faviconUrl, maintenance, socials,
    locales, defaultLocale, navLinks, navShowCta, navCtaLabel,
    footerLinks, footerShowSocials, footerCopyright, site.nav, mutate,
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* ── Informations générales ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#191919] mb-5">Informations générales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Nom du site</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); markDirty(); }} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => { setDescription(e.target.value); markDirty(); }} rows={3} className={inputClass} />
            </div>
            <div>
              <ImageUploader
                value={logoUrl || undefined}
                onChange={(url) => { setLogoUrl(url); markDirty(); }}
                label="Logo"
                hint="PNG, JPG ou SVG · Max 2 Mo"
                previewAspect="1 / 1"
              />
            </div>
            <div>
              <ImageUploader
                value={faviconUrl || undefined}
                onChange={(url) => { setFaviconUrl(url); markDirty(); }}
                label="Favicon"
                hint="Formats recommandés : PNG ou ICO, carré, 32×32 ou 64×64"
                previewAspect="1 / 1"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.ico"
              />
            </div>
          </div>
        </motion.section>

        {/* ── Navigation ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.04 }}
        >
          <h2 className="text-[15px] font-semibold text-[#191919] mb-5">Navigation</h2>
          <div className="space-y-3">
            {navLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateNavLink(i, "label", e.target.value)}
                  placeholder="Label"
                  className={`${inputClass} flex-1`}
                />
                {link.pageId !== undefined ? (
                  <select
                    value={link.pageId ?? ""}
                    onChange={(e) => updateNavLink(i, "pageId", e.target.value)}
                    className={`${inputClass} flex-1`}
                  >
                    <option value="">Page...</option>
                    {site.pages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={link.url ?? ""}
                    onChange={(e) => updateNavLink(i, "url", e.target.value)}
                    placeholder="URL"
                    className={`${inputClass} flex-1`}
                  />
                )}
                <button onClick={() => removeNavLink(i)} className="text-[#999] hover:text-red-500 text-lg">&times;</button>
              </div>
            ))}
            <button onClick={addNavLink} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un lien</button>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E6E6E4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#666]">Afficher le CTA</span>
              <button
                onClick={() => { setNavShowCta(!navShowCta); markDirty(); }}
                className={`${toggleClass} ${navShowCta ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
              >
                <div className={`${toggleDotClass} ${navShowCta ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {navShowCta && (
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Label du CTA</label>
                <input type="text" value={navCtaLabel} onChange={(e) => { setNavCtaLabel(e.target.value); markDirty(); }} className={inputClass} />
              </div>
            )}
          </div>
        </motion.section>

        {/* ── Footer ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h2 className="text-[15px] font-semibold text-[#191919] mb-5">Footer</h2>
          <div className="space-y-3">
            {footerLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateFooterLink(i, "label", e.target.value)}
                  placeholder="Label"
                  className={`${inputClass} flex-1`}
                />
                {link.pageId !== undefined ? (
                  <select
                    value={link.pageId ?? ""}
                    onChange={(e) => updateFooterLink(i, "pageId", e.target.value)}
                    className={`${inputClass} flex-1`}
                  >
                    <option value="">Page...</option>
                    {site.pages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={link.url ?? ""}
                    onChange={(e) => updateFooterLink(i, "url", e.target.value)}
                    placeholder="URL"
                    className={`${inputClass} flex-1`}
                  />
                )}
                <button onClick={() => removeFooterLink(i)} className="text-[#999] hover:text-red-500 text-lg">&times;</button>
              </div>
            ))}
            <button onClick={addFooterLink} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un lien</button>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E6E6E4] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#666]">Afficher les réseaux sociaux</span>
              <button
                onClick={() => { setFooterShowSocials(!footerShowSocials); markDirty(); }}
                className={`${toggleClass} ${footerShowSocials ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
              >
                <div className={`${toggleDotClass} ${footerShowSocials ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-1">Copyright</label>
              <input type="text" value={footerCopyright} onChange={(e) => { setFooterCopyright(e.target.value); markDirty(); }} className={inputClass} />
            </div>
          </div>
        </motion.section>

        {/* ── Mode maintenance ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#191919]">Mode maintenance</h2>
              <p className="text-[12px] text-[#999] mt-0.5">
                {maintenance ? "Votre site est actuellement hors ligne." : "Votre site est en ligne et accessible."}
              </p>
            </div>
            <button
              onClick={() => { setMaintenance(!maintenance); markDirty(); }}
              className={`${toggleClass} ${maintenance ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
            >
              <div className={`${toggleDotClass} ${maintenance ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </motion.section>

        {/* ── Génération automatique ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#191919]">Génération automatique</h2>
              <p className="text-[12px] text-[#999] mt-0.5">Page services auto depuis produits actifs</p>
            </div>
            <button
              onClick={() => setAutoServices(!autoServices)}
              className={`${toggleClass} ${autoServices ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
            >
              <div className={`${toggleDotClass} ${autoServices ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {autoServices && (
            <div className="mt-3 bg-[#EEF2FF] rounded-lg px-3 py-2 text-[11px] text-[#4F46E5]">
              Une page &quot;Services&quot; sera automatiquement créée avec tous vos produits actifs.
              La logique serveur sera ajoutée dans une prochaine version.
            </div>
          )}
        </motion.section>

        {/* ── Langues ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-[15px] font-semibold text-[#191919] mb-5">Langues</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Langue par défaut</label>
              <select value={defaultLocale} onChange={(e) => { setDefaultLocale(e.target.value); markDirty(); }} className={inputClass}>
                {locales.map((loc) => (
                  <option key={loc} value={loc}>{loc.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Langues actives</label>
              <div className="flex flex-wrap gap-2">
                {locales.map((loc) => (
                  <span key={loc} className="inline-flex items-center gap-1 bg-[#EEF2FF] text-[#4F46E5] text-[12px] font-medium px-2.5 py-1 rounded-full">
                    {loc.toUpperCase()}
                    {loc !== defaultLocale && (
                      <button onClick={() => removeLocale(loc)} className="hover:text-red-500 ml-0.5">&times;</button>
                    )}
                  </span>
                ))}
                <button onClick={addLocale} className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-2.5 py-1 rounded-full hover:bg-[#EEF2FF] transition-colors">
                  + Ajouter
                </button>
              </div>
            </div>
            <div className="bg-[#F7F7F5] rounded-lg px-3 py-2 text-[11px] text-[#999]">
              La traduction du contenu sera disponible dans une prochaine version.
            </div>
          </div>
        </motion.section>

        {/* ── Réseaux sociaux ── */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <h2 className="text-[15px] font-semibold text-[#191919] mb-5">Réseaux sociaux</h2>
          <div className="space-y-4">
            {[
              { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
              { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/..." },
              { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
              { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
              { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
            ].map((social) => (
              <div key={social.key}>
                <label className="block text-[12px] font-medium text-[#999] mb-1.5">{social.label}</label>
                <input
                  type="text"
                  value={(socials as Record<string, string | undefined>)[social.key] || ""}
                  onChange={(e) => updateSocial(social.key, e.target.value)}
                  placeholder={social.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Save bar ── */}
        <div className="sticky bottom-4 flex items-center justify-end gap-3 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E6E6E4] px-5 py-3 shadow-sm">
          {isDirty && saveState === "idle" && (
            <span className="text-[12px] text-[#999]">Modifications non enregistrées</span>
          )}
          {saveState === "saved" && (
            <span className="text-[12px] font-medium text-emerald-600">Paramètres enregistrés</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saveState === "saving" && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}
