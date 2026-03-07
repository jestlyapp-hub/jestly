"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import type { NavConfig, NavLink, NavSocialLink, FooterConfig, NavbarVariant } from "@/types";
import { NAVBAR_VARIANTS, defaultNavConfig } from "@/components/site-web/navbar/NavbarRenderer";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const smallInputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 transition-all";
const sectionLabel = "block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2";

function genId() { return Math.random().toString(36).slice(2, 9); }

type Tab = "nav" | "footer";
type NavSection = "variant" | "links" | "cta" | "socials" | "style";

export default function NavFooterEditorPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useBuilder();
  const [tab, setTab] = useState<Tab>("nav");
  const [navSection, setNavSection] = useState<NavSection>("variant");

  const nav: NavConfig = state.site.nav || defaultNavConfig();
  const footer: FooterConfig = state.site.footer || { links: [], showSocials: false, copyright: "" };

  const updateNav = (updates: Partial<NavConfig>) => {
    dispatch({ type: "UPDATE_NAV", nav: { ...nav, ...updates } });
  };

  const updateFooter = (updates: Partial<FooterConfig>) => {
    dispatch({ type: "UPDATE_FOOTER", footer: { ...footer, ...updates } });
  };

  // Ensure nav has the new variant field — migrate old configs
  if (!nav.variant) {
    updateNav({ variant: "classic-floating" });
  }

  const updateLink = (index: number, patch: Partial<NavLink>) => {
    const links = [...nav.links];
    links[index] = { ...links[index], ...patch };
    updateNav({ links });
  };

  const removeLink = (index: number) => {
    updateNav({ links: nav.links.filter((_, j) => j !== index) });
  };

  const addLink = () => {
    updateNav({ links: [...nav.links, { id: genId(), label: "Nouveau lien" }] });
  };

  const addChildLink = (parentIndex: number) => {
    const links = [...nav.links];
    const parent = { ...links[parentIndex] };
    parent.children = [...(parent.children || []), { id: genId(), label: "Sous-lien" }];
    links[parentIndex] = parent;
    updateNav({ links });
  };

  const updateChildLink = (parentIndex: number, childIndex: number, patch: Partial<NavLink>) => {
    const links = [...nav.links];
    const parent = { ...links[parentIndex] };
    const children = [...(parent.children || [])];
    children[childIndex] = { ...children[childIndex], ...patch };
    parent.children = children;
    links[parentIndex] = parent;
    updateNav({ links });
  };

  const removeChildLink = (parentIndex: number, childIndex: number) => {
    const links = [...nav.links];
    const parent = { ...links[parentIndex] };
    parent.children = (parent.children || []).filter((_, j) => j !== childIndex);
    links[parentIndex] = parent;
    updateNav({ links });
  };

  const moveLink = (from: number, direction: "up" | "down") => {
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= nav.links.length) return;
    const links = [...nav.links];
    [links[from], links[to]] = [links[to], links[from]];
    updateNav({ links });
  };

  const navSections: { id: NavSection; label: string; icon: string }[] = [
    { id: "variant", label: "Style", icon: "◆" },
    { id: "links", label: "Liens", icon: "≡" },
    { id: "cta", label: "CTA", icon: "→" },
    { id: "socials", label: "Social", icon: "@" },
    { id: "style", label: "Options", icon: "⚙" },
  ];

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

      {/* Main tabs */}
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

      {tab === "nav" && (
        <>
          {/* Nav sub-sections */}
          <div className="flex border-b border-[#E6E6E4] px-2 py-1.5 gap-0.5 overflow-x-auto">
            {navSections.map(s => (
              <button
                key={s.id}
                onClick={() => setNavSection(s.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap ${
                  navSection === s.id ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#999] hover:text-[#666] hover:bg-[#F7F7F5]"
                }`}
              >
                <span className="text-[11px]">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {/* ═══ VARIANT SECTION ═══ */}
            {navSection === "variant" && (
              <>
                <div>
                  <label className={sectionLabel}>Variante de navbar</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {NAVBAR_VARIANTS.map(v => (
                      <button
                        key={v.key}
                        onClick={() => updateNav({ variant: v.key as NavbarVariant })}
                        className={`text-left p-2.5 rounded-lg border transition-all ${
                          nav.variant === v.key
                            ? "border-[#4F46E5] bg-[#EEF2FF] shadow-sm"
                            : "border-[#E6E6E4] hover:border-[#C5C5C3] bg-white"
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-[#1A1A1A] mb-0.5">{v.name}</div>
                        <div className="text-[9px] text-[#999] leading-tight">{v.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <label className={sectionLabel}>Logo / Nom du site</label>
                  <input
                    type="text"
                    value={state.site.settings.name}
                    onChange={(e) => dispatch({ type: "UPDATE_SITE_SETTINGS", settings: { name: e.target.value } })}
                    className={inputClass}
                    placeholder="Nom du site"
                  />
                  <div className="mt-2">
                    <input
                      type="text"
                      value={state.site.settings.logoUrl || ""}
                      onChange={(e) => dispatch({ type: "UPDATE_SITE_SETTINGS", settings: { logoUrl: e.target.value || undefined } })}
                      className={inputClass}
                      placeholder="URL du logo (optionnel)"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ═══ LINKS SECTION ═══ */}
            {navSection === "links" && (
              <div>
                <label className={sectionLabel}>Liens de navigation</label>
                <div className="space-y-2">
                  {nav.links.map((link, i) => (
                    <div key={link.id || i} className="border border-[#E6E6E4] rounded-lg p-2.5 space-y-2 bg-[#FAFAFA]">
                      <div className="flex items-center gap-1.5">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-px">
                          <button onClick={() => moveLink(i, "up")} className="text-[#BBB] hover:text-[#666] disabled:opacity-30" disabled={i === 0}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                          </button>
                          <button onClick={() => moveLink(i, "down")} className="text-[#BBB] hover:text-[#666] disabled:opacity-30" disabled={i === nav.links.length - 1}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(i, { label: e.target.value })}
                          className={smallInputClass}
                          placeholder="Label"
                        />
                        <select
                          value={link.pageId || ""}
                          onChange={(e) => updateLink(i, { pageId: e.target.value || undefined })}
                          className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[11px] text-[#1A1A1A] max-w-[90px]"
                        >
                          <option value="">Page…</option>
                          {state.site.pages.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button onClick={() => removeLink(i)} className="text-[#999] hover:text-red-500 flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>

                      {/* External URL */}
                      {!link.pageId && (
                        <input
                          type="text"
                          value={link.url || ""}
                          onChange={(e) => updateLink(i, { url: e.target.value || undefined })}
                          className={smallInputClass}
                          placeholder="URL externe (optionnel)"
                        />
                      )}

                      {/* Dropdown children */}
                      {link.children && link.children.length > 0 && (
                        <div className="pl-4 space-y-1.5 border-l-2 border-[#E6E6E4] ml-2">
                          <span className="text-[9px] text-[#BBB] font-semibold uppercase">Sous-liens</span>
                          {link.children.map((child, j) => (
                            <div key={child.id || j} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={child.label}
                                onChange={(e) => updateChildLink(i, j, { label: e.target.value })}
                                className={smallInputClass}
                                placeholder="Sous-lien"
                              />
                              <select
                                value={child.pageId || ""}
                                onChange={(e) => updateChildLink(i, j, { pageId: e.target.value || undefined })}
                                className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[10px] max-w-[80px]"
                              >
                                <option value="">Page…</option>
                                {state.site.pages.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                              <button onClick={() => removeChildLink(i, j)} className="text-[#BBB] hover:text-red-500">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => addChildLink(i)}
                        className="text-[10px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                      >
                        + Ajouter un sous-lien
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addLink}
                    className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                  >
                    + Ajouter un lien
                  </button>
                </div>
              </div>
            )}

            {/* ═══ CTA SECTION ═══ */}
            {navSection === "cta" && (
              <>
                {/* Primary CTA */}
                <div>
                  <label className={sectionLabel}>Bouton principal</label>
                  <div className="flex items-center gap-2 mb-2">
                    <ToggleSwitch value={nav.showCta} onChange={(v) => updateNav({ showCta: v })} />
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

                {/* Secondary CTA */}
                <div>
                  <label className={sectionLabel}>Bouton secondaire</label>
                  <div className="flex items-center gap-2 mb-2">
                    <ToggleSwitch value={nav.showSecondaryCta || false} onChange={(v) => updateNav({ showSecondaryCta: v })} />
                    <span className="text-[11px] text-[#666]">{nav.showSecondaryCta ? "Activé" : "Désactivé"}</span>
                  </div>
                  {nav.showSecondaryCta && (
                    <input
                      type="text"
                      value={nav.secondaryCtaLabel || ""}
                      onChange={(e) => updateNav({ secondaryCtaLabel: e.target.value })}
                      className={inputClass}
                      placeholder="Texte du bouton secondaire"
                    />
                  )}
                </div>
              </>
            )}

            {/* ═══ SOCIALS SECTION ═══ */}
            {navSection === "socials" && (
              <div>
                <label className={sectionLabel}>Réseaux sociaux dans la navbar</label>
                <div className="flex items-center gap-2 mb-3">
                  <ToggleSwitch value={nav.showSocials || false} onChange={(v) => updateNav({ showSocials: v })} />
                  <span className="text-[11px] text-[#666]">{nav.showSocials ? "Affichés" : "Masqués"}</span>
                </div>
                {nav.showSocials && (
                  <div className="space-y-2">
                    {(nav.socials || []).map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={s.network}
                          onChange={(e) => {
                            const socials = [...(nav.socials || [])];
                            socials[i] = { ...socials[i], network: e.target.value as NavSocialLink["network"] };
                            updateNav({ socials });
                          }}
                          className="bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2 py-1.5 text-[11px] w-24"
                        >
                          {["instagram", "twitter", "linkedin", "youtube", "tiktok", "github", "dribbble", "behance"].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={s.url}
                          onChange={(e) => {
                            const socials = [...(nav.socials || [])];
                            socials[i] = { ...socials[i], url: e.target.value };
                            updateNav({ socials });
                          }}
                          className={smallInputClass}
                          placeholder="URL"
                        />
                        <button onClick={() => {
                          updateNav({ socials: (nav.socials || []).filter((_, j) => j !== i) });
                        }} className="text-[#999] hover:text-red-500">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => updateNav({ socials: [...(nav.socials || []), { network: "instagram", url: "" }] })}
                      className="text-[10px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
                    >
                      + Ajouter un réseau
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ STYLE / OPTIONS SECTION ═══ */}
            {navSection === "style" && (
              <>
                {/* Background mode */}
                <div>
                  <label className={sectionLabel}>Fond</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: "solid", label: "Solide" },
                      { value: "blur", label: "Flou" },
                      { value: "transparent", label: "Transparent" },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateNav({ bgMode: opt.value })}
                        className={`py-1.5 text-[10px] font-semibold rounded-md border transition-all ${
                          nav.bgMode === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#999] hover:border-[#C5C5C3]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sticky */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#666]">Sticky (fixée en haut)</span>
                  <ToggleSwitch value={nav.sticky ?? true} onChange={(v) => updateNav({ sticky: v })} />
                </div>

                {/* Border */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#666]">Bordure inférieure</span>
                  <ToggleSwitch value={nav.showBorder ?? true} onChange={(v) => updateNav({ showBorder: v })} />
                </div>

                {/* Shadow */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#666]">Ombre portée</span>
                  <ToggleSwitch value={nav.showShadow ?? false} onChange={(v) => updateNav({ showShadow: v })} />
                </div>

                {/* Density */}
                <div>
                  <label className={sectionLabel}>Densité</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: "compact", label: "Compact" },
                      { value: "default", label: "Normal" },
                      { value: "spacious", label: "Spacieux" },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateNav({ density: opt.value })}
                        className={`py-1.5 text-[10px] font-semibold rounded-md border transition-all ${
                          (nav.density || "default") === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#999] hover:border-[#C5C5C3]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Container width */}
                <div>
                  <label className={sectionLabel}>Largeur</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: "narrow", label: "Étroite" },
                      { value: "boxed", label: "Normale" },
                      { value: "full", label: "Pleine" },
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateNav({ containerWidth: opt.value })}
                        className={`py-1.5 text-[10px] font-semibold rounded-md border transition-all ${
                          (nav.containerWidth || "boxed") === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#999] hover:border-[#C5C5C3]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {tab === "footer" && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Footer links */}
          <div>
            <label className={sectionLabel}>Liens</label>
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
                    onClick={() => updateFooter({ links: footer.links.filter((_, j) => j !== i) })}
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
            <label className={sectionLabel}>Copyright</label>
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
            <label className={sectionLabel}>Réseaux sociaux</label>
            <div className="flex items-center gap-2 mb-2">
              <ToggleSwitch value={footer.showSocials} onChange={(v) => updateFooter({ showSocials: v })} />
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
        </div>
      )}
    </div>
  );
}

// ─── Toggle Switch component ───

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-8 h-4 rounded-full transition-all relative ${value ? "bg-[#4F46E5]" : "bg-gray-300"}`}
    >
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${value ? "left-4" : "left-0.5"}`} />
    </button>
  );
}
