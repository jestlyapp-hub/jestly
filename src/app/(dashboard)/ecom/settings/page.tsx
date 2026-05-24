"use client";

import { useState } from "react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";
import { formatRelativeDate } from "@/lib/shopify/formatters";
import { RefreshCw, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface SyncStateResponse {
  integration: {
    id: string; shop_domain: string; status: string; last_sync_at: string | null; last_error: string | null;
    metadata: { shop_name?: string; currency?: string; timezone?: string };
    created_at: string;
  };
  sync_state: { initial_sync_completed: boolean; initial_sync_progress: Record<string, unknown> };
}

export default function EcomSettingsPage() {
  const router = useRouter();
  const { data, mutate } = useApi<SyncStateResponse>("/api/integrations/shopify/sync-state");
  const [syncing, setSyncing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!data?.integration) return <div className="text-[13px] text-[#8A8A88] py-10 text-center">Aucune intégration</div>;

  const { integration } = data;

  const handleResync = async () => {
    setSyncing(true);
    try {
      await apiFetch("/api/ecom/sync", { method: "POST" });
      toast.success("Synchronisation lancée");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiFetch("/api/integrations/shopify/disconnect", {
        method: "POST",
        body: JSON.stringify({ integration_id: integration.id, wipe_cache: true }),
      });
      toast.success("Boutique déconnectée");
      router.push("/ecom");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    }
  };

  return (
    <div className="max-w-3xl">
      <ConfirmDialog
        open={confirmOpen}
        title="Déconnecter la boutique ?"
        message="Cette action supprime l'intégration et tout le cache associé (commandes, produits, clients, analytics). L'historique sera perdu côté Jestly mais Shopify n'est pas affecté."
        variant="danger"
        confirmLabel="Déconnecter"
        cancelLabel="Annuler"
        onConfirm={() => { setConfirmOpen(false); handleDisconnect(); }}
        onCancel={() => setConfirmOpen(false)}
      />

      <h1 className="text-[22px] font-bold text-[#191919] tracking-tight mb-1">Réglages</h1>
      <p className="text-[12px] text-[#8A8A88] mb-6">Intégration Shopify et préférences ecom</p>

      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-bold text-[#191919]">{integration.metadata?.shop_name ?? integration.shop_domain}</h3>
            <p className="text-[11px] text-[#8A8A88]">{integration.shop_domain}</p>
          </div>
          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${
            integration.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            {integration.status === "active" ? "Active" : integration.status}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-y-2 text-[12px] mb-4">
          <Item label="Devise" value={integration.metadata?.currency ?? "—"} />
          <Item label="Fuseau" value={integration.metadata?.timezone ?? "—"} />
          <Item label="Connectée le" value={new Date(integration.created_at).toLocaleDateString("fr-FR")} />
          <Item label="Dernière sync" value={integration.last_sync_at ? formatRelativeDate(integration.last_sync_at) : "Jamais"} />
        </dl>

        {integration.last_error && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2">
            <AlertTriangle size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-rose-700">{integration.last_error}</p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleResync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] disabled:opacity-50"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            Resync delta maintenant
          </button>
          <a
            href={`https://${integration.shop_domain}/admin`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA]"
          >
            <ExternalLink size={12} />
            Ouvrir Shopify Admin
          </a>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 rounded-md text-[12px] font-medium hover:bg-rose-50"
          >
            <Trash2 size={12} />
            Déconnecter la boutique
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
        <h3 className="text-[13px] font-bold text-[#191919] mb-1">Connecter une autre boutique</h3>
        <p className="text-[11px] text-[#8A8A88]">
          Le multi-boutiques arrive en V2. Pour l&apos;instant une seule intégration Shopify par compte.
        </p>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[#8A8A88]">{label}</dt>
      <dd className="text-[#191919] font-medium text-right pr-2">{value}</dd>
    </>
  );
}
