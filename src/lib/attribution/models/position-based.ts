import type { Touchpoint } from "../types";

/**
 * Position-based (en U) : 40 % au premier touchpoint, 40 % au dernier,
 * 20 % répartis également sur les touchpoints intermédiaires.
 *
 * Cas limites :
 *  - 1 touchpoint  : 100 %
 *  - 2 touchpoints : 50 % / 50 %
 */
export function positionBasedWeights(touchpoints: Touchpoint[]): number[] {
  const n = touchpoints.length;
  if (n === 0) return [];
  if (n === 1) return [1];
  if (n === 2) return [0.5, 0.5];

  const weights = new Array<number>(n).fill(0);
  weights[0] = 0.4;
  weights[n - 1] = 0.4;
  const middleShare = 0.2 / (n - 2);
  for (let i = 1; i < n - 1; i += 1) weights[i] = middleShare;
  return weights;
}
