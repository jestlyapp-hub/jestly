import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/analytics/summary — aggregated analytics for the dashboard
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    // Get revenue and order stats from orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orders } = await (supabase.from("orders") as any)
      .select("id, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const allOrders = orders || [];

    // Compute stats
    const totalRevenue = allOrders
      .filter((o: { status: string }) => o.status !== "cancelled")
      .reduce((sum: number, o: { amount: number }) => sum + (o.amount || 0), 0);
    const totalOrders = allOrders.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: clientCount } = await (supabase.from("clients") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Monthly revenue & orders for the last 6 months
    const months: { month: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleDateString("fr-FR", { month: "short" });
      const start = d.toISOString();
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

      const monthOrders = allOrders.filter(
        (o: { created_at: string }) => o.created_at >= start && o.created_at < end
      );
      months.push({
        month: monthKey,
        revenue: monthOrders
          .filter((o: { status: string }) => o.status !== "cancelled")
          .reduce((s: number, o: { amount: number }) => s + (o.amount || 0), 0),
        orders: monthOrders.length,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      clientCount: clientCount || 0,
      avgBasket,
      months,
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
