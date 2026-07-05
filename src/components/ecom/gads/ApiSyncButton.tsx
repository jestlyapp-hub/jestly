"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useAnalyticsInvalidation } from "@/lib/hooks/use-analytics-invalidation";
import type { ImportRecap } from "./ImportCsvButton";

interface Props {
  onSynced: (recap: ImportRecap) => void;
}

/** Pull manuel de l'API Google Ads (lecture seule) vers gads_daily. */
export default function ApiSyncButton({ onSynced }: Props) {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sync = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ecom/gads/sync-api", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      onSynced(body.recap as ImportRecap);
      await invalidateAnalytics();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        onClick={() => void sync()}
        disabled={busy}
        title="Re-pull les 30 derniers jours depuis l'API Google Ads (les chiffres les plus récents font foi)"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#1a1535] border border-[#E5E3F0] hover:bg-[#FBFBFA] transition-colors disabled:opacity-60"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} strokeWidth={1.8} />}
        {busy ? "Sync en cours…" : "Actualiser depuis l'API"}
      </button>
      {error && <span className="text-[11px] text-rose-600 max-w-[280px] text-right">{error}</span>}
    </div>
  );
}
