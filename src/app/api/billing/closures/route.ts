import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const MONTH_LABELS = [
  "", "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// GET /api/billing/closures — list period closures
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_period_closures") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("period_year", { ascending: false })
    .order("period_month", { ascending: false })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/billing/closures — close a period
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { year, month, notes } = await req.json();
  if (!year || !month) {
    return NextResponse.json({ error: "year and month required" }, { status: 400 });
  }

  // Build period boundaries
  const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const periodEnd = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  // Fetch all billing items for this period
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase.from("billing_items") as any)
    .select("*, clients(name)")
    .eq("user_id", user.id)
    .gte("performed_at", periodStart)
    .lte("performed_at", periodEnd)
    .neq("status", "cancelled");

  const allItems = items || [];

  // Compute totals
  const totalHt = allItems.reduce((s: number, i: { total: number }) => s + Number(i.total || 0), 0);
  const totalTva = allItems.reduce((s: number, i: { tax_amount: number }) => s + Number(i.tax_amount || 0), 0);
  const totalTtc = allItems.reduce((s: number, i: { total_ttc: number }) => s + Number(i.total_ttc || 0), 0);

  // Count by status
  const statusCounts: Record<string, number> = {
    drafts: 0, to_validate: 0, validated: 0, ready: 0,
    exported: 0, invoiced: 0, cancelled: 0,
  };
  allItems.forEach((i: { status: string }) => {
    const key = i.status === "draft" ? "drafts" : i.status;
    if (key in statusCounts) statusCounts[key]++;
  });

  // Unique clients
  const clientMap = new Map<string, { id: string; name: string; total_ht: number }>();
  allItems.forEach((i: { client_id: string | null; clients: { name: string } | null; total: number }) => {
    if (!i.client_id) return;
    const existing = clientMap.get(i.client_id);
    if (existing) {
      existing.total_ht += Number(i.total || 0);
    } else {
      clientMap.set(i.client_id, {
        id: i.client_id,
        name: i.clients?.name || "Client inconnu",
        total_ht: Number(i.total || 0),
      });
    }
  });
  const topClients = Array.from(clientMap.values())
    .sort((a, b) => b.total_ht - a.total_ht)
    .slice(0, 10);

  // Categories
  const catMap = new Map<string, number>();
  allItems.forEach((i: { category: string | null; total: number }) => {
    const cat = i.category || "Sans catégorie";
    catMap.set(cat, (catMap.get(cat) || 0) + Number(i.total || 0));
  });
  const categories = Array.from(catMap.entries())
    .map(([name, total_ht]) => ({ name, total_ht }))
    .sort((a, b) => b.total_ht - a.total_ht);

  // Linked exports
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: exports } = await (supabase.from("billing_exports") as any)
    .select("id")
    .eq("user_id", user.id)
    .gte("period_start", periodStart)
    .lte("period_end", periodEnd);

  const exportIds = (exports || []).map((e: { id: string }) => e.id);

  const periodLabel = `${MONTH_LABELS[month]} ${year}`;

  // Upsert closure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_period_closures") as any)
    .upsert({
      user_id: user.id,
      period_year: year,
      period_month: month,
      period_label: periodLabel,
      total_ht: totalHt,
      total_tva: totalTva,
      total_ttc: totalTtc,
      item_count: allItems.length,
      client_count: clientMap.size,
      snapshot: {
        ...statusCounts,
        health_score: 0,
        anomaly_count: 0,
        top_clients: topClients,
        categories,
        export_ids: exportIds,
      },
      status: "closed",
      closed_at: new Date().toISOString(),
      reopened_at: null,
      notes: notes || null,
    }, {
      onConflict: "user_id,period_year,period_month",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
