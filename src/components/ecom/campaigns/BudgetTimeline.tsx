"use client";

/**
 * Mini-évolution du budget quotidien d'une campagne, depuis l'archive maison
 * Jestly (gads_budget_history). Google ne restitue pas les budgets passés au-delà
 * de 30 jours — Jestly les archive à chaque changement et devient la mémoire
 * long terme. Barres compactes + mention « archive Jestly depuis le {date} ».
 */
import { formatCurrency } from "@/lib/ads/formatters";
import type { BudgetPoint } from "@/lib/gads/campaign-detail";

export default function BudgetTimeline({ history, since }: { history: BudgetPoint[]; since: string | null }) {
  if (history.length === 0) {
    return <p className="text-[10px] text-[#B4B4B2] mt-1">Historique de budget en cours de constitution</p>;
  }
  const max = Math.max(1, ...history.map((h) => h.budget_cents));
  const first = history[0].budget_cents;
  const last = history[history.length - 1].budget_cents;
  const changed = history.length > 1 && first !== last;

  return (
    <div className="mt-1.5">
      <div className="flex items-end justify-end gap-0.5 h-8" title="Évolution du budget (archive Jestly)">
        {history.slice(-14).map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-t bg-[#C4B5FD]"
            style={{ height: `${Math.max(8, (h.budget_cents / max) * 100)}%` }}
            title={`${formatCurrency(h.budget_cents)} — ${frDateTime(h.observed_at)}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-[#8A8A88] mt-1">
        {changed ? (
          <>Budget passé de <span className="font-medium text-[var(--ecom-navy)]">{formatCurrency(first)}</span> à <span className="font-medium text-[var(--ecom-navy)]">{formatCurrency(last)}</span></>
        ) : (
          <>Budget stable</>
        )}
        {since && <> · archive Jestly depuis le {frDate(since)}</>}
      </p>
    </div>
  );
}

function frDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); } catch { return iso; }
}
function frDateTime(iso: string): string {
  try { return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return iso; }
}
