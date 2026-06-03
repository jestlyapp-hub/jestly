import type { Touchpoint } from "../types";

/**
 * First-click : 100 % du crédit au premier touchpoint.
 * Met en avant les canaux d'acquisition (haut de funnel).
 */
export function firstClickWeights(touchpoints: Touchpoint[]): number[] {
  const n = touchpoints.length;
  if (n === 0) return [];
  const weights = new Array<number>(n).fill(0);
  weights[0] = 1;
  return weights;
}
