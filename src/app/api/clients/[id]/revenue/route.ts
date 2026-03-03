import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/clients/[id]/revenue?months=12
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const monthsParam = Number(req.nextUrl.searchParams.get("months") || "12");

  // Fetch all orders for this client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase.from("orders") as any)
    .select("amount, paid, status, created_at")
    .eq("client_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const allOrders = orders || [];

  // Build monthly aggregation for last N months
  const now = new Date();
  const months: { month: string; revenue: number; orders: number }[] = [];

  for (let i = monthsParam - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthOrders = allOrders.filter((o: any) => {
      const oDate = new Date(o.created_at);
      return oDate.getFullYear() === d.getFullYear() && oDate.getMonth() === d.getMonth();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const revenue = monthOrders.filter((o: any) => o.paid).reduce((sum: number, o: any) => sum + Number(o.amount), 0);

    months.push({ month: label, revenue, orders: monthOrders.length });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPaid = allOrders.filter((o: any) => o.paid).reduce((sum: number, o: any) => sum + Number(o.amount), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalUnpaid = allOrders.filter((o: any) => !o.paid).reduce((sum: number, o: any) => sum + Number(o.amount), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidOrders = allOrders.filter((o: any) => o.paid);
  const averageOrderValue = paidOrders.length > 0 ? totalPaid / paidOrders.length : 0;

  return NextResponse.json({
    months,
    totalPaid,
    totalUnpaid,
    averageOrderValue,
  });
}
