"use client";

/**
 * Simulateur de budget (client, honnête) : « si je passe le budget quotidien de
 * X à Y €/j, à ROAS Jestly constant, CA projeté ≈ Z € ». Projection LINÉAIRE
 * (CA journalier ≈ budget × ROAS Jestly) — annoncée comme un ordre de grandeur,
 * avec avertissement que le ROAS peut se dégrader à l'échelle. Aucune donnée
 * inventée : sans ROAS Jestly, le simulateur invite à rattacher des ventes.
 */
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";

export default function BudgetSimulator({
  currentBudgetCents, roasJestly,
}: { currentBudgetCents: number | null; roasJestly: number | null }) {
  const base = currentBudgetCents && currentBudgetCents > 0 ? currentBudgetCents : 2000; // 20 €/j par défaut
  const maxCents = Math.max(base * 3, 10000);
  const [budgetCents, setBudgetCents] = useState<number>(base);

  const dailyCa = roasJestly != null ? Math.round(budgetCents * roasJestly) : null;
  const monthlyCa = dailyCa != null ? dailyCa * 30 : null;
  const deltaDaily = roasJestly != null && currentBudgetCents != null
    ? Math.round((budgetCents - currentBudgetCents) * roasJestly)
    : null;

  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal size={14} className="text-[var(--ecom-brand-violet)]" />
        <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Simulateur de budget</h3>
      </div>

      {roasJestly == null ? (
        <p className="text-[12px] text-[#8A8A88]">
          ROAS Jestly non disponible pour cette campagne : rattache des ventes ou attends des conversions attribuées pour simuler l&apos;impact d&apos;un changement de budget.
        </p>
      ) : (
        <>
          <div className="flex items-baseline justify-between text-[12px] mb-1.5">
            <span className="text-[#5A5A58]">Budget quotidien simulé</span>
            <span className="font-bold text-[var(--ecom-navy)] ecom-tnum text-[15px]">{formatCurrency(budgetCents)}/j</span>
          </div>
          <input
            type="range" min={0} max={maxCents} step={100} value={budgetCents}
            onChange={(e) => setBudgetCents(Number(e.target.value))}
            className="w-full accent-[#7C3AED]"
            aria-label="Budget quotidien simulé"
          />
          <div className="flex justify-between text-[10px] text-[#B4B4B2] mt-0.5">
            <span>0 €</span>
            {currentBudgetCents != null && <span>actuel {formatCurrency(currentBudgetCents)}</span>}
            <span>{formatCurrency(maxCents)}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="CA projeté / jour" value={dailyCa != null ? formatCurrency(dailyCa) : "—"} />
            <Stat label="CA projeté / mois (30 j)" value={monthlyCa != null ? formatCurrency(monthlyCa) : "—"} />
          </div>
          {deltaDaily != null && deltaDaily !== 0 && (
            <p className="text-[11px] mt-2" style={{ color: deltaDaily >= 0 ? "var(--ecom-pos)" : "var(--ecom-neg)" }}>
              {deltaDaily >= 0 ? "+" : ""}{formatCurrency(deltaDaily)} de CA attribué par jour vs budget actuel (à ROAS Jestly {formatRoas(roasJestly)} constant).
            </p>
          )}
          <p className="text-[10px] text-[#8A8A88] mt-2">Projection linéaire : le ROAS Jestly peut se dégrader quand le budget monte (audiences plus larges, moins qualifiées).</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--ecom-r-sm)] bg-[var(--ecom-surface-sunken)] px-3 py-2">
      <div className="text-[10px] text-[#8A8A88] uppercase tracking-wide">{label}</div>
      <div className="text-[16px] font-bold text-[var(--ecom-navy)] ecom-tnum mt-0.5">{value}</div>
    </div>
  );
}
