"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "@/lib/auth/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useTrack } from "@/lib/hooks/use-track";
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
  LogOut,
  Sparkles,
  ChevronRight,
  Shield,
  UserPlus,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Headphones,
  ChevronsUpDown,
} from "lucide-react";

// ── Navigation config ─────────────────────────────────────────────
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

// ── User profile type ──
interface UserProfile {
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro";
  subdomain: string | null;
  is_admin: boolean;
}

// ── Account Menu ─────────────────────────────────────────────────

function AccountMenu({ user, open, onClose, triggerRef }: {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose, triggerRef]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const initials = (user.full_name || "")
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const displayName = user.full_name || user.email?.split("@")[0] || "Utilisateur";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" as const }}
          className="absolute bottom-full left-0 right-0 mb-2 mx-2 z-50"
        >
          <div className="bg-white rounded-xl border border-[#E6E6E4] shadow-lg shadow-black/8 overflow-hidden">

            {/* ── Header ── */}
            <div className="px-4 py-3.5 border-b border-[#F0F0EE]">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-[#EDE9FE] ring-1 ring-[#E8E5F5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user.avatar_url ? (
                    <Image src={user.avatar_url} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="text-[13px] font-bold text-[#7C3AED]">{initials}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#191919] truncate">{displayName}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full flex-shrink-0 ${
                      user.plan === "pro"
                        ? "bg-[#7C3AED] text-white"
                        : "bg-[#F0F0EE] text-[#8A8A88]"
                    }`}>
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A8A29E] truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* ── Navigation principale ── */}
            <div className="py-1.5 px-1.5">
              <MenuLink href="/parametres" icon={<Settings size={15} strokeWidth={1.7} />} label="Paramètres" onClick={onClose} />
              <MenuLink href="/parametres#abonnement" icon={<CreditCard size={15} strokeWidth={1.7} />} label="Abonnement" onClick={onClose} />
              <MenuLink href="/support" icon={<Headphones size={15} strokeWidth={1.7} />} label="Support" onClick={onClose} />
              <MenuLink href="/guide" icon={<HelpCircle size={15} strokeWidth={1.7} />} label="Guide" onClick={onClose} />
              <MenuButton icon={<MessageCircle size={15} strokeWidth={1.7} />} label="Discord" onClick={() => { window.open("https://discord.gg/jestly", "_blank"); onClose(); }} external />
            </div>

            {/* ── Déconnexion ── */}
            <div className="h-px bg-[#F0F0EE] mx-1.5" />
            <div className="py-1.5 px-1.5">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#A8A29E] hover:text-red-600 hover:bg-red-50/60 transition-all duration-150 cursor-pointer"
                >
                  <LogOut size={15} strokeWidth={1.7} />
                  <span>Se déconnecter</span>
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuLink({ href, icon, label, onClick }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-all duration-150"
    >
      <span className="text-[#ACACAA]">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MenuButton({ icon, label, onClick, external, disabled, hint }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  external?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        disabled
          ? "text-[#D6D3D1] cursor-default"
          : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] cursor-pointer"
      }`}
    >
      <span className={disabled ? "text-[#E6E6E4]" : "text-[#ACACAA]"}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {hint && (
        <span className="text-[9px] font-semibold text-[#C4C4C2] bg-[#F5F5F4] px-1.5 py-[1px] rounded-full">{hint}</span>
      )}
      {external && !disabled && (
        <ChevronRight size={12} className="text-[#D6D3D1]" />
      )}
    </button>
  );
}

// ── Component ─────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const track = useTrack();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.email) {
          setUser({
            email: d.email,
            full_name: d.full_name || null,
            business_name: d.business_name || null,
            avatar_url: d.avatar_url || null,
            plan: d.plan || "free",
            subdomain: d.subdomain || null,
            is_admin: d.is_admin || false,
          });
          if (d.is_admin) setIsAdminUser(true);
        }
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const initials = user
    ? (user.full_name || "")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || user.email?.charAt(0).toUpperCase() || "?"
    : "?";

  const displayName = user?.full_name || user?.email?.split("@")[0] || "...";

  return (
    <aside className="hidden lg:flex flex-col w-[264px] h-screen flex-shrink-0 bg-white border-r border-[#F0F0EE] select-none">

      {/* ── Logo header ── */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-[10px] bg-white ring-1 ring-[#E8E8E6] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-center flex-shrink-0">
            <Image
              src="/logo-color.png"
              alt="Jestly"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <span className="text-[16px] font-bold text-[#191919] tracking-[-0.01em]">
            Jestly
          </span>
        </Link>
      </div>

      {/* ── Navigation ── */}
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
                    className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-[#F0EEFF] text-[#6D28D9]"
                        : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                    }`}
                  >
                    <span className={`transition-colors duration-150 ${
                      active
                        ? "text-[#7C3AED]"
                        : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                    }`}>
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

        {/* Admin section (conditional) */}
        {isAdminUser && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-[#B0B0AE] uppercase tracking-[0.06em]">
              Admin
            </p>
            <div className="flex flex-col gap-0.5">
              {[
                { label: "Dashboard", href: "/admin", icon: <Shield size={18} strokeWidth={1.7} /> },
                { label: "Waitlist", href: "/admin/waitlist", icon: <UserPlus size={18} strokeWidth={1.7} /> },
              ].map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-[#F0EEFF] text-[#6D28D9]"
                        : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                    }`}
                  >
                    <span className={`transition-colors duration-150 ${
                      active
                        ? "text-[#7C3AED]"
                        : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                    }`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Paramètres — séparé en bas de la nav */}
        <div>
          <div className="h-px bg-[#F0F0EE] mx-1 mb-2" />
          <div className="flex flex-col gap-0.5">
            {bottomNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-[#F0EEFF] text-[#6D28D9]"
                      : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                  }`}
                >
                  <span className={`transition-colors duration-150 ${
                    active
                      ? "text-[#7C3AED]"
                      : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                  }`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Upgrade CTA ── */}
      {(!user || user.plan !== "pro") && (
        <div className="px-3 py-3">
          <div onClick={() => track("upgrade_clicked", { source: "sidebar" })} className="rounded-xl border border-[#E8E5F5] bg-[#FAFAFF] p-3.5 group/cta hover:border-[#D4CEF0] hover:bg-[#F5F3FF] transition-all duration-200 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED] flex-shrink-0">
                <Sparkles size={16} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[12px] font-semibold text-[#191919]">Passer au Pro</span>
                <span className="block text-[11px] text-[#8A8A88] mt-0.5">Débloquer tout le potentiel</span>
              </div>
              <ChevronRight size={14} className="text-[#CCCCCC] group-hover/cta:text-[#7C3AED] transition-colors flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* ── User footer with menu ── */}
      <div className="relative px-3 pb-4">
        {user && (
          <AccountMenu
            user={user}
            open={menuOpen}
            onClose={closeMenu}
            triggerRef={triggerRef}
          />
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
            menuOpen
              ? "bg-[#F0EEFF]"
              : "hover:bg-[#F7F7F5]"
          }`}
        >
          <div className="relative w-8 h-8 rounded-full bg-[#EDE9FE] ring-1 ring-[#E8E5F5] flex items-center justify-center text-[11px] font-semibold text-[#7C3AED] flex-shrink-0 overflow-hidden">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt="" fill className="object-cover" unoptimized />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-medium text-[#191919] truncate">{displayName}</div>
            <div className="text-[11px] text-[#ACACAA]">{user?.plan === "pro" ? "Pro" : "Free"}</div>
          </div>
          <ChevronsUpDown size={14} className={`flex-shrink-0 transition-colors duration-150 ${menuOpen ? "text-[#7C3AED]" : "text-[#D6D3D1]"}`} />
        </button>
      </div>
    </aside>
  );
}
