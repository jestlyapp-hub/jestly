import type { Touchpoint } from "../types";

/**
 * Linéaire : crédit réparti à parts égales sur tous les touchpoints.
 */
export function linearWeights(touchpoints: Touchpoint[]): number[] {
  const n = touchpoints.length;
  if (n === 0) return [];
  return new Array<number>(n).fill(1 / n);
}
