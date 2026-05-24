"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import IntegrationCard from "./IntegrationCard";
import SelectAdAccountModal from "./SelectAdAccountModal";
import SyncProgressBar, { type SyncCounts } from "./SyncProgressBar";
import { formatRelativeDate } from "@/lib/shopify/formatters";

interface ShopifyState {
  integration?: {
    id: string;
    shop_domain: string;
    status: string;
    last_sync_at: string | null;
    metadata: { shop_name?: string };
  };
}

interface PinterestState {
  connected: boolean;
  integration?: {
    id: string;
    status: string;
    external_account_id: string | null;
    external_account_name: string | null;
    last_sync_at: string | null;
    last_error: string | null;
  };
  counts: SyncCounts;
  requires_ad_account_selection?: boolean;
}

export default function IntegrationsTab() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: shopify, mutate: refreshShopify } = useApi<ShopifyState>("/api/integrations/shopify/sync-state");
  const { data: pinterest, mutate: refreshPinterest, loading: pinterestLoading } = useApi<PinterestState>("/api/integrations/pinterest/status");
  const [modalOpen, setModalOpen] = useState(false);
  const [syncingShopify, setSyncingShopify] = useState(false);
  const [syncingPinterest, setSyncingPinterest] = useState(false);
  const [pollingPinterest, setPollingPinterest] = useState(false);

  // Ouvre auto le modal si query ?connect=pinterest_select_account ou si requires_ad_account_selection
  useEffect(() => {
    const connect = searchParams.get("connect");
    if (connect === "pinterest_select_account") {
      setModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (pinterest?.requires_ad_account_selection && !modalOpen) {
      setModalOpen(true);
    }
  }, [pinterest, modalOpen]);

  // Poll pinterest status pendant le sync initial
  useEffect(() => {
    if (!pollingPinterest) return;
    const interval = setInterval(() => refreshPinterest(), 2000);
    return () => clearInterval(interval);
  }, [pollingPinterest, refreshPinterest]);

  const handleConnectPinterest = () => {
    window.location.href = "/api/integrations/pinterest/oauth/start";
  };

  const handleResyncShopify = async () => {
    setSyncingShopify(true);
    try {
      await apiFetch("/api/ecom/sync", { method: "POST" });
      toast.success("Sync Shopify lancée");
      refreshShopify();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setSyncingShopify(false);
    }
  };

  const handleResyncPinterest = async () => {
    setSyncingPinterest(true);
    try {
      await apiFetch("/api/integrations/pinterest/sync", { method: "POST" });
      toast.success("Sync Pinterest lancée");
      refreshPinterest();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setSyncingPinterest(false);
    }
  };

  const handleDisconnectPinterest = async () => {
    if (!confirm("Déconnecter Pinterest ? Le cache sera supprimé.")) return;
    try {
      await apiFetch("/api/integrations/pinterest/disconnect", {
        method: "POST",
        body: JSON.stringify({ wipe_cache: true }),
      });
      toast.success("Pinterest déconnecté");
      refreshPinterest();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    }
  };

  const handleDisconnectShopify = async () => {
    if (!confirm("Déconnecter Shopify ? Le cache sera supprimé.")) return;
    try {
      await apiFetch("/api/integrations/shopify/disconnect", {
        method: "POST",
        body: JSON.stringify({ integration_id: shopify?.integration?.id, wipe_cache: true }),
      });
      toast.success("Shopify déconnecté");
      router.push("/ecom");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    }
  };

  // ── Cards data ────────────────────────────────────────────────
  const shopifyConnected = Boolean(shopify?.integration);
  const pinterestConnected = Boolean(
    pinterest?.connected && pinterest?.integration?.external_account_id && pinterest?.integration?.status === "active",
  );
  const pinterestPending = Boolean(pinterest?.connected && !pinterest?.integration?.external_account_id);
  const pinterestError = pinterest?.integration?.status === "error";
  const showProgress = pinterestConnected && pinterest && pinterest.counts.metrics_rows < 1 && pinterest.integration?.last_sync_at;

  return (
    <div className="space-y-4">
      <SelectAdAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelected={() => {
          setModalOpen(false);
          setPollingPinterest(true);
          refreshPinterest();
          // Arrête le polling après 2 min max
          setTimeout(() => setPollingPinterest(false), 120_000);
          // Clean l'URL si la query string contient connect=
          router.replace("/ecom/settings?tab=integrations");
        }}
      />

      <div className="mb-1">
        <h2 className="text-[16px] font-bold text-[#191919]">Intégrations disponibles</h2>
        <p className="text-[12px] text-[#8A8A88]">Connectez vos sources de données pour un dashboard complet.</p>
      </div>

      {/* Shopify */}
      <IntegrationCard
        icon="🛍️"
        name="Shopify"
        description="Commandes, produits, clients, sessions et conversion en temps réel."
        status={shopifyConnected ? "connected" : "disconnected"}
        contextLine={shopifyConnected
          ? `${shopify!.integration!.metadata?.shop_name ?? "Boutique"} · ${shopify!.integration!.shop_domain}`
          : undefined}
        metaLine={shopifyConnected && shopify?.integration?.last_sync_at
          ? `Dernière sync : ${formatRelativeDate(shopify.integration.last_sync_at)}`
          : undefined}
        actions={shopifyConnected ? [
          { label: "Resync", onClick: handleResyncShopify, variant: "secondary", loading: syncingShopify },
          { label: "Déconnecter", onClick: handleDisconnectShopify, variant: "danger" },
        ] : [
          { label: "Connecter Shopify →", onClick: () => router.push("/ecom"), variant: "primary" },
        ]}
      />

      {/* Pinterest */}
      <IntegrationCard
        icon="📌"
        name="Pinterest Ads"
        description="Importez vos campagnes pour calculer le ROAS réel basé sur les vraies ventes Shopify attribuées."
        status={pinterestError ? "error" : pinterestConnected ? "connected" : pinterestPending ? "disconnected" : "disconnected"}
        contextLine={pinterestConnected && pinterest?.integration?.external_account_name
          ? `Ad account : ${pinterest.integration.external_account_name}`
          : undefined}
        metaLine={pinterestConnected
          ? [
              pinterest?.integration?.last_sync_at
                ? `Dernière sync : ${formatRelativeDate(pinterest.integration.last_sync_at)}`
                : "Jamais synchronisé",
              `${pinterest?.counts.campaigns ?? 0} campagnes`,
            ].join(" · ")
          : undefined}
        errorMessage={pinterestError ? pinterest?.integration?.last_error ?? "Erreur Pinterest" : undefined}
        actions={
          pinterestConnected ? [
            { label: "Resync", onClick: handleResyncPinterest, variant: "secondary", loading: syncingPinterest },
            { label: "Changer ad account", onClick: () => setModalOpen(true), variant: "secondary" },
            { label: "Déconnecter", onClick: handleDisconnectPinterest, variant: "danger" },
          ] : pinterestPending ? [
            { label: "Choisir un ad account", onClick: () => setModalOpen(true), variant: "primary" },
            { label: "Annuler", onClick: handleDisconnectPinterest, variant: "danger" },
          ] : [
            { label: "Connecter Pinterest →", onClick: handleConnectPinterest, variant: "primary" },
          ]
        }
      />

      {/* Sync progress (visible en bas pour ne pas perturber le layout) */}
      {showProgress && pinterest && (
        <div className="ml-9">
          <SyncProgressBar counts={pinterest.counts} done={pinterest.counts.metrics_rows > 0} />
        </div>
      )}

      {/* Google Ads (coming soon) */}
      <IntegrationCard
        icon="🔵"
        name="Google Ads"
        description="ROAS, conversions, search/display/perf max. En attente du Developer Token Google."
        status="coming_soon"
      />

      {/* Klaviyo (coming soon) */}
      <IntegrationCard
        icon="✉️"
        name="Klaviyo"
        description="Revenue par email/SMS, flows, segments, attribution multi-touch."
        status="coming_soon"
      />

      {pinterestLoading && !pinterest && (
        <p className="text-[11px] text-[#8A8A88] text-center py-2">Chargement…</p>
      )}
    </div>
  );
}
