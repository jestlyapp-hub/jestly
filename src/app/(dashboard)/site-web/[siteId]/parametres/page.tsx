"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { useParams } from "next/navigation";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-11 h-6 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform";

export default function SiteParametresPage() {
  const { site, mutate } = useSite();
  const { siteId } = useParams<{ siteId: string }>();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState(site.settings.name);
  const [description, setDescription] = useState(site.settings.description);
  const [maintenance, setMaintenance] = useState(site.settings.maintenanceMode);
  const [socials, setSocials] = useState(site.settings.socials);

  // Nav state
  const [navLinks, setNavLinks] = useState(site.nav?.links ?? []);
  const [navShowCta, setNavShowCta] = useState(site.nav?.showCta ?? false);
  const [navCtaLabel, setNavCtaLabel] = useState(site.nav?.ctaLabel ?? "");

  // Footer state
  const [footerLinks, setFooterLinks] = useState(site.footer?.links ?? []);
  const [footerShowSocials, setFooterShowSocials] = useState(site.footer?.showSocials ?? true);
  const [footerCopyright, setFooterCopyright] = useState(site.footer?.copyright ?? "");

  // Auto-services
  const [autoServices, setAutoServices] = useState(false);

  // i18n
  const i18n = site.settings.i18n ?? { locales: ["fr"], defaultLocale: "fr" };
  const [defaultLocale, setDefaultLocale] = useState(i18n.defaultLocale);
  const [locales, setLocales] = useState(i18n.locales);

  // Sync form state when API data arrives
  useEffect(() => {
    setName(site.settings.name);
    setDescription(site.settings.description);
    setMaintenance(site.settings.maintenanceMode);
    setSocials(site.settings.socials);
    setNavLinks(site.nav?.links ?? []);
    setNavShowCta(site.nav?.showCta ?? false);
    setNavCtaLabel(site.nav?.ctaLabel ?? "");
    setFooterLinks(site.footer?.links ?? []);
    setFooterShowSocials(site.footer?.showSocials ?? true);
    setFooterCopyright(site.footer?.copyright ?? "");
    const i = site.settings.i18n ?? { locales: ["fr"], defaultLocale: "fr" };
    setDefaultLocale(i.defaultLocale);
    setLocales(i.locales);
  }, [site]);

  const updateSocial = (key: string, value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  const updateNavLink = (i: number, field: string, value: string) => {
    setNavLinks((prev) => prev.map((link, j) => j === i ? { ...link, [field]: value } : link));
  };

  const addNavLink = () => setNavLinks([...navLinks, { label: "Nouveau lien" }]);
  const removeNavLink = (i: number) => setNavLinks(navLinks.filter((_, j) => j !== i));

  const updateFooterLink = (i: number, field: string, value: string) => {
    setFooterLinks((prev) => prev.map((link, j) => j === i ? { ...link, [field]: value } : link));
  };

  const addFooterLink = () => setFooterLinks([...footerLinks, { label: "Nouveau lien" }]);
  const removeFooterLink = (i: number) => setFooterLinks(footerLinks.filter((_, j) => j !== i));

  const addLocale = () => {
    const next = prompt("Code langue (ex: en, es, de)");
    if (next && !locales.includes(next)) setLocales([...locales, next]);
  };

  const removeLocale = (loc: string) => {
    if (loc === defaultLocale) return;
    setLocales(locales.filter((l) => l !== loc));
  };

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          settings: {
            ...site.settings,
            name,
            description,
            maintenanceMode: maintenance,
            socials,
            i18n: { locales, defaultLocale },
          },
          nav: { ...site.nav, links: navLinks, showCta: navShowCta, ctaLabel: navCtaLabel },
          footer: { ...site.footer, links: footerLinks, showSocials: footerShowSocials, copyright: footerCopyright },
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
  }, [siteId, name, description, maintenance, socials, locales, defaultLocale, navLinks, navShowCta, navCtaLabel, footerLinks, footerShowSocials, footerCopyright, site.settings, site.nav, site.footer, mutate]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Informations générales */}
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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#F7F7F5] border-2 border-dashed border-[#E6E6E4] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <button className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors">
                    Uploader un logo
                  </button>
                  <p className="text-[11px] text-[#BBB] mt-1">PNG, JPG ou SVG. Max 2 Mo.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Navigation */}
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
                    {site.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              <button onClick={() => setNavShowCta(!navShowCta)} className={`${toggleClass} ${navShowCta ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                <div className={`${toggleDotClass} ${navShowCta ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            {navShowCta && (
              <div>
                <label className="block text-[11px] font-medium text-[#999] mb-1">Label du CTA</label>
                <input type="text" value={navCtaLabel} onChange={(e) => setNavCtaLabel(e.target.value)} className={inputClass} />
              </div>
            )}
          </div>
        </motion.section>

        {/* Footer */}
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
                    {site.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              <button onClick={() => setFooterShowSocials(!footerShowSocials)} className={`${toggleClass} ${footerShowSocials ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                <div className={`${toggleDotClass} ${footerShowSocials ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-1">Copyright</label>
              <input type="text" value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} className={inputClass} />
            </div>
          </div>
        </motion.section>

        {/* Mode maintenance */}
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
              onClick={() => setMaintenance(!maintenance)}
              className={`${toggleClass} ${maintenance ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
            >
              <div className={`${toggleDotClass} ${maintenance ? "translate-x-5.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </motion.section>

        {/* Génération automatique */}
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

        {/* Langues */}
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
              <select value={defaultLocale} onChange={(e) => setDefaultLocale(e.target.value)} className={inputClass}>
                {locales.map((loc) => <option key={loc} value={loc}>{loc.toUpperCase()}</option>)}
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

        {/* Réseaux sociaux */}
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

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          {saveState === "saved" && <span className="text-[12px] font-medium text-emerald-600">Paramètres sauvegardés</span>}
          {saveState === "error" && <span className="text-[12px] font-medium text-red-500">{errorMsg || "Erreur"}</span>}
          <button
            onClick={handleSave}
            disabled={saveState === "saving"}
            className="bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saveState === "saving" && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder les paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}
