"use client";

/**
 * Grille de KPI cards configurables du Dashboard. Rend les métriques choisies
 * (ordre utilisateur) groupées par section (ACQUISITION / RENTABILITÉ /
 * ATTRIBUTION), avec apparition en cascade (framer-motion, reduced-motion
 * respecté). Chaque carte garde tooltip formule, delta coloré et sparkline.
 * Donnée absente → « non disponible » (jamais inventée).
 */
import { motion, useReducedMotion } from "framer-motion";
import { KpiCard } from "@/components/ecom/premium/KpiCard";
import type { MetricValue } from "@/lib/gads/dashboard-metrics";
import {
  METRIC_CATALOG, SECTION_LABELS, SECTION_ORDER, formatMetric, metricDelta,
  type MetricDef, type MetricSection,
} from "@/lib/gads/metric-catalog";

const DEFAULT_HIGHLIGHT = ["be_roas", "net_profit"];
const SPARK_COLOR: Record<string, string> = { net_profit: "#0F9D6B" };

/**
 * Grille KPI configurable. Réutilisée par le Dashboard ET le détail campagne :
 * `catalog` (défaut = catalogue Dashboard) et `highlightIds` permettent au grain
 * campagne de passer ses propres métriques sans dupliquer le composant.
 */
export default function ConfigurableKpiGrid({
  metrics, selectedIds, catalog = METRIC_CATALOG, highlightIds = DEFAULT_HIGHLIGHT,
}: {
  metrics: Record<string, MetricValue>;
  selectedIds: string[];
  catalog?: MetricDef[];
  highlightIds?: string[];
}) {
  const reduce = useReducedMotion();
  const byId: Record<string, MetricDef> = Object.fromEntries(catalog.map((d) => [d.id, d]));
  const HIGHLIGHT = new Set(highlightIds);

  // Groupe en gardant l'ORDRE utilisateur à l'intérieur de chaque section.
  const grouped: Record<MetricSection, string[]> = { acquisition: [], rentabilite: [], attribution: [] };
  for (const id of selectedIds) {
    const def = byId[id];
    if (def) grouped[def.section].push(id);
  }

  let cardIndex = 0;

  return (
    <div className="space-y-4">
      {SECTION_ORDER.map((section) => {
        const ids = grouped[section];
        if (ids.length === 0) return null;
        return (
          <div key={section} className="space-y-2">
            <p className="ecom-label">{SECTION_LABELS[section]}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {ids.map((id) => {
                const def = byId[id];
                const mv = metrics[id];
                const i = cardIndex++;
                const available = mv?.available ?? false;
                const delta = mv ? metricDelta(mv.value, mv.previous) : null;
                const tone = id === "net_profit" && mv?.value != null
                  ? (mv.value >= 0 ? "positive" as const : "negative" as const)
                  : undefined;
                return (
                  <motion.div key={id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? undefined : { duration: 0.28, delay: Math.min(i * 0.035, 0.4), ease: [0.22, 1, 0.36, 1] }}>
                    <KpiCard
                      label={def.label}
                      value={available ? formatMetric(mv!.value, def.unit) : "non disponible"}
                      unset={!available}
                      delta={available ? delta : null}
                      goodWhenUp={def.goodWhenUp ?? false}
                      highlight={HIGHLIGHT.has(id)}
                      tone={tone}
                      tooltip={def.tooltip}
                      spark={available && mv?.series && mv.series.some((v) => v !== 0) ? mv.series : undefined}
                      sparkColor={SPARK_COLOR[id]}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
