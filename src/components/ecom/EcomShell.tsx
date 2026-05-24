"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, Target, Settings } from "lucide-react";
import { formatRelativeDate } from "@/lib/shopify/formatters";

interface Props {
  integration: {
    id: string;
    shop_domain: string;
    last_sync_at: string | null;
    metadata: { shop_name?: string; currency?: string };
  };
  children: React.ReactNode;
}

const NAV: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/ecom", label: "Tour de pilotage", icon: LayoutDashboard },
  { href: "/ecom/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/ecom/products", label: "Produits", icon: Package },
  { href: "/ecom/customers", label: "Clients", icon: Users },
  { href: "/ecom/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ecom/ads", label: "Ads", icon: Target },
  { href: "/ecom/settings", label: "Réglages", icon: Settings },
];

export default function EcomShell({ integration, children }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/ecom" ? pathname === href : pathname?.startsWith(href);

  return (
    <div>
      {/* Subnav */}
      <div className="border-b border-[#E6E6E4] bg-white sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto -mx-2 py-2">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-[#F0EEFF] text-[#7C3AED]"
                      : "text-[#5A5A58] hover:bg-[#FBFBFA] hover:text-[#191919]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="text-[11px] text-[#8A8A88] hidden md:block">
            <span className="font-semibold text-[#191919]">{integration.metadata?.shop_name ?? integration.shop_domain}</span>
            {integration.last_sync_at && (
              <span className="ml-2">· MAJ {formatRelativeDate(integration.last_sync_at)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">{children}</div>
    </div>
  );
}
