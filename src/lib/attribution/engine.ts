/**
 * Moteur d'attribution multi-touch.
 *
 * Applique un modèle d'attribution à la timeline de touchpoints d'une commande
 * et répartit le revenu en centimes de façon exacte (la somme des centimes
 * attribués est strictement égale au total de la commande, sans perte d'arrondi).
 */
import type {
  AttributionModelKey,
  AttributionResult,
  Touchpoint,
  WeightedTouchpoint,
} from "./types";
import { lastClickWeights } from "./models/last-click";
import { firstClickWeights } from "./models/first-click";
import { linearWeights } from "./models/linear";
import { timeDecayWeights } from "./models/time-decay";
import { positionBasedWeights } from "./models/position-based";

/** Trie les touchpoints par date croissante (stable). */
export function sortTouchpoints(touchpoints: Touchpoint[]): Touchpoint[] {
  return [...touchpoints]
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      const da = Date.parse(a.t.occurred_at);
      const db = Date.parse(b.t.occurred_at);
      if (da !== db) return da - db;
      return a.i - b.i; // stabilité sur dates égales
    })
    .map(({ t }) => t);
}

export function computeWeights(
  model: AttributionModelKey,
  touchpoints: Touchpoint[],
  conversionAt: string,
): number[] {
  switch (model) {
    case "last_click":
      return lastClickWeights(touchpoints);
    case "first_click":
      return firstClickWeights(touchpoints);
    case "linear":
      return linearWeights(touchpoints);
    case "time_decay":
      return timeDecayWeights(touchpoints, conversionAt);
    case "position_based":
      return positionBasedWeights(touchpoints);
    default: {
      // Exhaustivité vérifiée à la compilation.
      const _exhaustive: never = model;
      return _exhaustive;
    }
  }
}

/**
 * Répartit `totalCents` selon `weights` (somme ~1) en garantissant que la somme
 * des entiers retournés vaut exactement `totalCents`. Méthode du plus grand reste.
 */
export function distributeCents(totalCents: number, weights: number[]): number[] {
  const n = weights.length;
  if (n === 0) return [];
  const weightSum = weights.reduce((acc, w) => acc + w, 0);
  if (weightSum <= 0) {
    // Aucun poids exploitable : tout au dernier touchpoint par convention.
    const out = new Array<number>(n).fill(0);
    out[n - 1] = totalCents;
    return out;
  }

  const exact = weights.map((w) => (totalCents * w) / weightSum);
  const floors = exact.map((v) => Math.floor(v));
  let remainder = totalCents - floors.reduce((acc, v) => acc + v, 0);

  // Distribue le reste aux plus grandes parties fractionnaires.
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  const out = [...floors];
  for (let k = 0; k < order.length && remainder > 0; k += 1) {
    out[order[k]!.i] += 1;
    remainder -= 1;
  }
  return out;
}

export interface AttributeOrderParams {
  model: AttributionModelKey;
  orderId: string;
  orderTotalCents: number;
  currency: string;
  conversionAt: string;
  touchpoints: Touchpoint[];
}

export function attributeOrder(params: AttributeOrderParams): AttributionResult {
  const { model, orderId, orderTotalCents, currency, conversionAt } = params;
  const sorted = sortTouchpoints(params.touchpoints);
  const weights = computeWeights(model, sorted, conversionAt);
  const cents = distributeCents(orderTotalCents, weights);

  const weighted: WeightedTouchpoint[] = sorted.map((t, i) => ({
    ...t,
    weight: weights[i] ?? 0,
    attributed_cents: cents[i] ?? 0,
  }));

  const attributed_channels: Record<string, number> = {};
  for (const t of weighted) {
    attributed_channels[t.channel] = (attributed_channels[t.channel] ?? 0) + t.attributed_cents;
  }

  return {
    model,
    order_id: orderId,
    order_total_cents: orderTotalCents,
    currency,
    touchpoints: weighted,
    attributed_channels,
  };
}
