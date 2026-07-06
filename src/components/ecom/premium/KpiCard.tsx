import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "./Card";
import { Sparkline } from "./Sparkline";

/**
 * KpiCard — une métrique. Label petite-cap, valeur en chiffres tabulaires
 * serrés, delta fléché coloré, sparkline optionnelle. Le survol soulève la
 * carte. L'état « non renseigné » invite à agir (CTA), il n'est jamais rouge.
 *
 * `highlight` cerne les KPI de rentabilité (BE-ROAS, Net Profit) d'un liseré
 * violet. `tone` colore la valeur (positif/négatif) pour le Net Profit.
 */
export function KpiCard({
  label,
  value,
  hint,
  delta,
  goodWhenUp = false,
  highlight = false,
  tone,
  cta,
  spark,
  sparkColor,
  tooltip,
  unset = false,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: number | null;
  goodWhenUp?: boolean;
  highlight?: boolean;
  tone?: "positive" | "negative";
  cta?: string;
  spark?: number[];
  sparkColor?: string;
  tooltip?: string;
  unset?: boolean;
}) {
  const deltaColor = delta == null || !goodWhenUp
    ? "text-[var(--ecom-muted)]"
    : delta >= 0 ? "text-[var(--ecom-pos)]" : "text-[var(--ecom-neg)]";
  const valueColor = tone === "positive"
    ? "text-[var(--ecom-pos)]"
    : tone === "negative" ? "text-[var(--ecom-neg)]" : "text-[var(--ecom-navy)]";

  return (
    <Card
      interactive
      className={`p-4 ${highlight ? "border-2 border-[var(--ecom-brand-violet)]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`ecom-label ${tooltip ? "underline decoration-dotted decoration-[var(--ecom-violet-mid)] underline-offset-2 cursor-help" : ""}`}
          title={tooltip}
        >
          {label}
        </span>
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 text-[var(--ecom-fs-caption)] font-semibold ecom-tnum ${deltaColor}`}>
            {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta > 0 ? "+" : ""}{delta} %
          </span>
        )}
      </div>

      {unset ? (
        <div className="mt-1.5 text-[var(--ecom-fs-label)] italic text-[var(--ecom-muted)]">non renseigné</div>
      ) : (
        <div
          className={`mt-1 text-[var(--ecom-fs-kpi)] font-bold ecom-tnum tracking-[var(--ecom-tracking-tight)] leading-none ${valueColor}`}
        >
          {value}
        </div>
      )}

      {spark && <Sparkline values={spark} color={sparkColor} className="h-6 w-full mt-2" />}
      {hint && <p className="text-[var(--ecom-fs-caption)] text-[var(--ecom-muted)] mt-1.5">{hint}</p>}
      {cta && (
        <Link
          href={cta as never}
          className="inline-block text-[var(--ecom-fs-caption)] font-medium text-[var(--ecom-brand-violet)] hover:underline mt-1"
        >
          Renseigner →
        </Link>
      )}
    </Card>
  );
}
