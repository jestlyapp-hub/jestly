"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import SetupModalV2 from "@/components/ecom/SetupModalV2";
import EcomShell from "@/components/ecom/EcomShell";
import EcomInitialSyncProgress from "@/components/ecom/EcomInitialSyncProgress";
import { useAccountMemory } from "@/lib/hooks/use-account-memory";
import type { EcomShopLite } from "@/components/ecom/EcomPrefsProvider";
import { AlertTriangle, LogOut } from "lucide-react";

interface ShopSyncState {
  initial_sync_completed: boolean;
  initial_sync_progress: Record<string, { synced: number; completed?: boolean }>;
}

interface SyncStateResponse {
  connected: boolean;
  integration?: EcomShopLite;
  sync_state?: ShopSyncState;
  integrations?: EcomShopLite[];
}

export default function EcomLayout({ children }: { children: React.ReactNode }) {
  const { data, loading, mutate } = useApi<SyncStateResponse>("/api/integrations/shopify/sync-state");
  const memory = useAccountMemory();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addingShop = searchParams.get("add_shop") === "1";
  const [pollInterval, setPollInterval] = useState<number | null>(null);

  // Poll toutes les 2s tant qu'une boutique n'a pas fini sa sync initiale
  // (première boutique OU boutique fraîchement ajoutée).
  const anySyncing = Boolean(
    data?.connected && (data.integrations ?? []).some((i) => i.sync_state?.initial_sync_completed === false),
  );
  useEffect(() => {
    setPollInterval(anySyncing ? 2000 : null);
  }, [anySyncing]);

  const closeAddShop = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add_shop");
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.replace>[0]);
  };

  useEffect(() => {
    if (pollInterval == null) return;
    const interval = setInterval(() => mutate(), pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, mutate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[13px] text-[#8A8A88]">Chargement…</div>
      </div>
    );
  }

  if (!data?.connected) {
    // Si un AUTRE compte connu de ce navigateur a des intégrations alors que le
    // compte courant n'en a aucune, on l'avertit plutôt que de lui faire re-saisir
    // une intégration (qui resterait invisible sur le bon compte).
    if (memory.shouldSuggestSwitch && memory.accountsWithIntegrations.length > 0) {
      const target = memory.accountsWithIntegrations[0];
      const targetLabel = target.email ?? "un autre compte";
      return (
        <div className="max-w-lg mx-auto py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-amber-600" size={26} />
          </div>
          <h1 className="text-[20px] font-bold text-[#191919] mb-2">Compte sans intégration</h1>
          <p className="text-[13px] text-[#5A5A58] mb-1">
            Tu es connecté avec <strong>{memory.currentEmail ?? "ce compte"}</strong>.
          </p>
          <p className="text-[13px] text-[#5A5A58] mb-5">
            Tes intégrations sont sur <strong>{targetLabel}</strong>.
            Reconnecte-toi avec ce compte pour les retrouver — pas besoin de tout reconfigurer.
          </p>
          <a href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold rounded-md">
            <LogOut size={14} />
            Se reconnecter avec {targetLabel}
          </a>
          <p className="text-[11px] text-[#8A8A88] mt-4">
            Ou continue avec ce compte pour configurer une nouvelle intégration.
          </p>
          <button
            onClick={() => { try { localStorage.removeItem("jestly_ecom_accounts"); } catch {} location.reload(); }}
            className="text-[11px] text-[#7C3AED] hover:underline mt-1"
          >
            Configurer une nouvelle boutique avec {memory.currentEmail}
          </button>
        </div>
      );
    }
    return <SetupModalV2 onConnected={() => mutate()} />;
  }

  const integrations = data.integrations ?? (data.integration ? [data.integration] : []);

  // Première mise en route : tant que la boutique PRINCIPALE n'a pas terminé sa
  // sync initiale, le module est inutilisable → écran de progression plein.
  // Une boutique SECONDAIRE fraîchement ajoutée ne bloque pas : le shell reste
  // affiché et une bannière par-boutique signale sa sync en cours.
  const primary = integrations[0];
  if (primary && primary.sync_state && !primary.sync_state.initial_sync_completed) {
    return <EcomInitialSyncProgress progress={primary.sync_state.initial_sync_progress as Record<string, { synced: number; completed?: boolean }>} />;
  }

  return (
    <EcomShell shops={integrations}>
      {children}
      {addingShop && (
        <SetupModalV2
          onConnected={() => { void mutate(); closeAddShop(); }}
          onClose={closeAddShop}
        />
      )}
    </EcomShell>
  );
}
