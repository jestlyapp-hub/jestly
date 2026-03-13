import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import {
  getBillingPipelineStage,
  getManualBillingStage,
  isOrderDelivered,
  shouldOrderAppearInBilling,
} from "@/lib/billing-utils";

/**
 * GET /api/billing/pipeline
 *
 * Returns a unified billing pipeline merging:
 * 1. Orders (primary source) — mapped to billing statuses
 * 2. Manual/recurring billing_items (secondary) — where order_id IS NULL
 *
 * RESILIENCE: if billing_items table doesn't exist or errors,
 * the pipeline still returns orders (primary flow must never break).
 */

export async function GET(req: NextRequest) {
  const isDebug = req.nextUrl.searchParams.get("debug") === "1";
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const debug: Record<string, unknown> = {};

  // ── 1. Fetch ALL user orders ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrders, error: oErr } = await (supabase.from("orders") as any)
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (oErr) {
    console.error("[pipeline] Orders query FAILED:", oErr.message);
    return NextResponse.json({ error: oErr.message }, { status: 500 });
  }

  debug.rawOrdersCount = rawOrders?.length ?? 0;

  // ── 2. Filter excluded statuses in JS ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = (rawOrders || []).filter((o: any) =>
    shouldOrderAppearInBilling(o.status)
  );

  debug.filteredOrdersCount = orders.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug.ordersSummary = orders.map((o: any) => ({
    id: o.id,
    title: o.title,
    status: o.status,
    billingStage: getBillingPipelineStage(o.status),
    shouldAppear: shouldOrderAppearInBilling(o.status),
    client_id: o.client_id,
    amount: o.amount,
    created_at: o.created_at,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excluded = (rawOrders || []).filter((o: any) => !shouldOrderAppearInBilling(o.status));
  debug.excludedOrders = excluded.map((o: { id: string; title: string; status: string }) => ({
    id: o.id,
    title: o.title,
    status: o.status,
    reason: `status "${o.status}" is in excluded list`,
  }));

  console.log(`[pipeline] user=${user.id} | raw=${rawOrders?.length ?? 0} | filtered=${orders.length} | excluded=${excluded.length}`);

  // ── 3. Fetch manual/recurring billing_items (RESILIENT — non-fatal if table missing) ──
  let manualItems: unknown[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: mErr } = await (supabase.from("billing_items") as any)
      .select("*, clients(name, email)")
      .eq("user_id", user.id)
      .is("order_id", null)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    if (mErr) {
      console.warn("[pipeline] billing_items query failed (non-fatal):", mErr.message);
      debug.billingItemsError = mErr.message;
    } else {
      manualItems = data || [];
    }
  } catch (e) {
    console.warn("[pipeline] billing_items query threw (non-fatal):", e);
    debug.billingItemsError = String(e);
  }

  debug.manualItemsCount = manualItems.length;

  // ── 4. Map orders to pipeline items ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderItems = orders.map((o: any) => ({
    id: o.id,
    type: "order",
    title: o.title,
    clientId: o.client_id,
    clientName: o.clients?.name || null,
    amount: Number(o.amount || 0),
    taxRate: 0,
    taxAmount: 0,
    totalTtc: Number(o.amount || 0),
    billingStatus: getBillingPipelineStage(o.status),
    orderStatus: o.status,
    priority: o.priority,
    createdAt: o.created_at,
    deadline: o.deadline,
    deliveredAt: isOrderDelivered(o.status)
      ? o.updated_at?.split("T")[0] || null
      : null,
    invoicedAt: o.invoiced_at || null,
    paidAt: o.paid_at || null,
    category: o.category || "",
    tags: o.tags || [],
    notes: o.notes || "",
    source: "order",
  }));

  // ── 5. Map manual items to pipeline items ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manualPipelineItems = manualItems.map((i: any) => ({
    id: i.id,
    type: i.recurring ? "recurring" : "manual",
    title: i.title,
    clientId: i.client_id,
    clientName: i.clients?.name || null,
    amount: Number(i.total || 0),
    taxRate: Number(i.tax_rate || 0),
    taxAmount: Number(i.tax_amount || 0),
    totalTtc: Number(i.total_ttc || 0),
    billingStatus: getManualBillingStage(i.status),
    orderStatus: null,
    priority: null,
    createdAt: i.created_at,
    deadline: null,
    deliveredAt: i.delivered_at || null,
    invoicedAt: i.status === "invoiced" || i.status === "exported" ? i.updated_at?.split("T")[0] : null,
    paidAt: i.paid_at || null,
    category: i.category || "",
    tags: i.tags || [],
    notes: i.notes || "",
    source: i.source || "manual",
    quantity: Number(i.quantity || 1),
    unit: i.unit || "unité",
    unitPrice: Number(i.unit_price || 0),
    description: i.description || "",
    billingItemId: i.id,
  }));

  // ── 6. Merge and sort ──
  const pipeline = [...orderItems, ...manualPipelineItems];
  pipeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  debug.pipelineCount = pipeline.length;
  const breakdown = {
    in_progress: pipeline.filter(p => p.billingStatus === "in_progress").length,
    ready: pipeline.filter(p => p.billingStatus === "ready").length,
    invoiced: pipeline.filter(p => p.billingStatus === "invoiced").length,
    paid: pipeline.filter(p => p.billingStatus === "paid").length,
  };
  debug.byBillingStatus = breakdown;

  console.log(`[pipeline] final=${pipeline.length} | orders=${orderItems.length} | manual=${manualPipelineItems.length}`);
  console.log(`[pipeline] breakdown: in_progress=${breakdown.in_progress} ready=${breakdown.ready} invoiced=${breakdown.invoiced} paid=${breakdown.paid}`);

  // Debug mode: return object with debug info. Normal: return array only.
  if (isDebug) {
    return NextResponse.json({ pipeline, _debug: debug });
  }
  return NextResponse.json(pipeline);
}
