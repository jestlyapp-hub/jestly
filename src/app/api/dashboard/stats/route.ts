import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/dashboard/stats — aggregated dashboard stats
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Run queries in parallel
  const [ordersRes, clientsRes, servicesRes, recentOrdersRes] = await Promise.all([
    // Total revenue + order count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("amount, status, created_at")
      .eq("user_id", user.id),
    // Client count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("clients") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    // Active products count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("products") as any)
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .eq("status", "active"),
    // Recent orders for activity feed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("id, title, amount, status, created_at, clients(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const orders = ordersRes.data || [];
  const totalRevenue = orders
    .filter((o: { status: string }) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum: number, o: { amount: number }) => sum + Number(o.amount), 0);
  const ordersCount = orders.length;
  const pendingOrders = orders.filter((o: { status: string }) => o.status === "new").length;

  // Monthly revenue (last 6 months)
  const now = new Date();
  const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthOrders = orders.filter((o: { created_at: string; status: string }) => {
      return o.created_at.startsWith(monthKey) && o.status !== "cancelled" && o.status !== "refunded";
    });
    monthlyRevenue.push({
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      revenue: monthOrders.reduce((s: number, o: { amount: number }) => s + Number(o.amount), 0),
      orders: monthOrders.length,
    });
  }

  return NextResponse.json({
    totalRevenue,
    ordersCount,
    pendingOrders,
    clientsCount: clientsRes.count ?? 0,
    activeProductsCount: servicesRes.count ?? 0,
    monthlyRevenue,
    recentOrders: recentOrdersRes.data || [],
  });
}
