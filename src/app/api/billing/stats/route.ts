import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/billing/stats — KPIs for the billing cockpit
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items, error } = await (supabase.from("billing_items") as any)
    .select("status, total, total_ttc, client_id, performed_at")
    .eq("user_id", user.id)
    .neq("status", "cancelled");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  let totalHt = 0;
  let totalTtc = 0;
  let readyHt = 0;
  let readyTtc = 0;
  let exportedHt = 0;
  let invoicedHt = 0;
  let monthHt = 0;
  const clientIds = new Set<string>();
  let itemCount = 0;
  let draftCount = 0;
  let readyCount = 0;

  for (const item of items ?? []) {
    const ht = Number(item.total) || 0;
    const ttc = Number(item.total_ttc) || 0;

    totalHt += ht;
    totalTtc += ttc;
    itemCount++;

    if (item.client_id) clientIds.add(item.client_id);

    // Month filter
    const perf = item.performed_at;
    if (perf && perf >= monthStart && perf <= monthEnd) {
      monthHt += ht;
    }

    switch (item.status) {
      case "draft":
      case "to_validate":
        draftCount++;
        break;
      case "validated":
      case "ready":
        readyHt += ht;
        readyTtc += ttc;
        readyCount++;
        break;
      case "exported":
        exportedHt += ht;
        break;
      case "invoiced":
        invoicedHt += ht;
        break;
    }
  }

  return NextResponse.json({
    totalHt,
    totalTtc,
    readyHt,
    readyTtc,
    exportedHt,
    invoicedHt,
    monthHt,
    activeClients: clientIds.size,
    itemCount,
    draftCount,
    readyCount,
  });
}
