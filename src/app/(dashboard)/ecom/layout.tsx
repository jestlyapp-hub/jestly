"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/hooks/use-api";
import SetupModal from "@/components/ecom/SetupModal";
import EcomShell from "@/components/ecom/EcomShell";
import EcomInitialSyncProgress from "@/components/ecom/EcomInitialSyncProgress";

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
    return <SetupModal onConnected={() => mutate()} />;
  }

  if (data.sync_state && !data.sync_state.initial_sync_completed) {
    return <EcomInitialSyncProgress progress={data.sync_state.initial_sync_progress} />;
  }

  return <EcomShell integration={data.integration!}>{children}</EcomShell>;
}
