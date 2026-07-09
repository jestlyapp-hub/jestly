"use client";

/**
 * Filtre de dates unifié du module ECOM. La période vit désormais dans le
 * contexte global EcomPrefsProvider (source unique de vérité) : elle survit à
 * la navigation entre onglets ET au rechargement (localStorage namespacé par
 * user), avec deep-link via l'URL (?from&to&pl). Aucune vue ne réinitialise
 * la période à son montage.
 */
import PeriodFilterDropdown from "@/components/facturation/PeriodFilterDropdown";
import type { PeriodFilter } from "@/lib/period-filter";
import { useEcomPrefs, type EcomRange } from "@/components/ecom/EcomPrefsProvider";
import { parisDaysAgo, todayParis } from "@/lib/paris-time";

export type AnalyticsRange = EcomRange;

/** Période courante du module — depuis le contexte global (persistant). */
export function useAnalyticsRange(): AnalyticsRange {
  return useEcomPrefs().range;
}

export default function AnalyticsPeriodFilter() {
  const { range, setRange } = useEcomPrefs();
  const value: PeriodFilter = { label: range.label, range: { start: range.from, end: range.to } };

  const onChange = (filter: PeriodFilter) => {
    if (filter.range) {
      setRange({ from: filter.range.start, to: filter.range.end, label: filter.label });
    } else {
      // Réinitialiser → défaut 30 jours (au sens de Paris).
      setRange({ from: parisDaysAgo(30), to: todayParis(), label: "30 derniers jours" });
    }
  };

  return <PeriodFilterDropdown value={value} onChange={onChange} />;
}
