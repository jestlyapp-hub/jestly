"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import type { NavConfig, FooterConfig } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const smallInputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 transition-all";

type Tab = "nav" | "footer";

export default function NavFooterEditorPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useBuilder();
  const [tab, setTab] = useState<Tab>("nav");

  const nav: NavConfig = state.site.nav || { links: [], showCta: false, ctaLabel: "" };
  const footer: FooterConfig = state.site.footer || { links: [], showSocials: false, copyright: "" };

  const updateNav = (updates: Partial<NavConfig>) => {
    dispatch({ type: "UPDATE_NAV", nav: { ...nav, ...updates } });
  };

  const updateFooter = (updates: Partial<FooterConfig>) => {
    dispatch({ type: "UPDATE_FOOTER", footer: { ...footer, ...updates } });
  };

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E6E4] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#E6E6E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" />
          </svg>
          <span className="text-[12px] font-semibold text-[#1A1A1A]">Navigation</span>
        </div>
        <button onClick={onClose} className="text-[#999] hover:text-[#666] p-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6E6E4]">
        {[
          { id: "nav" as Tab, label: "Navbar" },
          { id: "footer" as Tab, label: "Footer" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-all relative ${
              tab === t.id ? "text-[#4F46E5]" : "text-[#999] hover:text-[#666]"
            }`}
          >
            {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4F46E5] rounded-full" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {tab === "nav" && (
          <>
            {/* Logo text (site name) */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Logo / Nom</label>
              <input
                type="text"
                value={state.site.settings.name}
                onChange={(e) => dispatch({ type: "UPDATE_SITE_SETTINGS", settings: { name: e.target.value } })}
                className={inputClass}
                placeholder="Nom du site"
              />
            </div>

            {/* Nav links */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Liens</label>
              <div className="space-y-2">
                {nav.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const links = [...nav.links];
                        links[i] = { ...links[i], label: e.target.value };
                        updateNav({ links });
                      }}
                      className={smallInputClass}
                      placeholder="Label"
                    />
                    <select
                      value={link.pageId || ""}
                      onChange={(e) => {
                        const links = [...nav.links];
                        links[i] = { ...links[i], pageId: e.target.value || undefined };
                        updateNav({ links });
                      }}
                      className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[11px] text-[#1A1A1A]"
                    >
                      <option value="">Aucune page</option>
                      {state.site.pages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const links = nav.links.filter((_, j) => j !== i);
                        updateNav({ links });
                      }}
                      className="text-[#999] hover:text-red-500 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateNav({ links: [...nav.links, { label: "Nouveau lien" }] })}
                  className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                >
                  + Ajouter un lien
                </button>
              </div>
            </div>

            {/* CTA */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Bouton CTA</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => updateNav({ showCta: !nav.showCta })}
                  className={`w-8 h-4 rounded-full transition-all relative ${nav.showCta ? "bg-[#4F46E5]" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${nav.showCta ? "left-4" : "left-0.5"}`} />
                </button>
                <span className="text-[11px] text-[#666]">{nav.showCta ? "Activé" : "Désactivé"}</span>
              </div>
              {nav.showCta && (
                <input
                  type="text"
                  value={nav.ctaLabel}
                  onChange={(e) => updateNav({ ctaLabel: e.target.value })}
                  className={inputClass}
                  placeholder="Texte du CTA"
                />
              )}
            </div>
          </>
        )}

        {tab === "footer" && (
          <>
            {/* Footer links */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Liens</label>
              <div className="space-y-2">
                {footer.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const links = [...footer.links];
                        links[i] = { ...links[i], label: e.target.value };
                        updateFooter({ links });
                      }}
                      className={smallInputClass}
                      placeholder="Label"
                    />
                    <select
                      value={link.pageId || ""}
                      onChange={(e) => {
                        const links = [...footer.links];
                        links[i] = { ...links[i], pageId: e.target.value || undefined };
                        updateFooter({ links });
                      }}
                      className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[11px] text-[#1A1A1A]"
                    >
                      <option value="">Aucune page</option>
                      {state.site.pages.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const links = footer.links.filter((_, j) => j !== i);
                        updateFooter({ links });
                      }}
                      className="text-[#999] hover:text-red-500 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateFooter({ links: [...footer.links, { label: "Nouveau lien" }] })}
                  className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                >
                  + Ajouter un lien
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1">Copyright</label>
              <input
                type="text"
                value={footer.copyright}
                onChange={(e) => updateFooter({ copyright: e.target.value })}
                className={inputClass}
                placeholder="© 2026 Votre nom. Tous droits réservés."
              />
            </div>

            {/* Socials toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Réseaux sociaux</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => updateFooter({ showSocials: !footer.showSocials })}
                  className={`w-8 h-4 rounded-full transition-all relative ${footer.showSocials ? "bg-[#4F46E5]" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${footer.showSocials ? "left-4" : "left-0.5"}`} />
                </button>
                <span className="text-[11px] text-[#666]">{footer.showSocials ? "Affichés" : "Masqués"}</span>
              </div>
              {footer.showSocials && (
                <div className="space-y-1.5">
                  {(["instagram", "twitter", "linkedin", "youtube", "tiktok"] as const).map((social) => (
                    <div key={social} className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-[#999] w-16 capitalize">{social}</span>
                      <input
                        type="text"
                        value={state.site.settings.socials?.[social] || ""}
                        onChange={(e) => dispatch({ type: "UPDATE_SITE_SETTINGS", settings: { socials: { ...state.site.settings.socials, [social]: e.target.value } } })}
                        placeholder={`@${social}`}
                        className={smallInputClass}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
