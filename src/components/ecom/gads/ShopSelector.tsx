"use client";

/**
 * Sélecteur de boutique du module Analytics (Phase 5).
 * Les données du module sont aujourd'hui mono-boutique (LHM) — le sélecteur
 * affiche les boutiques pixel enregistrées, et Mignou apparaît grisée
 * « pixel requis » tant qu'elle n'est pas enregistrée
 * (node scripts/pixel-register-shop.mjs <domaine> "Mignou").
 */
import { Store } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";

interface PixelShop {
  id: string;
  shop_domain: string;
  label: string | null;
  is_active: boolean;
}

export default function ShopSelector() {
  const { data } = useApi<{ shops: PixelShop[] }>("/api/ecom/gads/shops");
  const shops = data?.shops ?? [];
  const hasMignou = shops.some((s) =>
    (s.label ?? "").toLowerCase().includes("mignou") || s.shop_domain.toLowerCase().includes("mignou"),
  );

  return (
    <div className="inline-flex items-center gap-1 bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5"
      title="Boutique analysée — le multi-boutiques s'activera avec l'enregistrement du pixel Mignou">
      <Store size={12} className="ml-1.5 text-[#8A8A88]" />
      {shops.map((s) => (
        <span key={s.id} className="px-2.5 py-1 text-[11px] font-medium rounded bg-white text-[#1a1535] shadow-sm">
          {s.label ?? s.shop_domain}
        </span>
      ))}
      {shops.length === 0 && (
        <span className="px-2.5 py-1 text-[11px] text-[#8A8A88]">Aucune boutique pixel</span>
      )}
      {!hasMignou && (
        <span className="px-2.5 py-1 text-[11px] text-[#B4B4B2] cursor-not-allowed" title="Enregistre le pixel Mignou pour l'activer">
          Mignou · pixel requis
        </span>
      )}
    </div>
  );
}
