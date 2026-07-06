import Link from "next/link";
import { TrendingDown, Lightbulb, AlertTriangle, ArrowRight } from "lucide-react";

/**
 * InsightCard — un insight « À regarder », cliquable vers la vue pré-filtrée.
 * L'icône encode la nature : € perdu (négatif), opportunité (accent violet),
 * alerte donnée (ambre). La flèche glisse de 4px au survol, la carte s'élève.
 * Montant d'impact en chiffres tabulaires gras.
 */
type Nature = "loss" | "opportunity" | "data";

const NATURE: Record<Nature, { icon: typeof Lightbulb; fg: string; bg: string; border: string }> = {
  loss: { icon: TrendingDown, fg: "var(--ecom-neg)", bg: "var(--ecom-neg-soft)", border: "color-mix(in srgb, var(--ecom-neg) 22%, white)" },
  opportunity: { icon: Lightbulb, fg: "var(--ecom-brand-violet)", bg: "var(--ecom-violet-light)", border: "color-mix(in srgb, var(--ecom-brand-violet) 22%, white)" },
  data: { icon: AlertTriangle, fg: "var(--ecom-warn)", bg: "var(--ecom-warn-soft)", border: "color-mix(in srgb, var(--ecom-warn) 22%, white)" },
};

export function InsightCard({
  nature,
  message,
  impact,
  href,
}: {
  nature: Nature;
  message: string;
  impact?: string;
  href: string;
}) {
  const n = NATURE[nature];
  const Icon = n.icon;
  return (
    <Link
      href={href as never}
      className="group flex items-start gap-3 rounded-[var(--ecom-r-md)] border px-3.5 py-3 transition-[transform,box-shadow] duration-[var(--ecom-t-fast)] ease-[var(--ecom-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--ecom-shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)]"
      style={{ background: n.bg, borderColor: n.border }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: n.fg }}><Icon size={16} /></span>
      <span className="flex-1 text-[var(--ecom-fs-label)] leading-snug text-[var(--ecom-navy)]">
        {message}
        {impact && <span className="ml-1.5 font-bold ecom-tnum" style={{ color: n.fg }}>({impact})</span>}
      </span>
      <ArrowRight
        size={15}
        className="mt-0.5 shrink-0 transition-transform duration-[var(--ecom-t-fast)] ease-[var(--ecom-ease-out)] group-hover:translate-x-1"
        style={{ color: n.fg }}
      />
    </Link>
  );
}
