/** Helpers de formatage partagés des vues Google Ads. */
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { AggregatedProfitStatus } from "@/lib/ads/types";

export type Period = "7d" | "30d" | "90d";

/** Même convention que parseRange côté API : N jours glissants jusqu'à aujourd'hui. */
export function periodToRange(period: Period): { from: string; to: string } {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return { from, to };
}

export function formatDateFr(iso: string, pattern = "d MMM"): string {
  try {
    return format(parseISO(iso), pattern, { locale: fr });
  } catch {
    return iso;
  }
}

export const STATUS_LABELS: Record<AggregatedProfitStatus, { label: string; className: string }> = {
  profitable: { label: "Rentable", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warning: { label: "Zone limite", className: "bg-amber-50 text-amber-700 border-amber-200" },
  unprofitable: { label: "En perte", className: "bg-rose-50 text-rose-700 border-rose-200" },
  unmatched: { label: "Non attribué", className: "bg-[#F7F7F5] text-[#5A5A58] border-[#E5E3F0]" },
  insufficient_data: { label: "Données partielles", className: "bg-sky-50 text-sky-700 border-sky-200" },
};

export const TRACKING_LABELS: Record<string, { label: string; dot: string; description: string }> = {
  tracked: {
    label: "Trackées",
    dot: "bg-emerald-500",
    description: "Parcours client présent et attribution exploitable (utm, referrer ou gclid)",
  },
  ghost: {
    label: "Fantômes",
    dot: "bg-rose-500",
    description: "Parcours vide (momentsCount = 0) — non attribuables, ex. consentement refusé",
  },
  unmatched: {
    label: "Non rattachées",
    dot: "bg-amber-500",
    description: "Parcours présent mais aucun signal exploitable pour rattacher à une campagne",
  },
  unknown: {
    label: "Inconnues",
    dot: "bg-[#B4B4B2]",
    description: "Parcours pas encore disponible (commande à resynchroniser)",
  },
};
