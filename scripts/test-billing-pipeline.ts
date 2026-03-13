/**
 * Test suite: Commandes → Facturation pipeline
 * Run: npx tsx scripts/test-billing-pipeline.ts
 *
 * Tests the centralized billing-utils functions that drive
 * the entire orders → billing pipeline.
 */

import {
  isOrderDelivered,
  getBillingPipelineStage,
  shouldOrderAppearInBilling,
  billingToOrderStatus,
  getManualBillingStage,
  getExcludedOrderStatuses,
} from "../src/lib/billing-utils";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

console.log("\n══════════════════════════════════════════════");
console.log("  Test Suite: Commandes → Facturation Pipeline");
console.log("══════════════════════════════════════════════\n");

// ─── CAS 1: "À faire" (new) → in_progress, pas dans "Prêtes" ───
console.log("CAS 1: Commande 'À faire' → en cours, pas dans Prêtes");
assert(getBillingPipelineStage("new") === "in_progress", "new → in_progress");
assert(getBillingPipelineStage("new") !== "ready", "new ≠ ready");
assert(shouldOrderAppearInBilling("new") === true, "new appears in billing");

// ─── CAS 2: "En cours" → in_progress en facturation ───
console.log("\nCAS 2: Commande 'En cours' → in_progress en facturation");
assert(getBillingPipelineStage("in_progress") === "in_progress", "in_progress → in_progress");
assert(shouldOrderAppearInBilling("in_progress") === true, "in_progress appears in billing");

// ─── CAS 3: "Livré" → auto dans "Prêtes" ───
console.log("\nCAS 3: Commande 'Livré' → auto dans Prêtes");
assert(getBillingPipelineStage("delivered") === "ready", "delivered → ready");
assert(shouldOrderAppearInBilling("delivered") === true, "delivered appears in billing");
assert(isOrderDelivered("delivered") === true, "delivered is delivered");

// ─── CAS 4: "Livré" → marquée facturée → dans "Facturées" ───
console.log("\nCAS 4: Transition Livré → Facturée");
assert(getBillingPipelineStage("invoiced") === "invoiced", "invoiced → invoiced");
assert(billingToOrderStatus("invoiced") === "invoiced", "billing invoiced → order invoiced");

// ─── CAS 5: "Facturée" → "Payée" → dans "Payées" ───
console.log("\nCAS 5: Transition Facturée → Payée");
assert(getBillingPipelineStage("paid") === "paid", "paid → paid");
assert(billingToOrderStatus("paid") === "paid", "billing paid → order paid");
assert(isOrderDelivered("paid") === true, "paid is considered delivered");

// ─── CAS 6: Vieux "Livré" avant migration → apparaît quand même ───
console.log("\nCAS 6: Vieux Livré (sans invoiced_at/paid_at) → apparaît");
assert(shouldOrderAppearInBilling("delivered") === true, "delivered always appears");
assert(getBillingPipelineStage("delivered") === "ready", "always maps to ready");

// ─── CAS 7: "Livré" sans champs secondaires → pas exclu ───
console.log("\nCAS 7: Livré sans champs secondaires → pas exclu silencieusement");
// The function only checks status, not secondary fields
assert(shouldOrderAppearInBilling("delivered") === true, "no secondary field check");
assert(getBillingPipelineStage("delivered") === "ready", "maps regardless of extra fields");

// ─── CAS 8: Filtres actifs → ne masquent pas les données ───
console.log("\nCAS 8: Tous les statuts de production ont un mapping billing");
const productionStatuses = ["new", "brief_received", "in_progress", "in_review", "validated", "delivered", "invoiced", "paid"];
for (const s of productionStatuses) {
  assert(getBillingPipelineStage(s) !== undefined, `${s} has a billing mapping`);
  assert(shouldOrderAppearInBilling(s) === true, `${s} appears in billing`);
}

// ─── CAS 9: Compteurs → cohérence ───
console.log("\nCAS 9: Compteurs cohérents — chaque statut a une unique catégorie billing");
const billingCategories = new Set(productionStatuses.map(s => getBillingPipelineStage(s)));
assert(billingCategories.size === 4, `4 billing categories exist: ${[...billingCategories].join(", ")}`);

// ─── CAS 10: Annulées/supprimées → exclues ───
console.log("\nCAS 10: Commandes annulées/supprimées → exclues proprement");
assert(shouldOrderAppearInBilling("cancelled") === false, "cancelled excluded");
assert(shouldOrderAppearInBilling("refunded") === false, "refunded excluded");
assert(shouldOrderAppearInBilling("dispute") === false, "dispute excluded");
const excluded = getExcludedOrderStatuses();
assert(excluded.length === 3, "exactly 3 excluded statuses");
assert(excluded.includes("cancelled"), "cancelled in excluded list");
assert(excluded.includes("refunded"), "refunded in excluded list");
assert(excluded.includes("dispute"), "dispute in excluded list");

// ─── BONUS: Reverse mapping ───
console.log("\nBONUS: Reverse mapping billing → order");
assert(billingToOrderStatus("in_progress") === "in_progress", "billing in_progress → order in_progress");
assert(billingToOrderStatus("ready") === "delivered", "billing ready → order delivered");
assert(billingToOrderStatus("invoiced") === "invoiced", "billing invoiced → order invoiced");
assert(billingToOrderStatus("paid") === "paid", "billing paid → order paid");

// ─── BONUS: Manual items mapping ───
console.log("\nBONUS: Manual billing items mapping");
assert(getManualBillingStage("draft") === "in_progress", "manual draft → in_progress");
assert(getManualBillingStage("ready") === "ready", "manual ready → ready");
assert(getManualBillingStage("exported") === "invoiced", "manual exported → invoiced");
assert(getManualBillingStage("invoiced") === "invoiced", "manual invoiced → invoiced");
assert(getManualBillingStage("paid") === "paid", "manual paid → paid");

// ─── BONUS: Unknown status fallback ───
console.log("\nBONUS: Statut inconnu → fallback in_progress");
assert(getBillingPipelineStage("unknown_custom_status") === "in_progress", "unknown → in_progress fallback");
assert(getManualBillingStage("weird_status") === "in_progress", "unknown manual → in_progress fallback");

// ─── Results ───
console.log("\n══════════════════════════════════════════════");
console.log(`  Résultats: ${passed} passés, ${failed} échoués`);
console.log("══════════════════════════════════════════════\n");

process.exit(failed > 0 ? 1 : 0);
