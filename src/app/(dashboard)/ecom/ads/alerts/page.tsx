"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { ArrowLeft, AlertCircle, AlertTriangle, Info, Check, X, RefreshCw } from "lucide-react";
import { formatProvider } from "@/lib/ads/formatters";

interface Alert {
  id: string; alert_type: string; severity: "info" | "warning" | "critical";
  provider: string | null; campaign_id: string | null; campaign_name: string | null;
  title: string; message: string; recommendation: string | null;
  metric_value: number | null; metric_label: string | null;
  status: string; detected_at: string; acknowledged_at: string | null;
}

interface Response { alerts: Alert[] }

const SEVERITY_CONFIG: Record<Alert["severity"], { icon: typeof AlertCircle; cls: string }> = {
  critical: { icon: AlertCircle, cls: "text-rose-600 bg-rose-50 border-rose-200" },
  warning: { icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 border-amber-200" },
  info: { icon: Info, cls: "text-blue-600 bg-blue-50 border-blue-200" },
};

function AlertsContent() {
  const [status, setStatus] = useState<string>("active");
  const [acting, setActing] = useState<string | null>(null);
  const { data, mutate } = useApi<Response>(`/api/ecom/ads/alerts?status=${status}`);

  const act = async (id: string, newStatus: "acknowledged" | "resolved" | "dismissed") => {
    setActing(id);
    try {
      await apiFetch(`/api/ecom/ads/alerts/${id}`, { method: "PATCH", body: { status: newStatus } });
      toast.success(`Alerte ${newStatus === "acknowledged" ? "acquittée" : newStatus === "resolved" ? "résolue" : "ignorée"}`);
      mutate();
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-5">
      <Link href="/ecom/ads" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919]">
        <ArrowLeft size={12} /> Retour Performance Ads
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Alertes</h1>
          <p className="text-[12px] text-[#8A8A88]">Anomalies détectées sur vos campagnes</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30">
            <option value="active">Actives</option>
            <option value="acknowledged">Acquittées</option>
            <option value="resolved">Résolues</option>
            <option value="dismissed">Ignorées</option>
            <option value="all">Toutes</option>
          </select>
          <button onClick={() => mutate()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA]">
            <RefreshCw size={12} /> Actualiser
          </button>
        </div>
      </header>

      {(data?.alerts ?? []).length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <Check size={28} className="text-emerald-600 mx-auto mb-2" />
          <p className="text-[14px] font-semibold text-emerald-800 mb-1">Aucune alerte {status === "active" ? "active" : ""}</p>
          <p className="text-[12px] text-emerald-700">Tout est sous contrôle.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {data!.alerts.map((a) => {
            const cfg = SEVERITY_CONFIG[a.severity];
            const Icon = cfg.icon;
            return (
              <li key={a.id} className={`p-4 rounded-xl border ${cfg.cls}`}>
                <div className="flex items-start gap-3">
                  <Icon size={16} className={`${cfg.cls.split(" ")[0]} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-[#191919]">{a.title}</span>
                      <span className="text-[10px] text-[#8A8A88]">{new Date(a.detected_at).toLocaleString("fr-FR")}</span>
                      {a.provider && <span className="text-[10px] text-[#8A8A88]">· {formatProvider(a.provider)}</span>}
                    </div>
                    <p className="text-[12px] text-[#5A5A58] mt-1">{a.message}</p>
                    {a.recommendation && (
                      <p className="text-[12px] text-[#191919] mt-2 leading-snug">
                        <strong>→ </strong>{a.recommendation}
                      </p>
                    )}
                    {a.campaign_id && (
                      <Link href={`/ecom/ads/campaigns/${a.campaign_id}?provider=${a.provider}`}
                        className="text-[11px] text-[#7C3AED] hover:underline mt-2 inline-block">
                        Voir la campagne →
                      </Link>
                    )}
                  </div>
                  {a.status === "active" && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => act(a.id, "acknowledged")} disabled={acting === a.id}
                        className="p-1.5 rounded hover:bg-white/50 disabled:opacity-50" title="Acquitter">
                        <Check size={14} />
                      </button>
                      <button onClick={() => act(a.id, "dismissed")} disabled={acting === a.id}
                        className="p-1.5 rounded hover:bg-white/50 disabled:opacity-50" title="Ignorer">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <AlertsContent />
    </Suspense>
  );
}
