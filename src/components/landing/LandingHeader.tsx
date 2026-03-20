"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import TextSwapButton from "@/components/ui/TextSwapButton";

/* ═══════════════════════════════════════════════════════════════════════
   LANDING HEADER — Glass navbar + mega menu system
   Extracted from landing/page.tsx for reuse across all /landing/* pages
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Data ─── */
const FEATURES = [
  { key: "site", title: "Site web", desc: "Créez un site freelance premium, rapide et personnalisable.", color: "#FF8A3D", bg: "#FFF2E8", iconPath: "M3 3h18v18H3zM3 9h18M9 21V9", href: "/landing/site-web" },
  { key: "crm", title: "CRM clients", desc: "Centralisez vos prospects, clients, échanges et suivis.", color: "#EC4899", bg: "#FDF2F8", iconPath: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", href: "/landing/crm" },
  { key: "agenda", title: "Agenda", desc: "Planifiez vos rendez-vous, deadlines et disponibilités.", color: "#4C8DFF", bg: "#EAF3FF", iconPath: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18", href: "/landing/agenda" },
  { key: "facturation", title: "Facturation", desc: "Pilotez devis, paiements, relances et santé financière.", color: "#22c55e", bg: "#ECFDF5", iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 14l2 2 4-4", href: "/landing/facturation" },
  { key: "analytics", title: "Analytics", desc: "Suivez vos performances, revenus et croissance en temps réel.", color: "#7c3aed", bg: "#EEE8FF", iconPath: "M3 3v18h18M7 16l4-8 4 4 5-9", href: "/landing/analytics" },
  { key: "commandes", title: "Commandes", desc: "Gérez vos projets, statuts, livraisons et CA.", color: "#F59E0B", bg: "#FEF9EC", iconPath: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42zM6 9a1 1 0 100-2 1 1 0 000 2", href: "/landing/commandes" },
  { key: "portfolio", title: "Portfolio", desc: "Présentez vos meilleurs projets avec une mise en scène premium.", color: "#A855F7", bg: "#F3E8FF", iconPath: "M4 4h16v16H4zM4 12h16M12 4v16", href: "/landing/portfolio" },
  { key: "paiements", title: "Paiements", desc: "Encaissez simplement avec une expérience client fluide.", color: "#10B981", bg: "#D1FAE5", iconPath: "M1 4h22v16H1zM1 10h22", href: "/landing/paiements" },
];

const SOLUTIONS = [
  { title: "Pour les créateurs", desc: "Monteurs, designers, photographes — un cockpit créatif complet.", icon: "✦", href: "/landing/pour-qui/createurs" },
  { title: "Pour les développeurs", desc: "Outils adaptés aux freelances tech et indie hackers.", icon: "⟨/⟩", href: "/landing/pour-qui/developpeurs" },
  { title: "Pour les designers", desc: "Portfolio, briefs, facturation — tout en un seul espace.", icon: "◇", href: "/landing/pour-qui/designers" },
  { title: "Pour les agences", desc: "Structurez vos projets multi-clients avec un système unifié.", icon: "▣", href: "/landing/pour-qui/agences" },
  { title: "Pour les consultants", desc: "Gérez missions, CRM et facturation en toute simplicité.", icon: "◎", href: "/landing/pour-qui/consultants" },
];

const RESOURCES = [
  { title: "Blog", desc: "Conseils et tendances pour freelances." },
  { title: "Centre d'aide", desc: "Guides et FAQ pour bien démarrer." },
  { title: "Templates", desc: "Modèles prêts à l'emploi." },
  { title: "Comparatifs", desc: "Jestly vs les outils existants." },
  { title: "Roadmap", desc: "Découvrez les prochaines fonctionnalités." },
  { title: "Contact", desc: "Parlez-nous directement." },
];

/* ─── Feature preview ─── */
function FeaturePreview({ feature }: { feature: typeof FEATURES[0] }) {
  const previews: Record<string, React.ReactNode> = {
    site: (<div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${feature.color}20` }}><div className="h-5 flex items-center px-2 gap-1" style={{ background: feature.bg }}><div className="w-[6px] h-[6px] rounded-full bg-[#FF6159]" /><div className="w-[6px] h-[6px] rounded-full bg-[#FFBF2F]" /><div className="w-[6px] h-[6px] rounded-full bg-[#2ACB42]" /></div><div className="p-3 bg-white space-y-2"><div className="h-8 rounded-lg" style={{ background: feature.bg }} /><div className="grid grid-cols-3 gap-1.5">{[0,1,2].map(i => <div key={i} className="h-6 rounded" style={{ background: i === 0 ? feature.bg : "#F5F5F5" }} />)}</div><div className="h-5 w-20 rounded-md" style={{ background: feature.color }} /></div></div>),
    crm: (<div className="space-y-2">{["Emma R.", "Marc D.", "Julie L."].map((n, i) => (<div key={n} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: i === 0 ? feature.bg : "#FAFAFA" }}><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: feature.color }}>{n[0]}</div><div><div className="text-[11px] font-semibold text-[#111]">{n}</div><div className="text-[9px] text-[#8A8FA3]">{i === 0 ? "Nouveau lead" : "Client actif"}</div></div></div>))}</div>),
    agenda: (<div className="space-y-2"><div className="grid grid-cols-5 gap-1">{Array.from({length: 10}).map((_, i) => (<div key={i} className="aspect-square rounded text-[8px] flex items-center justify-center" style={{ background: i === 3 ? feature.color : feature.bg, color: i === 3 ? "white" : feature.color, fontWeight: i === 3 ? 700 : 400 }}>{i + 10}</div>))}</div><div className="p-2 rounded-lg" style={{ background: feature.bg }}><div className="text-[10px] font-semibold" style={{ color: feature.color }}>Call client — 14h</div></div></div>),
    facturation: (<div className="space-y-2"><div className="p-2.5 rounded-lg" style={{ background: feature.bg }}><div className="text-[9px] text-[#8A8FA3]">CA</div><div className="text-[18px] font-bold text-[#111]">2 870 €</div></div>{["Facture #042 — 1 200 €", "Facture #043 — 870 €"].map(f => (<div key={f} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: "#FAFAFA" }}><div className="w-1.5 h-4 rounded-full" style={{ background: feature.color }} /><span className="text-[10px] text-[#444]">{f}</span></div>))}</div>),
    analytics: (<div className="space-y-2"><div className="flex items-end gap-[3px] h-10 p-2 rounded-lg" style={{ background: feature.bg }}>{[35,55,45,70,60,85,72].map((h, i) => <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i >= 5 ? feature.color : `${feature.color}20` }} />)}</div><div className="flex gap-2"><div className="flex-1 p-2 rounded-lg" style={{ background: "#FAFAFA" }}><div className="text-[8px] text-[#8A8FA3]">Revenus</div><div className="text-[13px] font-bold text-[#111]">4 280 €</div></div><div className="flex-1 p-2 rounded-lg" style={{ background: "#FAFAFA" }}><div className="text-[8px] text-[#8A8FA3]">Croissance</div><div className="text-[13px] font-bold" style={{ color: feature.color }}>+32%</div></div></div></div>),
    commandes: (<div className="space-y-1.5">{[{ t: "Logo Pack", s: "Livré" }, { t: "Video Edit", s: "En cours" }, { t: "Brand Kit", s: "Nouveau" }].map(o => (<div key={o.t} className="flex items-center justify-between px-2.5 py-2 rounded-lg" style={{ background: "#FAFAFA" }}><span className="text-[10px] font-medium text-[#333]">{o.t}</span><span className="text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: o.s === "Livré" ? "#D1FAE5" : o.s === "En cours" ? feature.bg : "#F3F4F6", color: o.s === "Livré" ? "#16a34a" : o.s === "En cours" ? feature.color : "#9CA3AF" }}>{o.s}</span></div>))}</div>),
    portfolio: (<div className="space-y-2"><div className="rounded-xl p-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${feature.bg}, ${feature.color}15)` }}><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold" style={{ color: feature.color }}>Projet vedette</span><span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: `${feature.color}18`, color: feature.color }}>UI Design</span></div><div className="h-14 rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${feature.color}25, ${feature.color}10)` }} /><div className="h-1.5 rounded w-3/4 mb-1" style={{ background: `${feature.color}20` }} /><div className="h-1 rounded w-1/2" style={{ background: `${feature.color}12` }} /></div><div className="grid grid-cols-2 gap-2">{[{ tag: "Branding", accent: true }, { tag: "Motion", accent: false }].map((p) => (<div key={p.tag} className="rounded-xl p-2.5" style={{ background: p.accent ? "#FAFAFE" : "#F8F8FC" }}><div className="h-8 rounded-lg mb-1.5" style={{ background: p.accent ? `${feature.color}12` : "#F0EEF5" }} /><div className="h-1 rounded w-3/4 mb-1" style={{ background: "#E5E3EC" }} /><span className="text-[7px] font-semibold px-1 py-0.5 rounded" style={{ background: p.accent ? feature.bg : "#F0EEF5", color: p.accent ? feature.color : "#8A8FA3" }}>{p.tag}</span></div>))}</div></div>),
    paiements: (<div className="space-y-2"><div className="p-3 rounded-lg" style={{ background: feature.bg }}><div className="text-[10px] font-semibold" style={{ color: feature.color }}>Checkout Jestly</div><div className="mt-1.5 h-6 rounded-md bg-white border flex items-center justify-center" style={{ borderColor: `${feature.color}30` }}><span className="text-[8px] text-[#8A8FA3]">•••• •••• •••• 4242</span></div></div><div className="h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: feature.color }}>Payer 350 €</div></div>),
  };

  return (
    <motion.div key={feature.key} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }} className="h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: feature.bg }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={feature.iconPath} /></svg></div>
        <div><div className="text-[13px] font-semibold text-[#111118]">{feature.title}</div><div className="text-[10px] text-[#8A8FA3]">Aperçu du module</div></div>
      </div>
      <div className="flex-1">{previews[feature.key]}</div>
    </motion.div>
  );
}

/* ─── Drawers ─── */
function FeaturesDrawer({ hoveredIdx, onHover, onClose }: { hoveredIdx: number; onHover: (i: number) => void; onClose: () => void }) {
  return (
    <div className="flex p-6 gap-6" style={{ minHeight: 420 }}>
      <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1 content-start">
        <div className="col-span-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8FA3] mb-2 px-3">Fonctionnalités</div>
        {FEATURES.map((f, i) => (
          <Link key={f.key} href={f.href} onClick={onClose} className="flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200" style={{ background: hoveredIdx === i ? f.bg : "transparent" }} onMouseEnter={() => onHover(i)}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200" style={{ background: hoveredIdx === i ? `${f.color}18` : f.bg }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.iconPath} /></svg></div>
            <div><div className="text-[13px] font-semibold text-[#111118] leading-tight">{f.title}</div><div className="text-[11px] text-[#8A8FA3] leading-snug mt-0.5">{f.desc}</div></div>
          </Link>
        ))}
      </div>
      <div className="w-[280px] flex-shrink-0 rounded-2xl p-5" style={{ background: "linear-gradient(180deg, #FAFAFE, #F5F4FA)", border: "1px solid rgba(20,20,30,0.04)" }}>
        <AnimatePresence mode="wait"><FeaturePreview feature={FEATURES[hoveredIdx]} /></AnimatePresence>
      </div>
    </div>
  );
}

function SolutionsDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex p-6 gap-6">
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8FA3] mb-3 px-3">Solutions</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {SOLUTIONS.map((s) => (
            <Link key={s.title} href={s.href} onClick={onClose} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-[#F7F7FB] transition-colors duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#EEE8FF] flex items-center justify-center flex-shrink-0 text-[13px]">{s.icon}</div>
              <div><div className="text-[13px] font-semibold text-[#111118]">{s.title}</div><div className="text-[11px] text-[#8A8FA3] leading-snug mt-0.5">{s.desc}</div></div>
            </Link>
          ))}
        </div>
      </div>
      <div className="w-[260px] flex-shrink-0 rounded-2xl p-6 flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #EEE8FF, #F3F0FF)", border: "1px solid rgba(124,58,237,0.08)" }}>
        <div><div className="text-[15px] font-bold text-[#111118] leading-snug mb-2">Tout votre business freelance dans un seul cockpit</div><div className="text-[12px] text-[#66697A] leading-relaxed">Remplacez 10 outils par un système unifié, pensé pour les créatifs indépendants.</div></div>
        <Link href="/landing/site-web" onClick={onClose} className="cta-gloss relative mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-4 py-2 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-[1px] active:scale-[0.98]" style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)", boxShadow: "0 4px 14px rgba(124,58,237,0.25)" }}>
          <span className="relative z-10 flex items-center gap-1.5">Voir comment ça marche <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
        </Link>
      </div>
    </div>
  );
}

function ResourcesDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex p-6 gap-6">
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8A8FA3] mb-3 px-3">Ressources</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {RESOURCES.map((r) => (
            <span key={r.title} onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F7F7FB] transition-colors duration-200 cursor-default opacity-60" title="Bientôt disponible">
              <div className="w-8 h-8 rounded-lg bg-[#F5F4FA] flex items-center justify-center flex-shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8FA3" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg></div>
              <div><div className="text-[13px] font-semibold text-[#111118]">{r.title}</div><div className="text-[11px] text-[#8A8FA3] mt-0.5">{r.desc}</div></div>
            </span>
          ))}
        </div>
      </div>
      <div className="w-[260px] flex-shrink-0 rounded-2xl p-6 flex flex-col justify-between" style={{ background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)", border: "1px solid rgba(34,197,94,0.08)" }}>
        <div><div className="text-[15px] font-bold text-[#111118] leading-snug mb-2">Découvrir les meilleures pratiques</div><div className="text-[12px] text-[#66697A] leading-relaxed">Guides, templates et conseils pour lancer votre activité freelance.</div></div>
        <span className="cta-gloss relative mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white px-4 py-2 rounded-xl overflow-hidden cursor-default opacity-60" style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)", boxShadow: "0 4px 14px rgba(34,197,94,0.25)" }} title="Bientôt disponible">
          <span className="relative z-10 flex items-center gap-1.5">Explorer les ressources <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></span>
        </span>
      </div>
    </div>
  );
}

/* ─── Main Header ─── */
type MenuKey = "features" | "solutions" | "resources" | null;

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [hoveredFeature, setHoveredFeature] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Fermer le menu mobile sur changement de route
  useEffect(() => { closeMobile(); }, [pathname, closeMobile]);

  // Scroll lock quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Fermer sur Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeMobile(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (activeMenu) {
      const fn = () => setActiveMenu(null);
      window.addEventListener("scroll", fn, { passive: true });
      return () => window.removeEventListener("scroll", fn);
    }
  }, [activeMenu]);

  const handleEnterNav = (menu: MenuKey) => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    setActiveMenu(menu);
    if (menu === "features") setHoveredFeature(0);
  };
  const handleLeaveZone = () => { closeTimer.current = setTimeout(() => setActiveMenu(null), 120); };
  const handleEnterZone = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };

  const NAV_ITEMS: { label: string; menu: MenuKey; href?: string }[] = [
    { label: "Fonctionnalités", menu: "features" },
    { label: "Pour qui ?", menu: "solutions" },
    { label: "Tarifs", menu: null, href: "/landing#pricing" },
    { label: "Ressources", menu: "resources" },
  ];

  return (
    <>
      <AnimatePresence>
        {activeMenu && (
          <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} onClick={() => setActiveMenu(null)} />
        )}
      </AnimatePresence>

      <motion.header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-5" initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease }}>
        <div className="w-full flex flex-col items-center" style={{ maxWidth: 1100 }} onMouseEnter={handleEnterZone} onMouseLeave={handleLeaveZone}>
        <div className="flex items-center justify-between w-full transition-all duration-500" style={{ maxWidth: 1100, height: 64, padding: "0 24px", borderRadius: 999, background: scrolled ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.10)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(124,58,237,0.22)", boxShadow: scrolled ? "0 12px 35px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.45)" : "0 8px 25px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.45)" }}>
          <Link href="/landing" className="flex items-center gap-2 group" onClick={() => setActiveMenu(null)}>
            <Image src="/logo-color.png" alt="Jestly" width={28} height={28} className="w-7 h-7 group-hover:scale-105 transition-transform" priority />
            <span className="text-[16px] font-bold text-[#111118] tracking-tight">Jestly</span>
          </Link>

          <nav className="hidden lg:flex items-center relative">
            {NAV_ITEMS.map((item) => (
              item.href && !item.menu ? (
                <Link key={item.label} href={item.href} className="relative z-10 px-4 py-2 text-[13px] font-medium transition-colors duration-200 text-[#4b5563] hover:text-[#7c3aed]" onClick={() => setActiveMenu(null)}>{item.label}</Link>
              ) : (
                <button key={item.label} className={`relative z-10 px-4 py-2 text-[13px] font-medium transition-colors duration-200 flex items-center gap-1 ${activeMenu === item.menu && item.menu ? "text-[#7c3aed]" : "text-[#4b5563] hover:text-[#7c3aed]"}`} onMouseEnter={() => item.menu ? handleEnterNav(item.menu) : setActiveMenu(null)} onClick={() => { if (item.menu) setActiveMenu(activeMenu === item.menu ? null : item.menu); }}>
                  {item.label}
                  {item.menu && (<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="transition-transform duration-200" style={{ transform: activeMenu === item.menu ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M6 9l6 6 6-6" /></svg>)}
                </button>
              )
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-[#4b5563] hover:text-[#7c3aed] transition-colors hidden sm:block">Connexion</Link>
            <TextSwapButton label="Commencer" href="/login" variant="primary" size="sm" />
            {/* Bouton hamburger mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-[#4b5563] hover:text-[#7c3aed] transition-colors cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeMenu && (
            <motion.div key={activeMenu} className="w-full flex justify-center mt-3" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }}>
              <div className="w-full" style={{ maxWidth: 1100, borderRadius: 28, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(20,20,30,0.06)", boxShadow: "0 24px 80px rgba(80,70,130,0.12), 0 8px 24px rgba(0,0,0,0.06)" }}>
                {activeMenu === "features" && <FeaturesDrawer hoveredIdx={hoveredFeature} onHover={setHoveredFeature} onClose={() => setActiveMenu(null)} />}
                {activeMenu === "solutions" && <SolutionsDrawer onClose={() => setActiveMenu(null)} />}
                {activeMenu === "resources" && <ResourcesDrawer onClose={() => setActiveMenu(null)} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.header>

      {/* ── Menu mobile landing ── */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/20 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[300px] bg-white border-l border-[#E6E6E4] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header du drawer */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E6E6E4]">
          <span className="text-[15px] font-bold text-[#191919]">Menu</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex items-center justify-center w-8 h-8 rounded-md text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Liens de navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {NAV_ITEMS.filter(item => item.menu || item.href).map((item) => (
            <Link
              key={item.label}
              href={item.href || (item.menu === "features" ? "/landing/site-web" : item.menu === "solutions" ? "/landing/pour-qui/createurs" : "/landing")}
              onClick={closeMobile}
              className="flex items-center px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Sous-liens fonctionnalités */}
          <div className="pt-2">
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-[#B0B0AE] uppercase tracking-[0.06em]">
              Fonctionnalités
            </p>
            <div className="space-y-0.5">
              {FEATURES.map((f) => (
                <Link
                  key={f.key}
                  href={f.href}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors"
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: f.bg }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={f.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.iconPath} /></svg>
                  </div>
                  {f.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Sous-liens Solutions */}
          <div className="pt-2">
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-[#B0B0AE] uppercase tracking-[0.06em]">
              Solutions
            </p>
            <div className="space-y-0.5">
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.title}
                  href={s.href}
                  onClick={closeMobile}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-[#EEE8FF] flex items-center justify-center flex-shrink-0 text-[11px]">
                    {s.icon}
                  </div>
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* CTA en bas du drawer */}
        <div className="px-4 py-4 border-t border-[#E6E6E4] space-y-2">
          <Link
            href="/login"
            onClick={closeMobile}
            className="block text-center px-4 py-2.5 rounded-md border border-[#E6E6E4] text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/login"
            onClick={closeMobile}
            className="block text-center px-4 py-2.5 rounded-md bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
          >
            Commencer
          </Link>
        </div>
      </div>
    </>
  );
}
