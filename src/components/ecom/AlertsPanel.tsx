"use client";

import Link from "next/link";
import { AlertTriangle, Package, Clock, AlertCircle } from "lucide-react";

interface Props {
  alerts: {
    low_stock: { product_id: string; title: string; inventory: number }[];
    pending_fulfillment: number;
    failed_webhooks: number;
  };
}

export default function AlertsPanel({ alerts }: Props) {
  const hasAny =
    alerts.low_stock.length > 0 || alerts.pending_fulfillment > 0 || alerts.failed_webhooks > 0;
  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <h3 className="text-[14px] font-bold text-[#191919] mb-1">Alertes</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">Points à surveiller</p>
      {!hasAny ? (
        <p className="text-[12px] text-emerald-600 py-2">Tout est sous contrôle.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.pending_fulfillment > 0 && (
            <li className="flex items-start gap-2.5">
              <Clock size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-[12px]">
                <div className="font-semibold text-[#191919]">{alerts.pending_fulfillment} commande(s) à expédier</div>
                <Link href="/ecom/orders?fulfillment=unfulfilled" className="text-[11px] text-[#7C3AED] hover:underline">
                  Voir →
                </Link>
              </div>
            </li>
          )}
          {alerts.low_stock.length > 0 && (
            <li className="flex items-start gap-2.5">
              <Package size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="text-[12px] min-w-0 flex-1">
                <div className="font-semibold text-[#191919]">Stock bas</div>
                <ul className="mt-1 space-y-0.5">
                  {alerts.low_stock.slice(0, 3).map((p) => (
                    <li key={p.product_id} className="text-[11px] text-[#5A5A58] truncate">
                      {p.title} <span className="text-rose-500 font-semibold">({p.inventory})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )}
          {alerts.failed_webhooks > 0 && (
            <li className="flex items-start gap-2.5">
              <AlertCircle size={14} className="text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="text-[12px]">
                <div className="font-semibold text-[#191919]">{alerts.failed_webhooks} webhooks en erreur (7j)</div>
                <Link href="/ecom/settings" className="text-[11px] text-[#7C3AED] hover:underline">Diagnostiquer →</Link>
              </div>
            </li>
          )}
        </ul>
      )}
      {!hasAny && <AlertTriangle size={14} className="hidden" />}
    </div>
  );
}
