import type { OrderStatus } from "@/types";

// ─── Billing Pipeline Status ─────────────────────────────────────
export type BillingPipelineStatus = "in_progress" | "ready" | "invoiced" | "paid";

// ─── Order statuses excluded from billing ─────────────────────────
const EXCLUDED_ORDER_STATUSES: OrderStatus[] = ["cancelled", "refunded", "dispute"];

// ─── Order → Billing mapping (single source of truth) ─────────────
const ORDER_TO_BILLING: Record<OrderStatus, BillingPipelineStatus> = {
  new: "in_progress",
  brief_received: "in_progress",
  in_progress: "in_progress",
  in_review: "in_progress",
  validated: "in_progress",
  delivered: "ready",
  invoiced: "invoiced",
  paid: "paid",
  // Terminal statuses — mapped but filtered out before reaching pipeline
  cancelled: "in_progress",
  refunded: "in_progress",
  dispute: "in_progress",
};

// ─── Billing → Order reverse mapping (for status transitions) ─────
const BILLING_TO_ORDER: Record<BillingPipelineStatus, OrderStatus> = {
  in_progress: "in_progress",
  ready: "delivered",
  invoiced: "invoiced",
  paid: "paid",
};

// ─── Manual billing_items status → Billing pipeline ───────────────
const MANUAL_TO_BILLING: Record<string, BillingPipelineStatus> = {
  draft: "in_progress",
  to_validate: "in_progress",
  validated: "in_progress",
  ready: "ready",
  exported: "invoiced",
  invoiced: "invoiced",
  paid: "paid",
};

// ─── Public API ───────────────────────────────────────────────────

/** Returns true if an order is in a "delivered or later" status */
export function isOrderDelivered(status: string): boolean {
  return status === "delivered" || status === "invoiced" || status === "paid";
}

/** Returns the billing pipeline stage for a given order status */
export function getBillingPipelineStage(orderStatus: string): BillingPipelineStatus {
  return ORDER_TO_BILLING[orderStatus as OrderStatus] || "in_progress";
}

/** Returns true if an order should appear in the billing pipeline */
export function shouldOrderAppearInBilling(orderStatus: string): boolean {
  return !EXCLUDED_ORDER_STATUSES.includes(orderStatus as OrderStatus);
}

/** Returns the order status corresponding to a billing pipeline stage */
export function billingToOrderStatus(billingStatus: BillingPipelineStatus): OrderStatus {
  return BILLING_TO_ORDER[billingStatus];
}

/** Returns the billing pipeline stage for a manual billing_item status */
export function getManualBillingStage(itemStatus: string): BillingPipelineStatus {
  return MANUAL_TO_BILLING[itemStatus] || "in_progress";
}

/** Returns the list of order statuses excluded from billing (for DB queries) */
export function getExcludedOrderStatuses(): string[] {
  return [...EXCLUDED_ORDER_STATUSES];
}
