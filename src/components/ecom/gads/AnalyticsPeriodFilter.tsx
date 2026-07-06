"use client";

/**
 * Filtre de dates unifié du module Analytics (passe qualité B1).
 * Réutilise le PeriodFilterDropdown de Jestly (Raccourcis / Mois / Trimestres /
 * Personnalisé) tel quel. La période vit dans l'URL (?from&to) : elle survit à
 * la navigation entre les onglets Analytics et pilote toutes les vues.
 * Réinitialiser = retour aux 30 derniers jours (au sens de Paris).
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PeriodFilterDropdown from "@/components/facturation/PeriodFilterDropdown";
import type { PeriodFilter } from "@/lib/period-filter";
import { parisDaysAgo, todayParis } from "@/lib/paris-time";

const DEFAULT_LABEL = "30 derniers jours";
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface AnalyticsRange {
  from: string;
  to: string;
  label: string;
}

/** Période courante du module — URL si présente, sinon 30 derniers jours. */
export function useAnalyticsRange(): AnalyticsRange {
  const sp = useSearchParams();
  const from = sp.get("from");
  const to = sp.get("to");
  if (from && to && DAY_RE.test(from) && DAY_RE.test(to) && from <= to) {
    return { from, to, label: sp.get("pl") ?? "Personnalisé" };
  }
  return { from: parisDaysAgo(30), to: todayParis(), label: DEFAULT_LABEL };
}

export default function AnalyticsPeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { from, to, label } = useAnalyticsRange();

  const value: PeriodFilter = { label, range: { start: from, end: to } };

  const onChange = (filter: PeriodFilter) => {
    const params = new URLSearchParams(sp.toString());
    if (filter.range) {
      params.set("from", filter.range.start);
      params.set("to", filter.range.end);
      params.set("pl", filter.label);
    } else {
      // Réinitialiser → défaut 30 jours
      params.delete("from");
      params.delete("to");
      params.delete("pl");
    }
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.replace>[0], { scroll: false });
  };

  return <PeriodFilterDropdown value={value} onChange={onChange} />;
}
