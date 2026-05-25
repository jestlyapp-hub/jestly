"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import SetupModalV2 from "@/components/ecom/SetupModalV2";
import EcomShell from "@/components/ecom/EcomShell";
import EcomInitialSyncProgress from "@/components/ecom/EcomInitialSyncProgress";
import { useAccountMemory } from "@/lib/hooks/use-account-memory";
import { AlertTriangle, LogOut } from "lucide-react";

interface SyncStateResponse {
  connected: boolean;
  integration?: {
    id: string;
    shop_domain: string;
    status: string;
    last_sync_at: string | null;
    last_error: string | null;
    metadata: { shop_name?: string; currency?: string; timezone?: string };
  };
  sync_state?: {
    initial_sync_completed: boolean;
    initial_sync_progress: Record<string, { synced: number; completed?: boolean }>;
  };
}

export default function EcomLayout({ children }: { children: React.ReactNode }) {
  const { data, loading, mutate } = useApi<SyncStateResponse>("/api/integrations/shopify/sync-state");
  const memory = useAccountMemory();
  const [pollInterval, setPollInterval] = useState<number | null>(null);

  // Poll toutes les 2s pendant initial sync
  useEffect(() => {
    if (data?.connected && data.sync_state && !data.sync_state.initial_sync_completed) {
      setPollInterval(2000);
    } else {
      setPollInterval(null);
    }
  }, [data]);

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

  if (data.sync_state && !data.sync_state.initial_sync_completed) {
    return <EcomInitialSyncProgress progress={data.sync_state.initial_sync_progress} />;
  }

  return <EcomShell integration={data.integration!}>{children}</EcomShell>;
}
