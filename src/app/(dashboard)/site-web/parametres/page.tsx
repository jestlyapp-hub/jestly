"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockSite } from "@/lib/mock-data";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-11 h-6 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform";

export default function SiteParametresPage() {
  const [name, setName] = useState(mockSite.settings.name);
  const [description, setDescription] = useState(mockSite.settings.description);
  const [maintenance, setMaintenance] = useState(mockSite.settings.maintenanceMode);
  const [socials, setSocials] = useState(mockSite.settings.socials);

  // Nav state
  const [navLinks, setNavLinks] = useState(mockSite.nav?.links ?? []);
  const [navShowCta, setNavShowCta] = useState(mockSite.nav?.showCta ?? false);
  const [navCtaLabel, setNavCtaLabel] = useState(mockSite.nav?.ctaLabel ?? "");

  // Footer state
  const [footerLinks, setFooterLinks] = useState(mockSite.footer?.links ?? []);
  const [footerShowSocials, setFooterShowSocials] = useState(mockSite.footer?.showSocials ?? true);
  const [footerCopyright, setFooterCopyright] = useState(mockSite.footer?.copyright ?? "");

  // Auto-services
  const [autoServices, setAutoServices] = useState(false);

  // i18n
  const i18n = mockSite.settings.i18n ?? { locales: ["fr"], defaultLocale: "fr" };
  const [defaultLocale, setDefaultLocale] = useState(i18n.defaultLocale);
  const [locales, setLocales] = useState(i18n.locales);

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
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Informations générales</h2>
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
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Navigation</h2>
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
                    {mockSite.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Footer</h2>
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
                    {mockSite.pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Mode maintenance</h2>
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
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Génération automatique</h2>
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
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Langues</h2>
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
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Réseaux sociaux</h2>
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
        <div className="flex justify-end">
          <button className="bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
            Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
