"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Palette,
  ShoppingBag,
  Users,
  BarChart3,
  CalendarDays,
  CheckSquare,
  Settings,
  X,
  Menu,
} from "lucide-react";

// ── Navigation config (mirrored from Sidebar.tsx) ──────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Vue d'ensemble",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.7} /> },
      { label: "Site web", href: "/site-web", icon: <Globe size={18} strokeWidth={1.7} /> },
      { label: "Analytics", href: "/analytics", icon: <BarChart3 size={18} strokeWidth={1.7} /> },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Commandes", href: "/commandes", icon: <ShoppingBag size={18} strokeWidth={1.7} /> },
      { label: "Clients", href: "/clients", icon: <Users size={18} strokeWidth={1.7} /> },
      { label: "Facturation", href: "/facturation", icon: <FileText size={18} strokeWidth={1.7} /> },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Projets", href: "/projets", icon: <Palette size={18} strokeWidth={1.7} /> },
      { label: "Tâches", href: "/taches", icon: <CheckSquare size={18} strokeWidth={1.7} /> },
      { label: "Calendrier", href: "/calendrier", icon: <CalendarDays size={18} strokeWidth={1.7} /> },
    ],
  },
];

const bottomNav: NavItem[] = [
  { label: "Paramètres", href: "/parametres", icon: <Settings size={18} strokeWidth={1.7} /> },
];

// ── Component ──────────────────────────────────────────────────────
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const close = useCallback(() => setOpen(false), []);

  // Fermer sur Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // Scroll lock du body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fermer automatiquement lors d'un changement de route
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <>
      {/* Bouton hamburger — visible uniquement sous lg */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors cursor-pointer"
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/20 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[280px] bg-white border-r border-[#E6E6E4] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={close}>
            <div className="w-8 h-8 rounded-[10px] bg-white ring-1 ring-[#E8E8E6] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center">
              <Image
                src="/logo-color.png"
                alt="Jestly"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="text-[15px] font-bold text-[#191919] tracking-[-0.01em]">
              Jestly
            </span>
          </Link>
          <button
            type="button"
            onClick={close}
            className="flex items-center justify-center w-8 h-8 rounded-md text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-colors cursor-pointer"
            aria-label="Fermer le menu"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-[#B0B0AE] uppercase tracking-[0.06em]">
                {group.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#F0EEFF] text-[#6D28D9]"
                          : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-150 ${
                          active
                            ? "text-[#7C3AED]"
                            : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Paramètres */}
          <div>
            <div className="h-px bg-[#F0F0EE] mx-1 mb-2" />
            <div className="flex flex-col gap-0.5">
              {bottomNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-[#F0EEFF] text-[#6D28D9]"
                        : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                    }`}
                  >
                    <span
                      className={`transition-colors duration-150 ${
                        active
                          ? "text-[#7C3AED]"
                          : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
