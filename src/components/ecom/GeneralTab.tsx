"use client";

import { useApi } from "@/lib/hooks/use-api";

interface ShopifyState {
  integration?: {
    shop_domain: string;
    metadata: { shop_name?: string; currency?: string; timezone?: string };
    created_at: string;
  };
}

export default function GeneralTab() {
  const { data } = useApi<ShopifyState>("/api/integrations/shopify/sync-state");
  const i = data?.integration;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-[#191919]">Configuration générale</h2>
        <p className="text-[12px] text-[#8A8A88]">Devise, fuseau horaire, paramètres par défaut hérités de Shopify.</p>
      </div>

      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
        <dl className="grid grid-cols-2 gap-y-2 text-[13px]">
          <dt className="text-[#8A8A88]">Boutique</dt>
          <dd className="text-[#191919] font-medium text-right">{i?.metadata?.shop_name ?? "—"}</dd>

          <dt className="text-[#8A8A88]">Domaine</dt>
          <dd className="text-[#191919] font-medium text-right">{i?.shop_domain ?? "—"}</dd>

          <dt className="text-[#8A8A88]">Devise</dt>
          <dd className="text-[#191919] font-medium text-right">{i?.metadata?.currency ?? "—"}</dd>

          <dt className="text-[#8A8A88]">Fuseau</dt>
          <dd className="text-[#191919] font-medium text-right">{i?.metadata?.timezone ?? "—"}</dd>

          <dt className="text-[#8A8A88]">Connectée le</dt>
          <dd className="text-[#191919] font-medium text-right">
            {i?.created_at ? new Date(i.created_at).toLocaleDateString("fr-FR") : "—"}
          </dd>
        </dl>
      </div>

      <p className="text-[11px] text-[#8A8A88]">
        Ces valeurs sont synchronisées depuis Shopify. Pour les modifier, passez par
        l&apos;admin Shopify puis cliquez sur « Resync » dans l&apos;onglet Intégrations.
      </p>
    </div>
  );
}
