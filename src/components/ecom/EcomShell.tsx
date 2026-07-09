"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, Crosshair, Megaphone, Settings } from "lucide-react";
import { formatRelativeDate } from "@/lib/shopify/formatters";
import AccountMemoryBanner from "@/components/ecom/AccountMemoryBanner";
import EcomGlobalBar from "@/components/ecom/EcomGlobalBar";
import { EcomPrefsProvider } from "@/components/ecom/EcomPrefsProvider";

interface Props {
  integration: {
    id: string;
    shop_domain: string;
    last_sync_at: string | null;
    metadata: { shop_name?: string; currency?: string };
  };
  children: React.ReactNode;
}

// Refonte : une seule nav, 6 entrées. L'ancien « Tour de pilotage » a fusionné
// avec la Vue d'ensemble Analytics dans le Dashboard ; « Ads » (Pinterest,
// inactif) vit désormais dans Réglages → Intégrations.
const NAV: { href: string; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/ecom", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ecom/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/ecom/products", label: "Produits", icon: Package },
  { href: "/ecom/campaigns", label: "Campagnes", icon: Megaphone },
  { href: "/ecom/attribution", label: "Attribution", icon: Crosshair },
  { href: "/ecom/customers", label: "Clients", icon: Users },
  { href: "/ecom/settings", label: "Réglages", icon: Settings },
];

export default function EcomShell({ integration, children }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/ecom" ? pathname === href : pathname?.startsWith(href);

  return (
    <EcomPrefsProvider>
    <div>
      {/* Subnav */}
      <div className="border-b border-[var(--ecom-card-border)] bg-[var(--ecom-surface-1)] sticky top-0 z-30 shadow-[var(--ecom-shadow-sm)]">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <nav className="flex items-center gap-1 overflow-x-auto -mx-2 py-2">
            {NAV.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--ecom-r-sm)] text-[13px] font-medium whitespace-nowrap transition-colors duration-[var(--ecom-t-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)] ${
                    active
                      ? "bg-[var(--ecom-violet-light)] text-[var(--ecom-brand-violet)]"
                      : "text-[var(--ecom-muted)] hover:bg-[var(--ecom-surface-sunken)] hover:text-[var(--ecom-navy)]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="text-[11px] text-[var(--ecom-muted)] hidden md:block">
            <span className="font-semibold text-[var(--ecom-navy)]">{integration.metadata?.shop_name ?? integration.shop_domain}</span>
            {integration.last_sync_at && (
              <span className="ml-2">· MAJ {formatRelativeDate(integration.last_sync_at)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[var(--ecom-surface-0)] min-h-[calc(100vh-48px)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-5">
          <AccountMemoryBanner />
          <Suspense fallback={null}>
            <EcomGlobalBar />
          </Suspense>
          {children}
        </div>
      </div>
    </div>
    </EcomPrefsProvider>
  );
}
