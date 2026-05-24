"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, AlertTriangle, Info, X, Check } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";

interface Alert {
  id: string;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  campaign_id: string | null;
  campaign_name: string | null;
  provider: string | null;
  title: string;
  message: string;
  recommendation: string | null;
  detected_at: string;
  status: string;
}

interface Props {
  alerts: Alert[];
  onChange?: () => void;
  limit?: number;
  showSeeAll?: boolean;
}

const SEVERITY_CONFIG: Record<Alert["severity"], { icon: typeof AlertCircle; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
};

export default function AdsAlertsPanel({ alerts, onChange, limit = 3, showSeeAll = true }: Props) {
  const [acting, setActing] = useState<string | null>(null);
  const visible = alerts.slice(0, limit);

  const act = async (id: string, status: "dismissed" | "acknowledged") => {
    setActing(id);
    try {
      await apiFetch(`/api/ecom/ads/alerts/${id}`, { method: "PATCH", body: { status } });
      onChange?.();
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-[#191919]">
          Alertes actives <span className="text-[#8A8A88] font-normal">({alerts.length})</span>
        </h3>
        {showSeeAll && alerts.length > limit && (
          <Link href="/ecom/ads/alerts" className="text-[11px] text-[#7C3AED] hover:underline font-semibold">
            Voir tout →
          </Link>
        )}
      </div>
      {alerts.length === 0 ? (
        <p className="text-[12px] text-emerald-600 py-2 text-center">Aucune alerte — tout est sous contrôle.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((a) => {
            const cfg = SEVERITY_CONFIG[a.severity];
            const Icon = cfg.icon;
            return (
              <li key={a.id} className={`p-2.5 rounded-lg border ${cfg.bg}`}>
                <div className="flex items-start gap-2">
                  <Icon size={14} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#191919]">{a.title}</div>
                    <div className="text-[11px] text-[#5A5A58] mt-0.5">{a.message}</div>
                    {a.recommendation && (
                      <div className="text-[11px] text-[#191919] mt-1.5 leading-snug">
                        <span className="font-semibold">→ </span>{a.recommendation}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => act(a.id, "acknowledged")}
                      disabled={acting === a.id}
                      className="p-1 rounded hover:bg-white/50 disabled:opacity-50" title="Marquer vu"
                    ><Check size={12} className="text-[#5A5A58]" /></button>
                    <button
                      onClick={() => act(a.id, "dismissed")}
                      disabled={acting === a.id}
                      className="p-1 rounded hover:bg-white/50 disabled:opacity-50" title="Ignorer"
                    ><X size={12} className="text-[#5A5A58]" /></button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
