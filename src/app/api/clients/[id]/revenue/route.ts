import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

const EXCLUDED = ["cancelled", "refunded", "dispute"];
const PAID_STATUSES = ["paid", "invoiced"];

// GET /api/clients/[id]/revenue?months=12
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const monthsParam = Number(req.nextUrl.searchParams.get("months") || "12");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("amount, paid, status, created_at")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const allOrders: { amount: number; paid: boolean; status: string; created_at: string }[] = orders || [];
  const activeOrders = allOrders.filter((o) => !EXCLUDED.includes(o.status));

  // Monthly aggregation
  const now = new Date();
  const months: { month: string; revenue: number; orders: number }[] = [];

  for (let i = monthsParam - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
    const monthOrders = activeOrders.filter((o) => {
      const oDate = new Date(o.created_at);
      return oDate.getFullYear() === d.getFullYear() && oDate.getMonth() === d.getMonth();
    });
    const revenue = monthOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    months.push({ month: label, revenue, orders: monthOrders.length });
  }

  // CA total = toutes les commandes actives (hors cancelled/refunded/dispute)
  const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Encaissé = commandes payées/facturées
  const totalPaid = activeOrders
    .filter((o) => o.paid || PAID_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  // Impayé = CA total - encaissé
  const totalUnpaid = totalRevenue - totalPaid;

  // Panier moyen = CA total / nombre de commandes actives
  const averageOrderValue = activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

  return NextResponse.json({
    months,
    totalRevenue,
    totalPaid,
    totalUnpaid,
    averageOrderValue,
    ordersCount: activeOrders.length,
  });
}
