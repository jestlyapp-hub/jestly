"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  Package,
  Search,
  Mail,
  AlertTriangle,
  ScrollText,
  Shield,
  ArrowLeft,
  Megaphone,
  TrendingUp,
  Contact,
} from "lucide-react";

// ── Navigation admin ──────────────────────────────────────────────
type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} strokeWidth={1.7} /> },
  { label: "Utilisateurs", href: "/admin/users", icon: <Users size={18} strokeWidth={1.7} /> },
  { label: "Waitlist", href: "/admin/waitlist", icon: <UserPlus size={18} strokeWidth={1.7} /> },
  { label: "Campagnes", href: "/admin/campaigns", icon: <Megaphone size={18} strokeWidth={1.7} /> },
  { label: "Leads CRM", href: "/admin/leads", icon: <Contact size={18} strokeWidth={1.7} /> },
  { label: "Growth", href: "/admin/growth", icon: <TrendingUp size={18} strokeWidth={1.7} /> },
  { label: "Email Campaigns", href: "/admin/email-campaigns", icon: <Mail size={18} strokeWidth={1.7} /> },
  { label: "Billing", href: "/admin/billing", icon: <CreditCard size={18} strokeWidth={1.7} /> },
  { label: "Produit", href: "/admin/product", icon: <Package size={18} strokeWidth={1.7} /> },
  { label: "SEO", href: "/admin/seo", icon: <Search size={18} strokeWidth={1.7} /> },
  { label: "Incidents", href: "/admin/incidents", icon: <AlertTriangle size={18} strokeWidth={1.7} /> },
  { label: "Audit Log", href: "/admin/audit", icon: <ScrollText size={18} strokeWidth={1.7} /> },
  { label: "Securite", href: "/admin/security", icon: <Shield size={18} strokeWidth={1.7} /> },
];

// ── Composant ─────────────────────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] h-full flex-shrink-0 bg-white border-r border-[#E6E6E4] select-none">
      {/* ── En-tete admin ── */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center flex-shrink-0">
            <Shield size={16} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <span className="block text-[14px] font-bold text-[#191919] tracking-[-0.01em]">
              Admin
            </span>
            <span className="block text-[10px] font-semibold text-[#4F46E5] uppercase tracking-[0.06em]">
              Panneau de controle
            </span>
          </div>
        </div>
      </div>

      {/* ── Separateur ── */}
      <div className="h-px bg-[#E6E6E4] mx-3" />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-0.5">
          {adminNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group/item flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#EEF2FF] text-[#4F46E5]"
                    : "text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919]"
                }`}
              >
                <span
                  className={`transition-colors duration-150 ${
                    active
                      ? "text-[#4F46E5]"
                      : "text-[#ACACAA] group-hover/item:text-[#7A7A78]"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Retour dashboard ── */}
      <div className="px-3 pb-4">
        <div className="h-px bg-[#E6E6E4] mb-3" />
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[#8A8A88] hover:bg-[#F7F7F5] hover:text-[#5A5A58] transition-all duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.7} />
          Retour au dashboard
        </Link>
      </div>
    </aside>
  );
}
