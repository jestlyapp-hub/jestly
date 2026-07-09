"use client";

/**
 * Primitives d'affichage de l'onglet Campagnes — constantes dans toute la vue
 * (chips de statut, libellés de canal, pastille de rentabilité). DA Jestly :
 * violet #7C3AED, navy #1a1535, couleurs sémantiques pour la rentabilité.
 */
import type { DisplayCampaignStatus } from "@/lib/gads/campaign-analytics";

const STATUS_META: Record<DisplayCampaignStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  paused: { label: "En pause", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  ended: { label: "Terminée", cls: "bg-[#F1F1EF] text-[#8A8A88] border-[#E6E6E4]", dot: "bg-[#B4B4B2]" },
};

export function CampaignStatusChip({ status }: { status: DisplayCampaignStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold whitespace-nowrap ${m.cls}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/** Pastille de rentabilité (vs BE-ROAS). null = non calculable → neutre. */
export function ProfitabilityDot({ profitable, small }: { profitable: boolean | null; small?: boolean }) {
  if (profitable == null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#8A8A88]" title="Rentabilité non calculable (coûts non renseignés ou pas de dépense)">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4D4D2]" />—
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${profitable ? "text-emerald-700" : "text-rose-700"}`}
      title={small ? "Verdict à faible volume — peu significatif" : profitable ? "ROAS Jestly ≥ seuil de rentabilité (BE-ROAS)" : "ROAS Jestly < seuil de rentabilité (BE-ROAS)"}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${profitable ? "bg-emerald-500" : "bg-rose-500"}`} />
      {profitable ? "Rentable" : "En perte"}
    </span>
  );
}

/** Libellé lisible du type de canal Google (SEARCH, SHOPPING, PERFORMANCE_MAX…). */
export function channelTypeLabel(type: string | null): string {
  switch (type) {
    case "SEARCH": return "Réseau de recherche";
    case "SHOPPING": return "Shopping";
    case "PERFORMANCE_MAX": return "Performance Max";
    case "DISPLAY": return "Display";
    case "VIDEO": return "Vidéo";
    case "DEMAND_GEN": return "Demand Gen";
    case "MULTI_CHANNEL": return "Multicanal";
    default: return type ?? "—";
  }
}

/** Sparkline SVG nue (dépense) — sans dépendance, DA violet. */
export function Sparkline({ values, color = "#7C3AED" }: { values: number[]; color?: string }) {
  if (values.length < 2 || values.every((v) => v === 0)) {
    return <div className="h-6 flex items-center text-[10px] text-[#B4B4B2]">—</div>;
  }
  const max = Math.max(...values);
  const w = 100, h = 22;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-6" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
