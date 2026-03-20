"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import type { NavConfig, NavLink, NavSocialLink, FooterConfig, FooterLink, NavbarVariant, Block, SitePage } from "@/types";
import { getBlockLabel, inferDestinationType, validateNavLink } from "@/lib/site-utils";
import type { LinkValidation } from "@/lib/site-utils";
import { NAVBAR_VARIANTS, defaultNavConfig } from "@/components/site-web/navbar/NavbarRenderer";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const smallInputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 transition-all";
const sectionLabel = "block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2";
const selectClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-2 text-[12px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 transition-all";

function genId() { return Math.random().toString(36).slice(2, 9); }

type Tab = "nav" | "footer";
type NavSection = "variant" | "links" | "cta" | "socials" | "style";

// ═══════════════════════════════════════════════
// Validation message renderer
// ═══════════════════════════════════════════════

function ValidationMessage({ validation }: { validation: LinkValidation }) {
  if (validation.status === "valid" || !validation.message) return null;
  const isError = validation.status === "error";
  return (
    <p className={`text-[10px] mt-1 flex items-center gap-1 ${isError ? "text-red-500" : "text-amber-600"}`}>
      <span>{isError ? "⚠" : "●"}</span>
      {validation.message}
    </p>
  );
}

// ═══════════════════════════════════════════════
// Destination Type Picker — reusable for nav + footer links
// ═══════════════════════════════════════════════

const DEST_TYPES = [
  { value: "section" as const, label: "Section", icon: "↓", hint: "Scroll vers une section" },
  { value: "page" as const, label: "Page", icon: "◇", hint: "Vers une autre page" },
  { value: "external" as const, label: "Externe", icon: "↗", hint: "Lien externe" },
];

function DestinationPicker({
  link,
  pages,
  currentPageBlocks,
  onChange,
}: {
  link: NavLink | FooterLink;
  pages: SitePage[];
  currentPageBlocks: Block[];
  onChange: (patch: Partial<NavLink>) => void;
}) {
  const destType = inferDestinationType(link as NavLink);
  const visibleBlocks = currentPageBlocks.filter(b => b.visible);
  const validation = validateNavLink(link, pages, currentPageBlocks);

  const handleTypeChange = (newType: "section" | "page" | "external") => {
    // Clear irrelevant fields when switching type
    if (newType === "section") {
      onChange({ destinationType: newType, pageId: undefined, url: undefined, openNewTab: undefined, blockId: undefined });
    } else if (newType === "page") {
      onChange({ destinationType: newType, blockId: undefined, url: undefined, openNewTab: undefined });
    } else {
      onChange({ destinationType: newType, pageId: undefined, blockId: undefined, openNewTab: true });
    }
  };

  const handleSectionChange = (blockId: string) => {
    onChange({ blockId: blockId || undefined });
  };

  return (
    <div className="space-y-2">
      {/* Destination type tabs */}
      <div>
        <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Destination</span>
        <div className="flex gap-1 mt-1">
          {DEST_TYPES.map(dt => (
            <button
              key={dt.value}
              onClick={() => handleTypeChange(dt.value)}
              title={dt.hint}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                destType === dt.value
                  ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/30"
                  : "text-[#999] hover:text-[#666] hover:bg-[#F7F7F5] border border-transparent"
              }`}
            >
              <span className="text-[11px]">{dt.icon}</span>
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section destination ── */}
      {destType === "section" && (
        <div>
          {visibleBlocks.length === 0 ? (
            <p className="text-[11px] text-[#999] italic py-2">
              Aucune section visible sur cette page.
              Ajoutez des blocs pour pouvoir les cibler.
            </p>
          ) : (
            <select
              value={link.blockId || ""}
              onChange={(e) => handleSectionChange(e.target.value)}
              className={`${selectClass} ${
                validation.status === "error" ? "border-red-400 text-red-600" :
                validation.status === "warning" ? "border-amber-400" : ""
              }`}
            >
              <option value="">Choisir une section...</option>
              <option value="__top">↑ Haut de page</option>
              {visibleBlocks.map((b) => (
                <option key={b.id} value={b.id}>{getBlockLabel(b)}</option>
              ))}
            </select>
          )}
          <ValidationMessage validation={validation} />
        </div>
      )}

      {/* ── Page destination ── */}
      {destType === "page" && (
        <div>
          {pages.length === 0 ? (
            <p className="text-[11px] text-[#999] italic py-2">
              Aucune page disponible. Créez des pages dans le builder.
            </p>
          ) : (
            <select
              value={link.pageId || ""}
              onChange={(e) => onChange({ pageId: e.target.value || undefined })}
              className={`${selectClass} ${
                validation.status === "error" ? "border-red-400 text-red-600" :
                validation.status === "warning" ? "border-amber-400" : ""
              }`}
            >
              <option value="">Choisir une page...</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <ValidationMessage validation={validation} />
        </div>
      )}

      {/* ── External destination ── */}
      {destType === "external" && (
        <div className="space-y-1.5">
          <input
            type="url"
            value={(link as NavLink).url || ""}
            onChange={(e) => onChange({ url: e.target.value || undefined })}
            className={`${smallInputClass} ${
              validation.status === "warning" && (link as NavLink).url ? "border-amber-400" : ""
            }`}
            placeholder="https://calendly.com/..."
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(link as NavLink).openNewTab ?? true}
              onChange={(e) => onChange({ openNewTab: e.target.checked })}
              className="rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
            />
            <span className="text-[11px] text-[#666]">Ouvrir dans un nouvel onglet</span>
          </label>
          <ValidationMessage validation={validation} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Main Panel
// ═══════════════════════════════════════════════

export default function NavFooterEditorPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useBuilder();
  const [tab, setTab] = useState<Tab>("nav");
  const [navSection, setNavSection] = useState<NavSection>("variant");

  const nav: NavConfig = state.site.nav || defaultNavConfig();
  const footer: FooterConfig = state.site.footer || { links: [], showSocials: false, copyright: "" };

  // Current page blocks (for section targeting)
  const activePage = state.site.pages.find(p => p.id === state.activePageId);
  const currentPageBlocks = activePage?.blocks || [];

  // Count link warnings/errors for the "Liens" tab badge
  const linkIssueCount = nav.links.reduce((count, link) => {
    const v = validateNavLink(link, state.site.pages, currentPageBlocks);
    return count + (v.status !== "valid" ? 1 : 0);
  }, 0);

  const updateNav = (updates: Partial<NavConfig>) => {
    dispatch({ type: "UPDATE_NAV", nav: { ...nav, ...updates } });
  };

  const updateFooter = (updates: Partial<FooterConfig>) => {
    dispatch({ type: "UPDATE_FOOTER", footer: { ...footer, ...updates } });
  };

  const updateLink = (index: number, patch: Partial<NavLink>) => {
    const links = [...nav.links];
    links[index] = { ...links[index], ...patch };
    updateNav({ links });
  };

  const removeLink = (index: number) => {
    updateNav({ links: nav.links.filter((_, j) => j !== index) });
  };

  const addLink = () => {
    updateNav({ links: [...nav.links, { id: genId(), label: "Nouveau lien", destinationType: "section" }] });
  };

  const addChildLink = (parentIndex: number) => {
    const links = [...nav.links];
    const parent = { ...links[parentIndex] };
    parent.children = [...(parent.children || []), { id: genId(), label: "Sous-lien", destinationType: "section" }];
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

  const navSections: { id: NavSection; label: string; icon: string; badge?: number }[] = [
    { id: "variant", label: "Style", icon: "◆" },
    { id: "links", label: "Liens", icon: "≡", badge: linkIssueCount || undefined },
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
          <span className="text-[12px] font-semibold text-[#191919]">Navigation</span>
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
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap relative ${
                  navSection === s.id ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#999] hover:text-[#666] hover:bg-[#F7F7F5]"
                }`}
              >
                <span className="text-[11px]">{s.icon}</span>
                {s.label}
                {s.badge ? (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center font-bold">
                    {s.badge}
                  </span>
                ) : null}
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
                        <div className="text-[11px] font-semibold text-[#191919] mb-0.5">{v.name}</div>
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
                {nav.links.length === 0 ? (
                  <p className="text-[11px] text-[#999] italic py-3">
                    Aucun lien. Ajoutez votre premier lien de navigation.
                  </p>
                ) : null}
                <div className="space-y-3">
                  {nav.links.map((link, i) => {
                    const linkValidation = validateNavLink(link, state.site.pages, currentPageBlocks);
                    const hasIssue = linkValidation.status !== "valid";
                    return (
                      <div
                        key={link.id || i}
                        className={`border rounded-lg p-3 space-y-2.5 ${
                          hasIssue
                            ? "border-amber-300 bg-amber-50/30"
                            : "border-[#E6E6E4] bg-[#FAFAFA]"
                        }`}
                      >
                        {/* Header row: reorder + label + delete */}
                        <div className="flex items-center gap-1.5">
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
                            placeholder="Nom du lien"
                          />
                          <button onClick={() => removeLink(i)} className="text-[#999] hover:text-red-500 flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>

                        {/* Destination picker */}
                        <DestinationPicker
                          link={link}
                          pages={state.site.pages}
                          currentPageBlocks={currentPageBlocks}

                          onChange={(patch) => updateLink(i, patch)}
                        />

                        {/* Dropdown children */}
                        {link.children && link.children.length > 0 && (
                          <div className="pl-4 space-y-2.5 border-l-2 border-[#E6E6E4] ml-2 pt-1">
                            <span className="text-[9px] text-[#BBB] font-semibold uppercase">Sous-liens</span>
                            {link.children.map((child, j) => (
                              <div key={child.id || j} className="space-y-2 bg-white rounded-md p-2 border border-[#EFEFEF]">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={child.label}
                                    onChange={(e) => updateChildLink(i, j, { label: e.target.value })}
                                    className={smallInputClass}
                                    placeholder="Nom du sous-lien"
                                  />
                                  <button onClick={() => removeChildLink(i, j)} className="text-[#BBB] hover:text-red-500">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                  </button>
                                </div>
                                <DestinationPicker
                                  link={child}
                                  pages={state.site.pages}
                                  currentPageBlocks={currentPageBlocks}
        
                                  onChange={(patch) => updateChildLink(i, j, patch)}
                                />
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
                    );
                  })}
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
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={nav.ctaLabel}
                        onChange={(e) => updateNav({ ctaLabel: e.target.value })}
                        className={inputClass}
                        placeholder="Texte du CTA"
                      />
                      <DestinationPicker
                        link={{
                          label: nav.ctaLabel,
                          destinationType: nav.ctaDestinationType,
                          pageId: nav.ctaPageId,
                          blockId: nav.ctaBlockId,
                          url: nav.ctaUrl,
                          openNewTab: nav.ctaOpenNewTab,
                        }}
                        pages={state.site.pages}
                        currentPageBlocks={activePage?.blocks || []}
                        onChange={(patch) => updateNav({
                          ctaDestinationType: patch.destinationType ?? nav.ctaDestinationType,
                          ctaPageId: patch.pageId !== undefined ? patch.pageId : nav.ctaPageId,
                          ctaBlockId: patch.blockId !== undefined ? patch.blockId : nav.ctaBlockId,
                          ctaUrl: patch.url !== undefined ? patch.url : nav.ctaUrl,
                          ctaOpenNewTab: patch.openNewTab !== undefined ? patch.openNewTab : nav.ctaOpenNewTab,
                        })}
                      />
                    </div>
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
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={nav.secondaryCtaLabel || ""}
                        onChange={(e) => updateNav({ secondaryCtaLabel: e.target.value })}
                        className={inputClass}
                        placeholder="Texte du bouton secondaire"
                      />
                      <DestinationPicker
                        link={{
                          label: nav.secondaryCtaLabel || "",
                          destinationType: nav.secondaryCtaDestinationType,
                          pageId: nav.secondaryCtaPageId,
                          blockId: nav.secondaryCtaBlockId,
                          url: nav.secondaryCtaUrl,
                          openNewTab: nav.secondaryCtaOpenNewTab,
                        }}
                        pages={state.site.pages}
                        currentPageBlocks={activePage?.blocks || []}
                        onChange={(patch) => updateNav({
                          secondaryCtaDestinationType: patch.destinationType ?? nav.secondaryCtaDestinationType,
                          secondaryCtaPageId: patch.pageId !== undefined ? patch.pageId : nav.secondaryCtaPageId,
                          secondaryCtaBlockId: patch.blockId !== undefined ? patch.blockId : nav.secondaryCtaBlockId,
                          secondaryCtaUrl: patch.url !== undefined ? patch.url : nav.secondaryCtaUrl,
                          secondaryCtaOpenNewTab: patch.openNewTab !== undefined ? patch.openNewTab : nav.secondaryCtaOpenNewTab,
                        })}
                      />

                      {/* Secondary CTA Colors */}
                      <div>
                        <label className={sectionLabel}>Couleur du bouton secondaire</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={nav.secondaryCtaBgColor || "transparent"} onChange={(e) => updateNav({ secondaryCtaBgColor: e.target.value })} className="w-8 h-8 rounded-md border border-[#E6E6E4] cursor-pointer p-0.5" />
                          <input type="text" value={nav.secondaryCtaBgColor || ""} onChange={(e) => updateNav({ secondaryCtaBgColor: e.target.value || undefined })} className={smallInputClass} placeholder="Fond (ex: transparent)" />
                          <button onClick={() => updateNav({ secondaryCtaBgColor: undefined })} className="text-[9px] text-[#999] hover:text-[#666] whitespace-nowrap" title="Réinitialiser">Reset</button>
                        </div>
                      </div>
                      <div>
                        <label className={sectionLabel}>Texte du bouton secondaire</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={nav.secondaryCtaTextColor || "#191919"} onChange={(e) => updateNav({ secondaryCtaTextColor: e.target.value })} className="w-8 h-8 rounded-md border border-[#E6E6E4] cursor-pointer p-0.5" />
                          <input type="text" value={nav.secondaryCtaTextColor || ""} onChange={(e) => updateNav({ secondaryCtaTextColor: e.target.value || undefined })} className={smallInputClass} placeholder="Couleur texte" />
                          <button onClick={() => updateNav({ secondaryCtaTextColor: undefined })} className="text-[9px] text-[#999] hover:text-[#666] whitespace-nowrap" title="Réinitialiser">Reset</button>
                        </div>
                      </div>
                      <div>
                        <label className={sectionLabel}>Bordure du bouton secondaire</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={nav.secondaryCtaBorderColor || "#E6E6E4"} onChange={(e) => updateNav({ secondaryCtaBorderColor: e.target.value })} className="w-8 h-8 rounded-md border border-[#E6E6E4] cursor-pointer p-0.5" />
                          <input type="text" value={nav.secondaryCtaBorderColor || ""} onChange={(e) => updateNav({ secondaryCtaBorderColor: e.target.value || undefined })} className={smallInputClass} placeholder="Couleur bordure" />
                          <button onClick={() => updateNav({ secondaryCtaBorderColor: undefined })} className="text-[9px] text-[#999] hover:text-[#666] whitespace-nowrap" title="Réinitialiser">Reset</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Style */}
                {nav.showCta && (
                  <>
                    <div>
                      <label className={sectionLabel}>Style du bouton</label>
                      <div className="grid grid-cols-4 gap-1">
                        {([
                          { value: "filled", label: "Plein" },
                          { value: "outline", label: "Contour" },
                          { value: "soft", label: "Doux" },
                          { value: "ghost", label: "Texte" },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateNav({ ctaStyle: opt.value })}
                            className={`py-1.5 text-[9px] font-semibold rounded-md border transition-all ${
                              (nav.ctaStyle || "filled") === opt.value
                                ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                                : "border-[#E6E6E4] text-[#999] hover:border-[#C5C5C3]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CTA Colors */}
                    <div>
                      <label className={sectionLabel}>Couleur du bouton</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={nav.ctaBgColor || "#4F46E5"}
                          onChange={(e) => updateNav({ ctaBgColor: e.target.value })}
                          className="w-8 h-8 rounded-md border border-[#E6E6E4] cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={nav.ctaBgColor || ""}
                          onChange={(e) => updateNav({ ctaBgColor: e.target.value || undefined })}
                          className={smallInputClass}
                          placeholder="Couleur (ex: #4F46E5)"
                        />
                        <button
                          onClick={() => updateNav({ ctaBgColor: undefined })}
                          className="text-[9px] text-[#999] hover:text-[#666] whitespace-nowrap"
                          title="Réinitialiser"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={sectionLabel}>Couleur du texte</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={nav.ctaTextColor || "#FFFFFF"}
                          onChange={(e) => updateNav({ ctaTextColor: e.target.value })}
                          className="w-8 h-8 rounded-md border border-[#E6E6E4] cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={nav.ctaTextColor || ""}
                          onChange={(e) => updateNav({ ctaTextColor: e.target.value || undefined })}
                          className={smallInputClass}
                          placeholder="Couleur texte (ex: #FFFFFF)"
                        />
                        <button
                          onClick={() => updateNav({ ctaTextColor: undefined })}
                          className="text-[9px] text-[#999] hover:text-[#666] whitespace-nowrap"
                          title="Réinitialiser"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Border radius */}
                    <div>
                      <label className={sectionLabel}>Arrondi du bouton</label>
                      <div className="grid grid-cols-4 gap-1">
                        {([
                          { value: "4px", label: "Carré" },
                          { value: "8px", label: "Normal" },
                          { value: "12px", label: "Arrondi" },
                          { value: "9999px", label: "Pilule" },
                        ] as const).map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateNav({ ctaBorderRadius: opt.value })}
                            className={`py-1.5 text-[9px] font-semibold rounded-md border transition-all ${
                              (nav.ctaBorderRadius || "8px") === opt.value
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
            <div className="space-y-3">
              {footer.links.map((link, i) => (
                <div key={i} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2.5 bg-[#FAFAFA]">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const links = [...footer.links];
                        links[i] = { ...links[i], label: e.target.value };
                        updateFooter({ links });
                      }}
                      className={smallInputClass}
                      placeholder="Nom du lien"
                    />
                    <button
                      onClick={() => updateFooter({ links: footer.links.filter((_, j) => j !== i) })}
                      className="text-[#999] hover:text-red-500 flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <DestinationPicker
                    link={link}
                    pages={state.site.pages}
                    currentPageBlocks={currentPageBlocks}
                    onChange={(patch) => {
                      const links = [...footer.links];
                      links[i] = { ...links[i], ...patch };
                      updateFooter({ links });
                    }}
                  />
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
