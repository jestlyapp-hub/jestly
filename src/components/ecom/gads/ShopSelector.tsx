"use client";

/**
 * Sélecteur de boutique du module ECOM (multi-boutiques).
 * Bascule la boutique active (contexte EcomPrefsProvider) → toutes les vues se
 * rescopent automatiquement via le middleware SWR d'injection `integration_id`.
 * Permet aussi d'ajouter une nouvelle boutique Shopify (?add_shop=1).
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Store, ChevronDown, Check, Plus, Loader2 } from "lucide-react";
import { useEcomPrefs } from "@/components/ecom/EcomPrefsProvider";

export default function ShopSelector() {
  const { shops, selectedShop, selectedShopId, setSelectedShopId } = useEcomPrefs();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const openAddShop = () => {
    setOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("add_shop", "1");
    router.replace(`${pathname}?${params.toString()}` as Parameters<typeof router.replace>[0]);
  };

  const label = (s: { metadata?: { shop_name?: string }; shop_domain: string }) =>
    s.metadata?.shop_name ?? s.shop_domain;

  if (shops.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--ecom-muted)]">
        <Store size={12} /> Aucune boutique
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--ecom-navy)] hover:bg-[var(--ecom-surface-sunken)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)] transition-colors"
        title="Boutique analysée"
      >
        <Store size={12} className="text-[var(--ecom-muted)]" />
        <span className="max-w-[160px] truncate">{selectedShop ? label(selectedShop) : "Boutique"}</span>
        {selectedShop?.sync_state?.initial_sync_completed === false && (
          <Loader2 size={11} className="animate-spin text-[var(--ecom-brand-violet)]" />
        )}
        <ChevronDown size={12} className="text-[var(--ecom-muted)]" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-40 min-w-[220px] bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-md)] py-1">
          {shops.map((s) => {
            const active = s.id === selectedShopId;
            const syncing = s.sync_state?.initial_sync_completed === false;
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedShopId(s.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[var(--ecom-surface-sunken)] transition-colors ${
                  active ? "text-[var(--ecom-brand-violet)] font-semibold" : "text-[var(--ecom-navy)]"
                }`}
              >
                <span className="w-3.5 shrink-0">{active && <Check size={13} />}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate">{label(s)}</span>
                  <span className="block text-[10px] text-[var(--ecom-muted)] truncate">{s.shop_domain}</span>
                </span>
                {syncing && <Loader2 size={11} className="animate-spin text-[var(--ecom-brand-violet)] shrink-0" />}
              </button>
            );
          })}
          <div className="my-1 border-t border-[var(--ecom-card-border)]" />
          <button
            onClick={openAddShop}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left text-[var(--ecom-muted)] hover:bg-[var(--ecom-surface-sunken)] hover:text-[var(--ecom-navy)] transition-colors"
          >
            <span className="w-3.5 shrink-0"><Plus size={13} /></span>
            Ajouter une boutique
          </button>
        </div>
      )}
    </div>
  );
}
