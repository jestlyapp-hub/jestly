import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/billing/exports — list persisted exports
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_exports") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/billing/exports — create export record + link items
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // ── Subscription guard: exports comptables = feature Pro+ ──
  const { checkFeatureAccess } = await import("@/lib/subscription-guard");
  const guard = await checkFeatureAccess(supabase, user.id, "accounting_exports");
  if (!guard.allowed) {
    return NextResponse.json(
      { error: guard.error, upgrade: guard.upgrade, quotaExceeded: true },
      { status: 403 },
    );
  }

  const body = await req.json();
  const {
    label, format, period_start, period_end,
    total_ht, total_tva, total_ttc, item_count,
    client_count, client_ids, filename, notes, item_ids,
  } = body;

  // Create export record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exportRow, error: eErr } = await (supabase.from("billing_exports") as any)
    .insert({
      user_id: user.id,
      label: label || null,
      format: format || "csv",
      period_start: period_start || null,
      period_end: period_end || null,
      total_ht: total_ht || 0,
      total_tva: total_tva || 0,
      total_ttc: total_ttc || 0,
      item_count: item_count || 0,
      client_count: client_count || 0,
      client_ids: client_ids || [],
      filename: filename || null,
      notes: notes || null,
      status: "completed",
    })
    .select("*")
    .single();

  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });

  // Link items to export
  if (item_ids && item_ids.length > 0) {
    const links = item_ids.map((itemId: string) => ({
      export_id: exportRow.id,
      item_id: itemId,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("billing_export_items") as any).insert(links);

    // Mark items as exported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("billing_items") as any)
      .update({ status: "exported" })
      .in("id", item_ids)
      .eq("user_id", user.id)
      .in("status", ["ready", "validated"]);
  }

  return NextResponse.json(exportRow, { status: 201 });
}
