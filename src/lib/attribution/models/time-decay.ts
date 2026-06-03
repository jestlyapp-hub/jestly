import type { Touchpoint } from "../types";

/**
 * Time-decay : poids décroissant avec l'éloignement temporel de la conversion.
 * Décroissance exponentielle de demi-vie configurable (7 jours par défaut) :
 * un touchpoint à H-7j pèse deux fois moins qu'un touchpoint le jour J.
 */
export function timeDecayWeights(
  touchpoints: Touchpoint[],
  conversionAt: string,
  halfLifeDays = 7,
): number[] {
  const n = touchpoints.length;
  if (n === 0) return [];

  const conv = Date.parse(conversionAt);
  const raw = touchpoints.map((t) => {
    const deltaDays = (conv - Date.parse(t.occurred_at)) / 86_400_000;
    // Touchpoints postérieurs à la conversion (données incohérentes) ramenés à 0 jour.
    const days = Number.isFinite(deltaDays) ? Math.max(0, deltaDays) : 0;
    return Math.pow(2, -days / halfLifeDays);
  });

  const sum = raw.reduce((acc, v) => acc + v, 0);
  // Dégénérescence (toutes les dates invalides) : repli sur une répartition égale.
  if (sum <= 0) return new Array<number>(n).fill(1 / n);
  return raw.map((v) => v / sum);
}
