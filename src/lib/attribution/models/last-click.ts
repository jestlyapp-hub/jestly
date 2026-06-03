import type { Touchpoint } from "../types";

/**
 * Last-click : 100 % du crédit au dernier touchpoint avant conversion.
 * Modèle par défaut historique de la plupart des plateformes Ads.
 */
export function lastClickWeights(touchpoints: Touchpoint[]): number[] {
  const n = touchpoints.length;
  if (n === 0) return [];
  const weights = new Array<number>(n).fill(0);
  weights[n - 1] = 1;
  return weights;
}
