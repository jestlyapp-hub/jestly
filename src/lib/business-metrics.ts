// ═══════════════════════════════════════════════════════════
// BUSINESS METRICS — Source de vérité unique
//
// Pipeline de commandes : CA total / En cours / Prêtes
// Utilisé par Dashboard, Commandes, Analytics.
// ═══════════════════════════════════════════════════════════

import type { OrderStatus } from "@/types";
import {
  shouldOrderAppearInBilling,
  getBillingPipelineStage,
} from "./billing-utils";

// ── Types ──

export interface PipelineSummary {
  /** CA total — somme de toutes les commandes actives (non annulées/remboursées/litige) */
  totalRevenue: number;
  /** Nombre total de commandes actives */
  totalCount: number;
  /** Montant des commandes en cours de production (new, brief_received, in_progress, in_review, validated) */
  inProgressRevenue: number;
  /** Nombre de commandes en production */
  inProgressCount: number;
  /** Montant des commandes prêtes à facturer (delivered) */
  readyRevenue: number;
  /** Nombre de commandes prêtes à facturer */
  readyCount: number;
}

// ═══════════════════════════════════════════════════════════
// DÉFINITION UNIQUE DU REVENU (source de vérité pour toute l'app)
//
// Revenue = commandes réellement payées/livrées/facturées
// Utilisé par : analytics/summary, analytics/advanced, dashboard/revenue
// ═══════════════════════════════════════════════════════════

/** Statuts comptabilisés comme revenu réel (payé/facturé/livré) */
export const REVENUE_STATUSES = ["paid", "invoiced", "delivered"] as const;

/** Statuts exclus de tout calcul (annulées/remboursées/litige) */
export const EXCLUDED_STATUSES = ["cancelled", "refunded", "dispute"] as const;

/** Vérifie si une commande compte comme revenu */
export const isRevenueOrder = (status: string): boolean =>
  (REVENUE_STATUSES as readonly string[]).includes(status);

/** Vérifie si une commande est exclue */
export const isExcludedOrder = (status: string): boolean =>
  (EXCLUDED_STATUSES as readonly string[]).includes(status);

/** Date de référence pour le revenu : paid_at si disponible, sinon created_at */
export const getOrderDate = (order: { paid_at?: string | null; created_at: string }): string =>
  order.paid_at || order.created_at;

// ── Statuts métier pipeline (basés sur billing-utils.ts) ──
// "in_progress" pipeline = new, brief_received, in_progress, in_review, validated
// "ready" pipeline       = delivered
// "invoiced"/"paid"      = déjà facturées — incluses dans CA total mais pas dans "en cours" ni "prêtes"
// "cancelled"/"refunded"/"dispute" = exclues

const IN_PROGRESS_STATUSES: Set<OrderStatus> = new Set([
  "new",
  "brief_received",
  "in_progress",
  "in_review",
  "validated",
]);

const READY_STATUSES: Set<OrderStatus> = new Set([
  "delivered",
]);

// ── Compute ──

/**
 * Calcule la synthèse pipeline des commandes.
 * Accepte un tableau d'objets avec au minimum { status, amount|price }.
 *
 * Fonctionne avec :
 * - les OrderRow API (amount en euros)
 * - les Order frontend (price en euros)
 */
export function computeOrdersPipelineSummary(
  orders: { status: string; amount?: number; price?: number }[],
): PipelineSummary {
  let totalRevenue = 0;
  let totalCount = 0;
  let inProgressRevenue = 0;
  let inProgressCount = 0;
  let readyRevenue = 0;
  let readyCount = 0;

  for (const o of orders) {
    // Exclure annulées / remboursées / litiges
    if (!shouldOrderAppearInBilling(o.status)) continue;

    const amt = Number(o.amount ?? o.price) || 0;

    totalRevenue += amt;
    totalCount += 1;

    const st = o.status as OrderStatus;
    if (IN_PROGRESS_STATUSES.has(st)) {
      inProgressRevenue += amt;
      inProgressCount += 1;
    } else if (READY_STATUSES.has(st)) {
      readyRevenue += amt;
      readyCount += 1;
    }
    // invoiced + paid = comptés dans CA total mais ni en cours ni prêtes
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCount,
    inProgressRevenue: Math.round(inProgressRevenue * 100) / 100,
    inProgressCount,
    readyRevenue: Math.round(readyRevenue * 100) / 100,
    readyCount,
  };
}

// ── Format helpers ──

/** Format euro FR standard : "3 644,70 €" */
export function fmtEurPipeline(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
